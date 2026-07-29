import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(repoRoot, ".site-dist");
const errors = [];
const { projects } = await import(new URL("../_site-src/data/projects.ts", import.meta.url));
const { claimRegister, credentials } = await import(
  new URL("../_site-src/data/site.ts", import.meta.url)
);
const { maximumAttachmentBytes, validateAttachmentMetadata } = await import(
  new URL("../_site-src/scripts/contact-validation.ts", import.meta.url)
);
const deployScript = readFileSync(join(repoRoot, "deploy.sh"), "utf8");
const contactScript = readFileSync(join(repoRoot, "_site-src/scripts/portrait-home.ts"), "utf8");

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(relativePath) {
  const absolutePath = join(distRoot, relativePath);
  assert(existsSync(absolutePath), `Missing build output: ${relativePath}`);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function isDownloadableExecutionArtifact(artifact) {
  return Boolean(artifact?.download && artifact.proofValue === "execution");
}

assert(existsSync(distRoot), "Build directory .site-dist does not exist.");
assert(existsSync(join(distRoot, ".nojekyll")), "Build output must include .nojekyll.");
assert(validateAttachmentMetadata(null).valid, "An empty attachment must remain optional.");
assert(
  validateAttachmentMetadata({ name: "ticket.txt", size: 1024 }).valid,
  "An allowlisted attachment must pass validation."
);
assert(
  !validateAttachmentMetadata({ name: "script.ts", size: 1024 }).valid,
  "An unsupported attachment extension must fail validation."
);
assert(
  !validateAttachmentMetadata({ name: "large.pdf", size: maximumAttachmentBytes + 1 }).valid,
  "An attachment over 10 MB must fail validation."
);
assert(
  /\bwork\.html\b/.test(deployScript) &&
    /\bmessage-sent\.html\b/.test(deployScript) &&
    /\bwork\s+work-assets\b/.test(deployScript),
  "deploy.sh must stage the work index, message confirmation, generated routes, and their public assets."
);

const projectSlugs = new Set();
const publisherHosts = new Map([
  ["Microsoft Learn", "learn.microsoft.com"],
  ["Microsoft Support", "support.microsoft.com"],
  ["Apple Platform Deployment", "support.apple.com"],
  ["Dell Support", "www.dell.com"]
]);

for (const project of projects) {
  assert(!projectSlugs.has(project.slug), `Duplicate project slug: ${project.slug}.`);
  projectSlugs.add(project.slug);

  const claimIds = new Set(project.claims.map((claim) => claim.id));
  const evidenceIds = new Set(project.evidence.map((artifact) => artifact.id));
  const evidenceById = new Map(project.evidence.map((artifact) => [artifact.id, artifact]));
  const sourceIds = new Set((project.sources ?? []).map((source) => source.id));

  assert(claimIds.size === project.claims.length, `${project.slug} has duplicate claim IDs.`);
  assert(evidenceIds.size === project.evidence.length, `${project.slug} has duplicate evidence IDs.`);
  assert(sourceIds.size === (project.sources ?? []).length, `${project.slug} has duplicate source IDs.`);

  for (const claim of project.claims) {
    for (const evidenceRef of claim.evidenceRefs) {
      assert(evidenceIds.has(evidenceRef), `${project.slug} claim ${claim.id} has an invalid evidence reference: ${evidenceRef}.`);
    }
    for (const sourceRef of claim.sourceRefs ?? []) {
      assert(sourceIds.has(sourceRef), `${project.slug} claim ${claim.id} has an invalid source reference: ${sourceRef}.`);
    }
    if (claim.verification === "source-cited") {
      assert(
        (claim.sourceRefs ?? []).length > 0,
        `${project.slug} source-cited claim ${claim.id} has no supporting source reference.`
      );
    }
    if (["verified", "lab-demonstrated"].includes(claim.verification)) {
      assert(
        claim.evidenceRefs.some((evidenceRef) =>
          isDownloadableExecutionArtifact(evidenceById.get(evidenceRef))
        ),
        `${project.slug} claim ${claim.id} has no downloadable execution-proof artifact.`
      );
    }
  }

  for (const artifact of project.evidence) {
    for (const claimId of artifact.claimIds) {
      assert(claimIds.has(claimId), `${project.slug} artifact ${artifact.id} has an invalid claim reference: ${claimId}.`);
    }
    if (artifact.src) {
      assert(Boolean(artifact.alt), `${project.slug} artifact ${artifact.id} has an image without alternative text.`);
      assert(
        Number.isFinite(artifact.width) && Number.isFinite(artifact.height),
        `${project.slug} artifact ${artifact.id} has no intrinsic image dimensions.`
      );
    }
    if (artifact.download) {
      const publicArtifactPath = join(distRoot, artifact.download.replace(/^\//, ""));
      assert(
        artifact.download.startsWith("/work-assets/"),
        `${project.slug} artifact ${artifact.id} has a download outside the public evidence directory.`
      );
      assert(
        existsSync(publicArtifactPath),
        `${project.slug} artifact ${artifact.id} points to a missing download: ${artifact.download}.`
      );
      if (artifact.sha256 && existsSync(publicArtifactPath)) {
        const actualSha256 = createHash("sha256")
          .update(readFileSync(publicArtifactPath))
          .digest("hex");
        assert(
          actualSha256 === artifact.sha256,
          `${project.slug} artifact ${artifact.id} does not match its declared SHA-256.`
        );
      }
    }
    if (isDownloadableExecutionArtifact(artifact)) {
      assert(
        ["captured", "derived"].includes(artifact.origin),
        `${project.slug} downloadable execution artifact ${artifact.id} must have captured or derived origin.`
      );
      if (["E3", "E4"].includes(project.status.evidenceLevel)) {
        assert(
          /^[a-f0-9]{64}$/i.test(artifact.sha256 ?? ""),
          `${project.slug} downloadable execution artifact ${artifact.id} must declare a valid SHA-256 at ${project.status.evidenceLevel}.`
        );
      }
    }
    if (artifact.origin === "generated") {
      assert(artifact.role === "generated-illustration", `${project.slug} generated artifact ${artifact.id} has the wrong role.`);
      assert(artifact.proofValue === "explanation", `${project.slug} generated artifact ${artifact.id} is presented as execution proof.`);
      assert(artifact.claimIds.length === 0, `${project.slug} generated artifact ${artifact.id} supports a public claim.`);
    }
  }

  if (project.visualization) {
    const nodeIds = new Set(project.visualization.nodes.map((node) => node.id));
    const stateIds = new Set(project.visualization.states.map((state) => state.id));
    assert(nodeIds.size === project.visualization.nodes.length, `${project.slug} visualization has duplicate node IDs.`);
    assert(stateIds.size === project.visualization.states.length, `${project.slug} visualization has duplicate state IDs.`);
    assert(project.visualization.states.length >= 2, `${project.slug} visualization has fewer than two states.`);
    for (const state of project.visualization.states) {
      for (const nodeId of Object.keys(state.nodeStates)) {
        assert(nodeIds.has(nodeId), `${project.slug} visualization state ${state.id} references an unknown node: ${nodeId}.`);
      }
      for (const artifactId of state.artifactIds) {
        assert(evidenceIds.has(artifactId), `${project.slug} visualization state ${state.id} references an unknown artifact: ${artifactId}.`);
      }
    }
  }

  for (const source of project.sources ?? []) {
    const expectedHost = publisherHosts.get(source.publisher);
    assert(Boolean(expectedHost), `${project.slug} has an unsupported source publisher: ${source.publisher}.`);
    let host = "";
    try {
      host = new URL(source.url).hostname;
    } catch {
      assert(false, `${project.slug} source ${source.id} has an invalid URL.`);
    }
    assert(host === expectedHost, `${project.slug} source ${source.id} publisher does not match ${host}.`);
  }

  if (project.releaseState === "withheld") {
    assert(project.status.publication === "Withheld", `${project.slug} is withheld without a withheld publication status.`);
    assert(project.status.evidenceLevel === "E0", `${project.slug} is withheld without E0 evidence.`);
    assert(project.claims.length === 0, `${project.slug} is withheld but still has public claims.`);
    assert(project.evidence.length === 0, `${project.slug} is withheld but still has public evidence.`);
  }

  if (project.kind === "technical-note") {
    assert(project.releaseState === "published", `${project.slug} technical note is not in the published set.`);
    assert(project.tier === "technical-note", `${project.slug} has the wrong technical-note tier.`);
    assert(project.status.completion === "Research note", `${project.slug} has an unsupported completion status.`);
    assert(project.status.execution === "Not an executed lab", `${project.slug} implies runtime execution.`);
    assert(project.status.publication === "Cited sources and labelled aids", `${project.slug} has the wrong publication status.`);
    assert(project.status.evidenceLevel === "source-cited", `${project.slug} must use source-cited evidence.`);
    assert((project.sources ?? []).length >= 2, `${project.slug} must cite at least two primary sources.`);
    for (const claim of project.claims) {
      assert(claim.verification === "source-cited", `${project.slug} contains a non-source-cited claim.`);
    }
    for (const artifact of project.evidence) {
      assert(artifact.role === "deterministic-illustration", `${project.slug} artifact ${artifact.id} has a misleading evidence role.`);
      assert(artifact.privacyClass === "public-sanitized", `${project.slug} artifact ${artifact.id} is not public-sanitized.`);
    }
  }

  if (project.kind === "executed-lab" && project.releaseState === "published") {
    assert(project.status.completion === "Complete within stated scope", `${project.slug} published lab is not complete within scope.`);
    assert(project.status.publication === "Selected evidence on this page", `${project.slug} published lab has the wrong evidence status.`);
    assert(["E2", "E3", "E4"].includes(project.status.evidenceLevel), `${project.slug} published lab has an unsupported evidence level.`);
    assert(
      project.evidence.some(isDownloadableExecutionArtifact),
      `${project.slug} published lab has no downloadable execution-proof artifact.`
    );
  }
}

const dhcpProject = projects.find((project) => project.slug === "dhcp-failure-isolation");
const dhcpStates = new Map(
  (dhcpProject?.visualization?.states ?? []).map((state) => [state.id, state.artifactIds])
);
for (const [stateId, artifactId] of [
  ["no-offer", "dhcp-no-offer"],
  ["wrong-options", "dhcp-wrong-options"],
  ["two-servers", "dhcp-faults"]
]) {
  assert(
    dhcpStates.get(stateId)?.includes(artifactId),
    `DHCP visualization state ${stateId} is not mapped to ${artifactId}.`
  );
}

const home = read("index.html");
const resume = read("resume.html");
const work = read("work.html");
const messageSent = read("message-sent.html");
const notFound = read("404.html");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const cname = read("CNAME").trim();

for (const [name, html] of [
  ["index.html", home],
  ["work.html", work],
  ["resume.html", resume],
  ["message-sent.html", messageSent],
  ["404.html", notFound]
]) {
  assert((html.match(/<h1[\s>]/g) || []).length === 1, `${name} must contain exactly one h1.`);
  assert(html.includes('lang="en"'), `${name} must declare lang="en".`);
  assert(html.includes("Skip to content"), `${name} must include a skip link.`);
}

for (const phrase of [
  "Gary Virk · IT Specialist",
  "Endpoint support and network troubleshooting.",
  "I’m an IT specialist based in Mississauga, Ontario.",
  "My work has covered Windows endpoints, Dell hardware, software support, imaging and deployment, and endpoint connectivity.",
  "The case studies below show how I narrow down faults, document the work, and retest the fix.",
  "View case studies",
  "View résumé",
  "View all work",
  "Background",
  "Field service and end-user support",
  "Windows endpoints and networks",
  "i@garyvirk.com",
  "data-copy-email",
  "Field Service / End-User Support Technician",
  "Experis / Manpower Services Canada Ltd.",
  "Dell Canada assignment at Cummins",
  "Computer Systems Technician - Networking"
]) {
  assert(home.includes(phrase), `Homepage is missing required content: ${phrase}`);
}
for (const phrase of [
  "more than three years",
  "Bluum",
  "IT Systems &amp; Network Administration",
  "Cisco Networking Academy",
  "Cisco CCNA",
  "CompTIA A+",
  "CompTIA Network+",
  "CompTIA CIOS"
]) {
  assert(!home.includes(phrase), `Homepage contains an unverified or retired claim: ${phrase}`);
}

for (const phrase of [
  'action="https://formsubmit.co/i@garyvirk.com"',
  'method="POST"',
  'enctype="multipart/form-data"',
  'name="first_name"',
  'name="last_name"',
  'name="email"',
  'name="message"',
  'name="attachment"',
  'name="_honey"',
  'name="_next" value="https://garyvirk.com/message-sent.html"',
  'name="_url" value="https://garyvirk.com/#contact"',
  "Maximum 10 MB",
  "Do not include passwords or sensitive personal information",
  "Privacy details",
  "data-contact-form",
  "data-contact-file",
  "data-contact-submit",
  "data-contact-fallback",
  "data-contact-fallback-note",
  "Open this message in your email app"
]) {
  assert(home.includes(phrase), `Homepage contact form is missing required content: ${phrase}`);
}
for (const phrase of [
  "contactServiceProbeTimeout",
  "validateAttachmentMetadata",
  'typeof window.AbortController !== "function"',
  'method: "HEAD"',
  'mode: "no-cors"',
  "Couldn’t send the form right now.",
  "Please check the form and try again.",
  "Complete the required fields before sending.",
  "prepareEmailFallback",
  'addEventListener("invalid", markInvalidField, true)',
  "Your message is filled in and ready to review before sending.",
  "HTMLFormElement.prototype.submit.call(contactForm)"
]) {
  assert(contactScript.includes(phrase), `Contact resilience script is missing: ${phrase}`);
}
assert(
  (contactScript.match(/formIsReadyToSend\(\)/g) || []).length >= 3,
  "Contact form must revalidate immediately before native submission."
);
assert(
  messageSent.includes('name="robots" content="noindex, follow"'),
  "Message confirmation page must remain noindex."
);
assert(
  messageSent.includes("Thanks for reaching out.") &&
    messageSent.includes("The form was submitted through FormSubmit."),
  "Message confirmation page is missing its submission confirmation."
);
assert(
  messageSent.includes("Message submitted | Gary Virk") &&
    !messageSent.includes("Message sent | Gary Virk"),
  "Message confirmation metadata overstates delivery."
);
assert(
  !home.includes("delivered to my inbox") &&
    !home.includes("All fields marked required must be completed."),
  "Homepage contact copy still overstates delivery or uses retired instructions."
);
assert(
  !sitemap.includes("https://garyvirk.com/message-sent.html"),
  "Message confirmation page must not appear in the sitemap."
);

assert(
  !home.includes("Portrait / 2026") &&
    !home.includes("Move to inspect") &&
    !home.includes("Move cursor") &&
    !home.includes("portrait-cue"),
  "Retired portrait labels remain on the homepage."
);
assert(!home.includes("I help people get back to work."), "Retired homepage headline remains.");
assert(
  !home.includes("Computers have been part of my life since I was a kid."),
  "Retired childhood-story headline remains."
);
assert(!home.includes("Instrument Sans"), "Retired Instrument Sans remains in the homepage build.");
assert(!home.includes("Instrument Serif"), "Retired Instrument Serif remains in the homepage build.");
assert(!home.includes("© 2026"), "A static design year remains on the homepage.");
assert(!home.includes("data-view-panel"), "The retired hidden-panel homepage is still present.");
assert(
  home.includes('href="/work.html"') && home.includes('href="/resume.html"'),
  "Homepage primary routes are missing."
);

for (const phrase of [
  "Detailed case studies",
  "Supporting labs",
  "Support notes",
  "Windows endpoint connectivity triage",
  "Validating a network access rule change",
  "DHCP failure isolation",
  "Four packet captures, four network faults",
  "Network inventory drift",
  "TLS certificate and hostname triage",
  "SMB authentication and share permissions",
  "Tracing an HTTP 502 through a reverse proxy",
  "SSH access and private-key permissions",
  "Endpoint application deployment and rollback",
  "macOS enrollment and FileVault support guide",
  "Laptop boot and storage troubleshooting guide",
  "Enterprise Wi-Fi troubleshooting guide",
  "Technical note",
  "Vendor sources and labelled aids",
  "View the ACL case study",
  "Fault",
  "Decisive check",
  "Retest"
]) {
  assert(work.includes(phrase), `Work index is missing required content: ${phrase}`);
}
assert(
  work.includes("broken-users-https-timeout.png") &&
    work.includes("broken-router-deny-counter.png") &&
    work.includes("corrected-users-https-pass.png"),
  "Work index is missing the sanitized fault, check, and retest evidence sequence."
);
assert(
  work.includes("Employer records are not published.") &&
    work.includes("Generated images are labelled and used"),
  "Work index is missing the generated-image evidence boundary."
);

const publishedPacketEvidencePaths = [
  "work-assets/evidence/dhcp-native-v10/scenarios/baseline.json",
  "work-assets/evidence/dhcp-native-v10/scenarios/no-offer.json",
  "work-assets/evidence/dhcp-native-v10/scenarios/incorrect-options.json",
  "work-assets/evidence/dhcp-native-v10/scenarios/competing-server.json",
  "work-assets/evidence/dhcp-native-v10/scenarios/clean-repeat.json",
  "work-assets/evidence/packet-native-v11/cases/dns-failure/validation.json",
  "work-assets/evidence/packet-native-v11/cases/tcp-reset-retransmission/validation.json",
  "work-assets/evidence/packet-native-v11/cases/arp-duplicate-ip/validation.json",
  "work-assets/evidence/packet-native-v11/cases/icmp-path-mtu/validation.json",
  "work-assets/evidence/packet-native-v11/tool-provenance.json"
];
for (const relativePath of publishedPacketEvidencePaths) {
  assert(existsSync(join(distRoot, relativePath)), `Missing public execution record: ${relativePath}.`);
}
const publishedWindowsEvidencePaths = [
  "work-assets/evidence/windows-native-v6/payload/scenarios/dns-only/failure/transcript.txt",
  "work-assets/evidence/windows-native-v6/payload/scenarios/dns-only/post-correction/transcript.txt",
  "work-assets/evidence/windows-native-v6/payload/scenarios/wrong-static-network/failure/transcript.txt",
  "work-assets/evidence/windows-native-v6/payload/scenarios/wrong-static-network/rollback/transcript.txt",
  "work-assets/evidence/windows-native-v6/payload/summary.json"
];
const publishedAclEvidencePaths = [
  "work-assets/evidence/network-access-control/batfish/baseline-evaluation.json",
  "work-assets/evidence/network-access-control/batfish/baseline-repeat-evaluation.json",
  "work-assets/evidence/network-access-control/batfish/broken-evaluation.json",
  "work-assets/evidence/network-access-control/batfish/corrected-evaluation.json",
  "work-assets/evidence/network-access-control/batfish/input-bindings.json",
  "work-assets/evidence/network-access-control/batfish/rollback-evaluation.json",
  "work-assets/evidence/network-access-control/batfish/sequence-evaluation.json",
  "work-assets/evidence/network-access-control/packet-tracer/cli-transcript.md",
  "work-assets/evidence/network-access-control/packet-tracer/evidence-record.json",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/baseline-users-https-pass.png",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/broken-router-deny-counter.png",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/broken-users-https-timeout.png",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/corrected-router-permit-counter.png",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/corrected-users-https-pass.png",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/rollback-admin-to-server-ping-pass.png",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/rollback-guest-to-admin-denied.png",
  "work-assets/evidence/network-access-control/packet-tracer/screenshots/rollback-users-https-pass.png",
  "work-assets/evidence/network-access-control/packet-tracer/topology.svg",
  "work-assets/evidence/network-access-control/release-manifest.json",
  "work-assets/evidence/network-access-control/source-provenance.json"
];
for (const relativePath of [
  ...publishedWindowsEvidencePaths,
  ...publishedAclEvidencePaths
]) {
  assert(existsSync(join(distRoot, relativePath)), `Missing allowlisted public evidence: ${relativePath}.`);
}
for (const [evidenceDirectory, allowlist] of [
  [
    "work-assets/evidence/dhcp-native-v10",
    publishedPacketEvidencePaths.filter((path) => path.includes("/dhcp-native-v10/"))
  ],
  [
    "work-assets/evidence/packet-native-v11",
    publishedPacketEvidencePaths.filter((path) => path.includes("/packet-native-v11/"))
  ],
  ["work-assets/evidence/windows-native-v6", publishedWindowsEvidencePaths],
  ["work-assets/evidence/network-access-control", publishedAclEvidencePaths]
]) {
  const absoluteDirectory = join(distRoot, evidenceDirectory);
  if (!existsSync(absoluteDirectory)) continue;
  for (const file of walk(absoluteDirectory)) {
    const relativePath = file.slice(distRoot.length + 1);
    assert(
      allowlist.includes(relativePath),
      `Public evidence package contains a non-allowlisted file: ${relativePath}.`
    );
  }
}

const aclManifestPath = join(
  distRoot,
  "work-assets/evidence/network-access-control/release-manifest.json"
);
if (existsSync(aclManifestPath)) {
  const manifest = JSON.parse(readFileSync(aclManifestPath, "utf8"));
  assert(manifest.file_count === 19, "ACL public manifest must index exactly 19 files.");
  assert(manifest.files?.length === 19, "ACL public manifest file list is incomplete.");
  for (const entry of manifest.files ?? []) {
    const artifactPath = join(
      distRoot,
      "work-assets/evidence/network-access-control",
      entry.path
    );
    assert(existsSync(artifactPath), `ACL public manifest points to a missing file: ${entry.path}.`);
    if (!existsSync(artifactPath)) continue;
    assert(statSync(artifactPath).size === entry.bytes, `ACL manifest size mismatch: ${entry.path}.`);
    const actualSha256 = createHash("sha256")
      .update(readFileSync(artifactPath))
      .digest("hex");
    assert(actualSha256 === entry.sha256, `ACL manifest SHA-256 mismatch: ${entry.path}.`);
  }
}

for (const phrase of [
  "Field Service / End-User Support Technician",
  "Experis / Manpower Services Canada Ltd.",
  "Dell Canada assignment at Cummins",
  "May 2023 to December 2025",
  "Computer Systems Technician - Networking",
  "Print or save as PDF",
  "Windows endpoint connectivity triage",
  "Validating a network access rule change"
]) {
  assert(resume.includes(phrase), `Résumé is missing required content: ${phrase}`);
}
assert(!resume.includes("Bluum"), "Résumé contains an unverified employment entry.");
assert(!resume.includes("more than three years"), "Résumé contains an unsupported duration claim.");
assert(!resume.includes(".pdf"), "Résumé page still links to a stale PDF.");

const selectedSlugs = [
  "windows-endpoint-readiness",
  "network-access-control",
  "dhcp-failure-isolation",
  "packet-triage-library",
  "network-inventory-drift",
  "tls-service-trust",
  "smb-share-access",
  "reverse-proxy-path",
  "ssh-access-permissions",
  "endpoint-deployment-rollback"
];

for (const slug of selectedSlugs) {
  const casePath = `work/${slug}.html`;
  const casePage = read(casePath);
  assert(casePage.includes("Evidence from the lab"), `${casePath} has no evidence section.`);
  assert(casePage.includes("What changed, and what this lab does not prove"), `${casePath} has no result boundary.`);
  assert(casePage.includes("What the evidence supports"), `${casePath} has no claim check.`);
  assert(casePage.includes("Selected evidence on this page"), `${casePath} has no publication label.`);
  assert(casePage.includes('aria-label="Case summary"'), `${casePath} has no concise case summary.`);
  assert(casePage.includes("Project record:"), `${casePath} does not label its project record.`);
  assert(
    casePage.includes("What was built and checked."),
    `${casePath} repeats or omits the concise project-scope section.`
  );
  assert(!casePage.includes("My role:"), `${casePath} contains an unsupported personal-ownership label.`);
  assert(
    casePage.includes('id="evidence-') &&
      casePage.includes('href="#evidence-') &&
      casePage.includes('id="claim-'),
    `${casePath} does not link claims to labelled evidence.`
  );
  assert(
    (casePage.match(/class="evidence-card/g) || []).length >=
      (slug === "packet-triage-library" || slug === "dhcp-failure-isolation" ? 1 : 3),
    `${casePath} does not contain enough selected evidence.`
  );
  if (slug !== "packet-triage-library") {
    assert(casePage.includes("data-project-visualization"), `${casePath} has no interactive diagnostic view.`);
  }
  assert(
    sitemap.includes(`https://garyvirk.com/${casePath}`),
    `sitemap.xml has no URL for ${casePath}.`
  );
}

const deploymentPage = read("work/endpoint-deployment-rollback.html");
assert(
  !deploymentPage.includes("endpoint-deployment-rollback.webp") &&
    !deploymentPage.includes("generated-illustration"),
  "Endpoint deployment case still publishes the removed generic illustration."
);
for (const phrase of [
  "Controlled health failure",
  "Rollback retest",
  "New-process retest",
  "Already-compliant rerun",
  "Configuration and user-state check",
  "Public evidence manifest",
  "It does not cover Windows installers, Intune"
]) {
  assert(deploymentPage.includes(phrase), `Endpoint deployment case is missing: ${phrase}`);
}

const technicalNoteSlugs = [
  "macos-enrollment-filevault",
  "laptop-boot-storage-triage",
  "enterprise-wifi-triage"
];
const technicalNoteStructures = new Map([
  ["macos-enrollment-filevault", { className: "macos-flow", commandCards: 0 }],
  ["laptop-boot-storage-triage", { className: "hardware-tree", commandCards: 0 }],
  ["enterprise-wifi-triage", { className: "wifi-ladder", commandCards: 1 }]
]);

for (const slug of technicalNoteSlugs) {
  const notePath = `work/${slug}.html`;
  const notePage = read(notePath);
  for (const phrase of [
    "Technical note, not an executed lab",
    "Official vendor documentation",
    "Clearly labelled diagrams and worksheets",
    "Primary sources",
    "Guidance used for this note",
    "Each conclusion points back to a cited source",
    "Explanatory aid"
  ]) {
    assert(notePage.includes(phrase), `${notePath} is missing its note boundary: ${phrase}`);
  }
  assert(
    !notePage.includes("These are allowlisted, sanitized excerpts from the controlled project record"),
    `${notePath} incorrectly describes a controlled execution record.`
  );
  assert(
    (notePage.match(/href="https:\/\/(?:learn\.microsoft\.com|support\.apple\.com|www\.dell\.com)/g) || []).length >= 2,
    `${notePath} does not contain enough visible primary-source links.`
  );
  const noteStructure = technicalNoteStructures.get(slug);
  assert(notePage.includes(`class="${noteStructure.className}"`), `${notePath} is missing its distinct semantic note structure.`);
  assert(
    (notePage.match(/<pre><code>/g) || []).length === noteStructure.commandCards,
    `${notePath} renders a reconstructed record as terminal output or has an unexpected command block.`
  );
  assert(notePage.includes('class="evidence-record"'), `${notePath} has no semantic reconstructed record.`);
  assert(notePage.includes('aria-label="Case summary"'), `${notePath} has no concise case summary.`);
  assert(
    notePage.includes('class="claim-reference-list"') &&
      notePage.includes('href="#source-') &&
      notePage.includes('id="source-'),
    `${notePath} claim footer does not link its cited sources.`
  );
  assert(
    sitemap.includes(`https://garyvirk.com/${notePath}`),
    `sitemap.xml has no URL for ${notePath}.`
  );
}

for (const withheldSlug of ["intune-win32-deployment", "active-directory-recovery"]) {
  assert(
    !existsSync(join(distRoot, `work/${withheldSlug}.html`)),
    `Withheld lab route was built: ${withheldSlug}.`
  );
  assert(
    !sitemap.includes(`https://garyvirk.com/work/${withheldSlug}.html`),
    `Withheld lab route appears in the sitemap: ${withheldSlug}.`
  );
}

const inventoryPath = "work/network-inventory-drift.html";
const inventoryPage = read(inventoryPath);
assert(!inventoryPage.includes('name="robots" content="noindex, follow"'), "Published inventory route must be indexable.");
assert(inventoryPage.includes("Evidence from the lab"), "Published inventory route has no evidence section.");
assert(
  sitemap.includes(`https://garyvirk.com/${inventoryPath}`),
  "Published inventory route must appear in the sitemap."
);

assert(robots.includes("Sitemap: https://garyvirk.com/sitemap.xml"), "robots.txt has no sitemap.");
assert(sitemap.includes("https://garyvirk.com/resume.html"), "sitemap.xml has no résumé URL.");
assert(sitemap.includes("https://garyvirk.com/work.html"), "sitemap.xml has no work index URL.");
assert(cname === "garyvirk.com", "CNAME must remain exactly garyvirk.com.");

if (existsSync(distRoot)) {
  const files = walk(distRoot);
  for (const file of files.filter((candidate) => /\.(?:pcap|pcapng)$/i.test(candidate))) {
    assert(
      false,
      `Build publishes a prohibited packet capture: ${file.slice(distRoot.length + 1)}.`
    );
  }
  const publicEvidenceText = files
    .filter(
      (file) =>
        file.includes("/work-assets/evidence/") &&
        /\.(?:json|md|txt|svg|dot|xml)$/i.test(file)
    )
    .map((file) => readFileSync(file, "utf8"))
    .join("\n")
    .toLowerCase();
  for (const phrase of [
    "independent review",
    "independently confirms",
    "byte-identical",
    "hash-bound",
    "fail-closed",
    "\"project_status\": \"building\"",
    "publication review pending",
    "does not approve publication",
    "\"private_artifacts_verified\""
  ]) {
    assert(
      !publicEvidenceText.includes(phrase),
      `Public evidence contains blocked wording: ${phrase}.`
    );
  }
  const totalBytes = files.reduce((total, file) => total + statSync(file).size, 0);
  const javascriptBytes = files
    .filter((file) => file.endsWith(".js"))
    .reduce((total, file) => total + statSync(file).size, 0);

  assert(totalBytes < 8_000_000, `Build is unexpectedly large: ${totalBytes} bytes.`);
  assert(javascriptBytes < 250_000, `JavaScript is unexpectedly large: ${javascriptBytes} bytes.`);

  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const combinedHtml = htmlFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  for (const claim of claimRegister) {
    if (claim.verification !== "verified") {
      assert(
        !combinedHtml.includes(claim.publicWording),
        `Public copy contains an unverified profile claim: ${claim.id}.`
      );
    }
  }
  for (const credential of credentials) {
    if (credential.verification !== "verified") {
      assert(
        !combinedHtml.includes(credential.name),
        `Public copy contains an unverified credential: ${credential.name}.`
      );
    }
  }
  const forbiddenCopy = [
    "—",
    "[VERIFY]",
    "Systems work, with receipts",
    "Five controlled labs",
    "Validated result",
    "Published artifacts",
    "published artifacts",
    "Independent review",
    "independently reviewed",
    "byte-identical",
    "hash-bound",
    "fail-closed",
    "production-ready",
    "enterprise-grade",
    "robust",
    "seamless",
    "cutting-edge",
    "I help people get back to work.",
    "Move cursor",
    "Shows how I",
    "I built the collector",
    "I wrote the policy intent",
    "I built the comparison tool",
    "I created the local certificate authority",
    "I built the isolated Samba service",
    "I built the isolated proxy",
    "I built the isolated SSH server"
  ];
  for (const phrase of forbiddenCopy) {
    assert(!combinedHtml.includes(phrase), `Public copy contains a blocked phrase: ${phrase}`);
  }

  const textFiles = files.filter((file) => /\.(html|js|css|xml|txt|json|svg)$/i.test(file));
  const combined = textFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  const privateTokens = [
    "20-elite-projects",
    "_reference/",
    "my info /",
    "LabOnly-User-47",
    "LabOnly-Audit-83",
    "BEGIN OPENSSH PRIVATE KEY",
    "ssh-ed25519 AAAA"
  ];
  for (const token of privateTokens) {
    assert(!combined.includes(token), `Private or internal token leaked into the build: ${token}`);
  }
  for (const [label, pattern] of [
    ["local macOS path", /\/Users\//],
    ["private Gmail address", /[A-Z0-9._%+-]+@gmail\.com/i],
    ["North American phone number", /\+1\d{10}\b/]
  ]) {
    assert(!pattern.test(combined), `${label} leaked into the build.`);
  }

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (
        reference.startsWith("#") ||
        reference.startsWith("mailto:") ||
        reference.startsWith("tel:") ||
        reference.startsWith("http://") ||
        reference.startsWith("https://")
      ) {
        continue;
      }
      const pathname = reference.split(/[?#]/, 1)[0];
      const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
      assert(
        existsSync(join(distRoot, relativePath)),
        `${file.slice(distRoot.length + 1)} has a broken local reference: ${reference}`
      );
    }
  }
}

if (errors.length) {
  console.error("Build validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Build validation passed.");
