import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(repoRoot, ".site-dist");
const errors = [];

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

assert(existsSync(distRoot), "Build directory .site-dist does not exist.");
assert(existsSync(join(distRoot, ".nojekyll")), "Build output must include .nojekyll.");

const home = read("index.html");
const resume = read("resume.html");
const work = read("work.html");
const notFound = read("404.html");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const cname = read("CNAME").trim();

for (const [name, html] of [
  ["index.html", home],
  ["work.html", work],
  ["resume.html", resume],
  ["404.html", notFound]
]) {
  assert((html.match(/<h1[\s>]/g) || []).length === 1, `${name} must contain exactly one h1.`);
  assert(html.includes('lang="en"'), `${name} must declare lang="en".`);
  assert(html.includes("Skip to content"), `${name} must include a skip link.`);
}

for (const phrase of [
  "IT Specialist",
  "IT support and networking",
  "I help people get back to work.",
  "I got into IT through computer networking at St. Clair College",
  "Selected work",
  "i@garyvirk.com",
  "data-copy-email",
  "User Support Technician",
  "Experis / Manpower",
  "Assigned to Cummins",
  "Bluum",
  "IT Systems &amp; Network Administration",
  "Cisco CCNA",
  "CompTIA Network+"
]) {
  assert(home.includes(phrase), `Homepage is missing required content: ${phrase}`);
}

assert(
  !home.includes("Portrait / 2026") && !home.includes("Move to inspect"),
  "Retired portrait labels remain on the homepage."
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
  "Flagship cases",
  "Supporting labs",
  "Windows endpoint connectivity triage",
  "Network access-control change validation",
  "DHCP failure isolation",
  "Packet triage notes"
]) {
  assert(work.includes(phrase), `Work index is missing required content: ${phrase}`);
}
assert(
  !work.includes("Network inventory drift"),
  "Archived inventory project remains in the selected work index."
);

for (const phrase of [
  "Experis / Manpower",
  "Assigned to Cummins",
  "May 2023 to December 2025",
  "Bluum",
  "April 2023 to May 2023",
  "Print or save as PDF",
  "Windows endpoint connectivity triage",
  "Network access-control change validation"
]) {
  assert(resume.includes(phrase), `Résumé is missing required content: ${phrase}`);
}
assert(!resume.includes(".pdf"), "Résumé page still links to a stale PDF.");

const selectedSlugs = [
  "windows-endpoint-readiness",
  "network-access-control",
  "dhcp-failure-isolation",
  "packet-triage-library"
];

for (const slug of selectedSlugs) {
  const casePath = `work/${slug}.html`;
  const casePage = read(casePath);
  assert(casePage.includes("What the public excerpts actually prove"), `${casePath} has no evidence section.`);
  assert(casePage.includes("What changed, and what remains outside the claim"), `${casePath} has no result boundary.`);
  assert(casePage.includes("Every public conclusion stays tied to an artifact"), `${casePath} has no claim check.`);
  assert(casePage.includes("Selected evidence on this page"), `${casePath} has no publication label.`);
  assert(
    (casePage.match(/class="evidence-card/g) || []).length >= (slug.includes("windows") || slug.includes("access-control") ? 3 : 1),
    `${casePath} does not contain enough selected evidence.`
  );
  assert(
    sitemap.includes(`https://garyvirk.com/${casePath}`),
    `sitemap.xml has no URL for ${casePath}.`
  );
}

const archivePath = "work/network-inventory-drift.html";
const archivePage = read(archivePath);
assert(archivePage.includes('name="robots" content="noindex, follow"'), "Archived route must be noindex.");
assert(archivePage.includes("Unfeatured project"), "Archived route has no archive notice.");
assert(
  !sitemap.includes(`https://garyvirk.com/${archivePath}`),
  "Archived route must not appear in the sitemap."
);

assert(robots.includes("Sitemap: https://garyvirk.com/sitemap.xml"), "robots.txt has no sitemap.");
assert(sitemap.includes("https://garyvirk.com/resume.html"), "sitemap.xml has no résumé URL.");
assert(sitemap.includes("https://garyvirk.com/work.html"), "sitemap.xml has no work index URL.");
assert(cname === "garyvirk.com", "CNAME must remain exactly garyvirk.com.");

if (existsSync(distRoot)) {
  const files = walk(distRoot);
  const totalBytes = files.reduce((total, file) => total + statSync(file).size, 0);
  const javascriptBytes = files
    .filter((file) => file.endsWith(".js"))
    .reduce((total, file) => total + statSync(file).size, 0);

  assert(totalBytes < 3_500_000, `Build is unexpectedly large: ${totalBytes} bytes.`);
  assert(javascriptBytes < 250_000, `JavaScript is unexpectedly large: ${javascriptBytes} bytes.`);

  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const combinedHtml = htmlFiles.map((file) => readFileSync(file, "utf8")).join("\n");
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
    "cutting-edge"
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
    "71virkk@gmail.com",
    "+16475109813"
  ];
  for (const token of privateTokens) {
    assert(!combined.includes(token), `Private or internal token leaked into the build: ${token}`);
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
