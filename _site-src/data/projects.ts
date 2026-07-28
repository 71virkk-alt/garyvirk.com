export type ProjectTier = "flagship" | "supporting" | "technical-note" | "archived";
export type ProjectKind = "executed-lab" | "technical-note" | "archive";
export type ProjectReleaseState = "published" | "withheld";
export type EvidenceLevel = "E0" | "source-cited" | "E2" | "E3" | "E4";
export type PrivacyClass = "public-sanitized" | "private-supporting";
export type PresentationType =
  | "timeline"
  | "change"
  | "packet"
  | "notes"
  | "intune"
  | "directory"
  | "macos"
  | "hardware"
  | "wifi"
  | "inventory"
  | "tls"
  | "smb"
  | "service"
  | "archive";
export type ArtifactRole =
  | "execution-proof"
  | "deterministic-illustration"
  | "derived-visual"
  | "generated-illustration";
export type ArtifactOrigin = "captured" | "derived" | "cited" | "generated";
export type ProofValue = "execution" | "explanation";
export type VisualizationNodeState = "normal" | "failed" | "changed" | "unknown";

export type ProjectStatus = {
  completion:
    | "Complete within stated scope"
    | "Research note"
    | "Blocked by execution gate"
    | "Archived";
  execution: string;
  review: string;
  publication:
    | "Selected evidence on this page"
    | "Cited sources and labelled aids"
    | "Withheld"
    | "Private";
  evidenceLevel: EvidenceLevel;
};

export type EvidenceArtifact = {
  id: string;
  title: string;
  kind: "command" | "result" | "diagram" | "record";
  caption: string;
  claimIds: string[];
  privacyClass: PrivacyClass;
  role?: ArtifactRole;
  items?: Array<{
    label: string;
    value: string;
  }>;
  excerpt?: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  origin?: ArtifactOrigin;
  proofValue?: ProofValue;
  download?: string;
  sha256?: string;
};

export type ProjectClaim = {
  id: string;
  publicWording: string;
  evidenceRefs: string[];
  sourceRefs?: string[];
  limitation: string;
  verification: "verified" | "lab-demonstrated" | "source-cited" | "withheld";
};

export type SourceReference = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  supports: string;
};

export type ProjectMatrixRow = {
  check: string;
  failure: string;
  corrected: string;
};

export type ProjectNote = {
  title: string;
  symptom: string;
  evidence: string;
  result: string;
  limitation: string;
};

export type ProjectVisualization = {
  title: string;
  description: string;
  depth?: "flat" | "layered";
  nodes: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
  states: Array<{
    id: string;
    label: string;
    summary: string;
    artifactIds: string[];
    nodeStates: Record<string, VisualizationNodeState>;
  }>;
};

export type PortfolioProject = {
  number: string;
  slug: string;
  title: string;
  tier: ProjectTier;
  kind: ProjectKind;
  releaseState: ProjectReleaseState;
  presentation: PresentationType;
  discipline: string;
  summary: string;
  employerValue: string;
  ownership: string;
  environment: string[];
  status: ProjectStatus;
  question: string;
  approach: string[];
  outcome: string;
  limitation: string;
  claims: ProjectClaim[];
  evidence: EvidenceArtifact[];
  sources?: SourceReference[];
  processLabel?: string;
  processHeading?: string;
  evidenceHeading?: string;
  evidenceDescription?: string;
  matrixHeadings?: {
    check: string;
    failure: string;
    corrected: string;
  };
  matrix?: ProjectMatrixRow[];
  notes?: ProjectNote[];
  visualization?: ProjectVisualization;
};

export const projects: PortfolioProject[] = [
  {
    number: "01",
    slug: "windows-endpoint-readiness",
    title: "Windows endpoint connectivity triage",
    tier: "flagship",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "timeline",
    discipline: "IT support · PowerShell · Windows 11",
    summary:
      "A PowerShell diagnostic that distinguishes a DNS failure from a wider connectivity problem, then records the result for handoff.",
    employerValue:
      "The deciding point is whether direct service TCP still works when name resolution fails.",
    ownership:
      "I built the collector, defined the fault classifications, ran the controlled Windows scenarios, reviewed the outputs, and prepared the sanitized excerpts shown here.",
    environment: ["Windows 11 ARM64", "PowerShell 7", "Pester", "UTM"],
    status: {
      completion: "Complete within stated scope",
      execution: "Controlled Windows 11 ARM64 run",
      review: "Checklist-based technical review",
      publication: "Selected evidence on this page",
      evidenceLevel: "E4"
    },
    question:
      "A user says the network is down. Is the endpoint missing a usable path, or can it still reach the service directly while DNS fails?",
    approach: [
      "Capture the adapter, address, route, DNS server, gateway response, name resolution, and direct TCP result without changing the endpoint.",
      "Introduce one controlled fault outside the collector and repeat the same checks.",
      "Correct only the known fault, then run the full collection again.",
      "Start a fresh disposable session and confirm that the fault is absent before the final healthy check."
    ],
    outcome:
      "The DNS-only scenario kept direct TCP available while name resolution failed. The wrong-static-network scenario changed the address and route together and removed the usable path. Each correction produced a separate healthy retest.",
    limitation:
      "This is a controlled Windows lab. It does not claim production execution, automatic remediation, or a native adapter-down recovery.",
    claims: [
      {
        id: "win-dns-01",
        publicWording:
          "During the DNS test, the service still answered on TCP 8443 by IP, while the hostname returned no record.",
        evidenceRefs: ["win-dns-fault", "win-dns-retest"],
        limitation: "The test covers one controlled DNS-server fault.",
        verification: "verified"
      },
      {
        id: "win-path-01",
        publicWording:
          "With the test adapter on the wrong subnet, gateway, DNS, and direct TCP checks failed together.",
        evidenceRefs: ["win-path-fault", "win-rollback"],
        limitation: "The test covers one controlled static-address fault.",
        verification: "verified"
      }
    ],
    evidence: [
      {
        id: "win-dns-fault",
        title: "DNS fault",
        kind: "command",
        caption:
          "The service port was reachable by IP while the lab hostname returned no answer. That separated DNS from the underlying TCP path.",
        claimIds: ["win-dns-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/windows-native-v6/payload/scenarios/dns-only/failure/transcript.txt",
        excerpt:
          "Test-NetConnection 192.0.2.10 -Port 8443\nTcpTestSucceeded : True\n\nResolve-DnsName service.example.test\n[no answer]\n\nAssessment : Fail / DNSOnly"
      },
      {
        id: "win-dns-retest",
        title: "DNS correction and retest",
        kind: "result",
        caption:
          "After the DNS server was restored, the same hostname returned the expected documentation address and the full assessment returned Healthy.",
        claimIds: ["win-dns-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/windows-native-v6/payload/scenarios/dns-only/post-correction/transcript.txt",
        excerpt:
          "Resolve-DnsName service.example.test\nA  192.0.2.10\n\nTest-NetConnection 192.0.2.10 -Port 8443\nTcpTestSucceeded : True\n\nAssessment : Pass / Healthy"
      },
      {
        id: "win-path-fault",
        title: "Wrong static network",
        kind: "command",
        caption:
          "The endpoint moved to a different documentation subnet. Gateway, DNS, and direct TCP checks then failed together.",
        claimIds: ["win-path-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/windows-native-v6/payload/scenarios/wrong-static-network/failure/transcript.txt",
        excerpt:
          "IPv4Address   : 198.51.100.20\nDefaultGateway : 198.51.100.1\nGateway check  : Fail\nTCP 8443       : False\nAssessment     : Fail / NetworkPath"
      },
      {
        id: "win-rollback",
        title: "Fresh-session rollback",
        kind: "record",
        caption:
          "A new disposable session started without either inserted fault and returned a healthy assessment.",
        claimIds: ["win-path-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/windows-native-v6/payload/scenarios/wrong-static-network/rollback/transcript.txt",
        excerpt:
          "DNS-only rollback pre-check       : fault absent\nWrong-network rollback pre-check   : fault absent\nFinal assessment                   : Pass / Healthy"
      },
      {
        id: "win-ticket",
        title: "Synthetic support record",
        kind: "record",
        caption:
          "This concise handoff is based on the controlled lab. It is not an employer or customer ticket.",
        claimIds: ["win-dns-01", "win-path-01"],
        privacyClass: "public-sanitized",
        origin: "derived",
        proofValue: "explanation",
        download: "/work-assets/evidence/windows-native-v6/payload/summary.json",
        excerpt:
          "Symptom       : Service unavailable by name\nChecks        : Adapter, IP, route, DNS, direct TCP\nFinding       : TCP available; DNS lookup failed\nCorrection    : Restored reviewed DNS server\nRetest        : Name and direct TCP checks passed\nScope         : Synthetic home-lab record"
      }
    ],
    matrix: [
      { check: "Adapter and IP", failure: "Available", corrected: "Available" },
      { check: "Direct service TCP", failure: "Available", corrected: "Available" },
      { check: "DNS name", failure: "No answer", corrected: "A record returned" },
      { check: "Assessment", failure: "DNSOnly", corrected: "Healthy" }
    ],
    visualization: {
      title: "Compare a DNS failure with a broken network path.",
      description:
        "Switch between the two inserted faults and the retest. The highlighted checkpoint shows why the next action changes.",
      depth: "layered",
      nodes: [
        { id: "adapter", label: "Adapter", detail: "Link and endpoint address" },
        { id: "route", label: "Route", detail: "Gateway and service path" },
        { id: "dns", label: "DNS", detail: "Hostname lookup" },
        { id: "tcp", label: "TCP 8443", detail: "Direct service test" }
      ],
      states: [
        {
          id: "dns-fault",
          label: "DNS fault",
          summary: "The route and direct service test pass, but the hostname returns no record.",
          artifactIds: ["win-dns-fault"],
          nodeStates: { adapter: "normal", route: "normal", dns: "failed", tcp: "normal" }
        },
        {
          id: "wrong-network",
          label: "Wrong network",
          summary: "The changed address removes the usable route, so DNS and direct TCP fail with it.",
          artifactIds: ["win-path-fault"],
          nodeStates: { adapter: "changed", route: "failed", dns: "failed", tcp: "failed" }
        },
        {
          id: "retest",
          label: "Retest",
          summary: "A fresh session starts on the expected network and all four checks pass.",
          artifactIds: ["win-dns-retest", "win-rollback"],
          nodeStates: { adapter: "normal", route: "normal", dns: "normal", tcp: "normal" }
        }
      ]
    }
  },
  {
    number: "02",
    slug: "network-access-control",
    title: "Validating a network access rule change",
    tier: "flagship",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "change",
    discipline: "Networking · Cisco ACLs · Batfish",
    summary:
      "I tested one ACL change against required and blocked traffic, corrected a deliberate regression, and repeated the baseline checks.",
    employerValue:
      "The change restores one required HTTPS path while the paths outside its scope keep their original result.",
    ownership:
      "I wrote the policy intent, prepared the four-zone configurations, ran the Batfish model, executed representative Packet Tracer checks, and compared the failure, correction, and rollback states.",
    environment: ["Cisco Packet Tracer 9", "802.1Q", "Cisco ACLs", "Batfish"],
    status: {
      completion: "Complete within stated scope",
      execution: "Batfish model and Packet Tracer checks",
      review: "Automated consistency checks",
      publication: "Selected evidence on this page",
      evidenceLevel: "E3"
    },
    question:
      "Will an ACL change restore the required HTTPS path without opening guest-to-admin access or changing unrelated policy?",
    approach: [
      "Write the required, prohibited, and unaffected flows before editing the ACL.",
      "Model the complete policy in Batfish and record the baseline result.",
      "Insert one earlier HTTPS deny and observe the declared regression.",
      "Remove the inserted rule, repeat the checks, and reopen the untouched rollback state."
    ],
    outcome:
      "The inserted deny blocked the users-to-server HTTPS path. Removing it restored that path, while the representative admin and guest checks kept their expected behavior.",
    limitation:
      "Batfish covers the complete policy model. Packet Tracer corroborates representative flows on an adapted router-on-a-stick topology. Automated checks passed, but the project was not reviewed by an external network engineer.",
    claims: [
      {
        id: "acl-change-01",
        publicWording:
          "An earlier deny rule blocked user HTTPS traffic to the server. Removing that rule restored the intended path.",
        evidenceRefs: ["acl-topology", "acl-failure", "acl-correction"],
        limitation: "The manual simulator check covers the declared HTTPS path.",
        verification: "verified"
      },
      {
        id: "acl-boundary-01",
        publicWording:
          "After the rollback check, guest traffic to the admin network was still blocked.",
        evidenceRefs: ["acl-rollback"],
        limitation: "This is Packet Tracer corroboration, not physical Cisco hardware execution.",
        verification: "verified"
      }
    ],
    evidence: [
      {
        id: "acl-topology",
        title: "Four-zone topology",
        kind: "diagram",
        caption:
          "Users, admin, servers, and guests share the same addressing and policy intent across the model and simulator.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        role: "derived-visual",
        origin: "derived",
        proofValue: "explanation",
        src: "/work-assets/evidence/network-access-control/packet-tracer/topology.svg",
        width: 1200,
        height: 760,
        download: "/work-assets/evidence/network-access-control/release-manifest.json",
        alt: "Four-zone access-control lab with users, admin, servers, and guests connected through a routed boundary"
      },
      {
        id: "acl-failure",
        title: "Controlled regression",
        kind: "command",
        caption:
          "An earlier deny for users-to-server HTTPS recorded matches while the workstation request timed out.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/network-access-control/packet-tracer/cli-transcript.md",
        excerpt:
          "5 deny tcp 10.20.10.0 0.0.0.255 host 10.20.30.80 eq 443\n12 match(es)\n\nHTTPS request : Request Timeout"
      },
      {
        id: "acl-correction",
        title: "Correction",
        kind: "command",
        caption:
          "Removing sequence 5 returned traffic to the intended permit, which then recorded the restored request.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/network-access-control/packet-tracer/cli-transcript.md",
        excerpt:
          "ip access-list extended USERS_IN\nno 5\n\npermit tcp 10.20.10.0 0.0.0.255 host 10.20.30.80 eq 443\n6 match(es)\n\nHTTPS request : Pass"
      },
      {
        id: "acl-rollback",
        title: "Rollback boundary check",
        kind: "result",
        caption:
          "After a fresh baseline run, the required server path returned while guest-to-admin traffic remained denied.",
        claimIds: ["acl-boundary-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/network-access-control/packet-tracer/evidence-record.json",
        excerpt:
          "Users to server HTTPS : Pass\nAdmin to server ICMP  : Pass\nGuest to admin ICMP   : Denied\nGUESTS_IN deny matches: 4"
      },
      {
        id: "acl-public-package",
        title: "Public evidence index",
        kind: "record",
        caption:
          "The manifest records the size and SHA-256 value of 21 published configuration, result, provenance, topology, and screenshot files.",
        claimIds: ["acl-change-01", "acl-boundary-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/network-access-control/release-manifest.json",
        excerpt:
          "Public package\n• 21 indexed files\n• Batfish state evaluations\n• Packet Tracer transcript and screenshots\n• source provenance\n• SHA-256 values"
      },
      {
        id: "acl-baseline-screen",
        title: "Baseline HTTPS path",
        kind: "diagram",
        caption:
          "Packet Tracer returned the application page before the test deny was added.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        role: "execution-proof",
        origin: "captured",
        proofValue: "execution",
        src: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/baseline-users-https-pass.png",
        width: 700,
        height: 708,
        download: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/baseline-users-https-pass.png",
        alt: "Packet Tracer workstation browser showing the baseline HTTPS page"
      },
      {
        id: "acl-timeout-screen",
        title: "Inserted fault",
        kind: "diagram",
        caption:
          "The same workstation request timed out after the earlier HTTPS deny was inserted.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        role: "execution-proof",
        origin: "captured",
        proofValue: "execution",
        src: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/broken-users-https-timeout.png",
        width: 700,
        height: 708,
        download: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/broken-users-https-timeout.png",
        alt: "Packet Tracer workstation browser showing the HTTPS request timeout"
      },
      {
        id: "acl-deny-counter-screen",
        title: "Deny counter",
        kind: "diagram",
        caption:
          "The inserted sequence recorded 12 matches, tying the timeout to that ACL entry.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        role: "execution-proof",
        origin: "captured",
        proofValue: "execution",
        src: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/broken-router-deny-counter.png",
        width: 700,
        height: 708,
        download: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/broken-router-deny-counter.png",
        alt: "Packet Tracer router command output showing 12 matches on the inserted deny"
      },
      {
        id: "acl-corrected-screen",
        title: "Corrected HTTPS path",
        kind: "diagram",
        caption:
          "After sequence 5 was removed, the workstation loaded the same application page again.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        role: "execution-proof",
        origin: "captured",
        proofValue: "execution",
        src: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/corrected-users-https-pass.png",
        width: 700,
        height: 708,
        download: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/corrected-users-https-pass.png",
        alt: "Packet Tracer workstation browser showing the restored HTTPS page"
      },
      {
        id: "acl-permit-counter-screen",
        title: "Permit counter",
        kind: "diagram",
        caption:
          "The intended permit recorded six matches after the correction.",
        claimIds: ["acl-change-01"],
        privacyClass: "public-sanitized",
        role: "execution-proof",
        origin: "captured",
        proofValue: "execution",
        src: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/corrected-router-permit-counter.png",
        width: 700,
        height: 708,
        download: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/corrected-router-permit-counter.png",
        alt: "Packet Tracer router command output showing six matches on the intended permit"
      },
      {
        id: "acl-guest-boundary-screen",
        title: "Blocked path stayed blocked",
        kind: "diagram",
        caption:
          "The rollback check still denied the guest-to-admin test, keeping the change inside its intended scope.",
        claimIds: ["acl-boundary-01"],
        privacyClass: "public-sanitized",
        role: "execution-proof",
        origin: "captured",
        proofValue: "execution",
        src: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/rollback-guest-to-admin-denied.png",
        width: 700,
        height: 708,
        download: "/work-assets/evidence/network-access-control/packet-tracer/screenshots/rollback-guest-to-admin-denied.png",
        alt: "Packet Tracer guest workstation showing the admin network test remained denied"
      }
    ],
    matrix: [
      { check: "Users to server HTTPS", failure: "Denied", corrected: "Allowed" },
      { check: "Admin to server", failure: "Unchanged", corrected: "Allowed" },
      { check: "Guest to admin", failure: "Unchanged", corrected: "Denied" },
      { check: "Rollback", failure: "Not applicable", corrected: "Baseline restored" }
    ],
    visualization: {
      title: "Compare the ACL before and after the deny rule.",
      description:
        "The selected state follows user HTTPS through the ACL boundary. The guest-to-admin boundary stays visible as a negative check.",
      depth: "layered",
      nodes: [
        { id: "users", label: "Users", detail: "10.20.10.0/24" },
        { id: "acl", label: "USERS_IN", detail: "Inbound policy" },
        { id: "server", label: "HTTPS server", detail: "10.20.30.80:443" },
        { id: "guest", label: "Guest boundary", detail: "Admin remains blocked" }
      ],
      states: [
        {
          id: "baseline",
          label: "Baseline",
          summary: "User HTTPS reaches the server and the guest boundary remains closed.",
          artifactIds: ["acl-baseline-screen"],
          nodeStates: { users: "normal", acl: "normal", server: "normal", guest: "normal" }
        },
        {
          id: "inserted-fault",
          label: "Inserted fault",
          summary: "The earlier deny matches the user request before the intended permit.",
          artifactIds: ["acl-timeout-screen", "acl-deny-counter-screen"],
          nodeStates: { users: "normal", acl: "failed", server: "failed", guest: "normal" }
        },
        {
          id: "correction",
          label: "Correction",
          summary: "Removing sequence 5 restores HTTPS without changing the guest boundary.",
          artifactIds: ["acl-corrected-screen", "acl-permit-counter-screen", "acl-guest-boundary-screen"],
          nodeStates: { users: "normal", acl: "changed", server: "normal", guest: "normal" }
        }
      ]
    }
  },
  {
    number: "03",
    slug: "dhcp-failure-isolation",
    title: "DHCP failure isolation",
    tier: "supporting",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "packet",
    discipline: "IT support · DHCP · Packet evidence",
    summary:
      "Three packet captures show how a missing offer, incorrect lease options, and a second DHCP server require different next steps.",
    employerValue:
      "The packet sequence separates no response, incorrect lease options, and two responding servers.",
    ownership:
      "I prepared the isolated service and client states, captured each exchange, compared the DHCP fields that distinguish the failures, and repeated the capture after correction.",
    environment: ["Kea DHCP", "BusyBox udhcpc", "TShark", "Linux namespaces"],
    status: {
      completion: "Complete within stated scope",
      execution: "Controlled Linux packet lab",
      review: "Checklist-based technical review",
      publication: "Selected evidence on this page",
      evidenceLevel: "E4"
    },
    question:
      "Did the client receive no offer, accept incorrect network options, or choose between two DHCP servers?",
    approach: [
      "Capture the complete client exchange inside an isolated lab with no default route.",
      "Change one server condition at a time.",
      "Read the message type, transaction, server identifier, router, and DNS fields.",
      "Restore the intended service state and capture a new expected four-message exchange."
    ],
    outcome:
      "The captures separated an absent response, a completed lease with incorrect options, and a transaction with two responding servers.",
    limitation:
      "This is an isolated Linux service and client lab. It does not claim Windows client behavior, relay testing, or production DHCP administration.",
    claims: [
      {
        id: "dhcp-01",
        publicWording:
          "The captures show three distinct conditions: no offer returned, incorrect router and DNS options, and two servers answering one transaction.",
        evidenceRefs: ["dhcp-flow", "dhcp-faults", "dhcp-retest"],
        limitation: "The evidence comes from an isolated Linux lab.",
        verification: "verified"
      }
    ],
    evidence: [
      {
        id: "dhcp-flow",
        title: "Healthy exchange",
        kind: "record",
        caption:
          "A complete Discover, Offer, Request, and Acknowledgment provides the comparison point for every fault.",
        claimIds: ["dhcp-01"],
        privacyClass: "public-sanitized",
        excerpt: "Discover  →  Offer  →  Request  →  Acknowledgment"
      },
      {
        id: "dhcp-faults",
        title: "Three different failures",
        kind: "result",
        caption:
          "The message sequence and option fields identify why the same user symptom needs a different next action.",
        claimIds: ["dhcp-01"],
        privacyClass: "public-sanitized",
        excerpt:
          "No offer         : Discover observed, no Offer returned\nIncorrect options : Lease completed, router and DNS differed\nCompeting server  : Two Offers answered one transaction"
      },
      {
        id: "dhcp-retest",
        title: "Post-change capture",
        kind: "record",
        caption:
          "After restoring the intended service state, the client completed the expected exchange with the reviewed router and DNS values.",
        claimIds: ["dhcp-01"],
        privacyClass: "public-sanitized",
        excerpt:
          "Offer count : 1\nRouter      : expected lab gateway\nDNS server  : expected lab resolver\nResult      : expected four-message exchange"
      }
    ],
    visualization: {
      title: "Read the exchange before changing the service.",
      description:
        "The same client symptom can stop at a different packet or complete with the wrong options.",
      depth: "flat",
      nodes: [
        { id: "discover", label: "Discover", detail: "Client asks for a lease" },
        { id: "offer", label: "Offer", detail: "Server proposes an address" },
        { id: "request", label: "Request", detail: "Client selects an offer" },
        { id: "ack", label: "ACK", detail: "Server confirms options" }
      ],
      states: [
        {
          id: "healthy",
          label: "Healthy",
          summary: "One server completes the four-message exchange with the reviewed router and DNS values.",
          artifactIds: ["dhcp-flow", "dhcp-retest"],
          nodeStates: { discover: "normal", offer: "normal", request: "normal", ack: "normal" }
        },
        {
          id: "no-offer",
          label: "No offer",
          summary: "The Discover leaves the client, but no server Offer returns.",
          artifactIds: ["dhcp-faults"],
          nodeStates: { discover: "normal", offer: "failed", request: "unknown", ack: "unknown" }
        },
        {
          id: "wrong-options",
          label: "Wrong options",
          summary: "The exchange completes, but the router and DNS fields differ from the expected service state.",
          artifactIds: ["dhcp-faults"],
          nodeStates: { discover: "normal", offer: "changed", request: "normal", ack: "changed" }
        },
        {
          id: "two-servers",
          label: "Two servers",
          summary: "Two Offers answer one transaction, identifying a competing service rather than a silent server.",
          artifactIds: ["dhcp-faults"],
          nodeStates: { discover: "normal", offer: "changed", request: "changed", ack: "unknown" }
        }
      ]
    }
  },
  {
    number: "04",
    slug: "packet-triage-library",
    title: "Four packet captures, four network faults",
    tier: "supporting",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "notes",
    discipline: "Networking · TShark · Troubleshooting",
    summary:
      "DNS, TCP reset, duplicate-IP, and path-MTU cases, each paired with a separate post-change capture.",
    employerValue:
      "Each note identifies the frames that explain the symptom and keeps the post-change capture separate.",
    ownership:
      "I created the controlled cases, selected the protocol fields that explain each symptom, compared failure and post-change captures, and wrote the support interpretation.",
    environment: ["TShark", "tcpdump", "Capinfos", "Python"],
    status: {
      completion: "Complete within stated scope",
      execution: "Controlled packet fixtures",
      review: "Automated consistency checks",
      publication: "Selected evidence on this page",
      evidenceLevel: "E3"
    },
    question:
      "Which small set of frames explains the symptom, and what separate capture shows that the condition changed?",
    approach: [
      "State where the capture was taken and what the user observed.",
      "Select only the protocol fields needed to test the suspected fault.",
      "Record the exact change outside the capture.",
      "Use a separate post-change capture to confirm the new result."
    ],
    outcome:
      "The notes isolate DNS name failure, a TCP reset, duplicate-IP ARP ownership, and path-MTU failure without repeating the DHCP project.",
    limitation:
      "These are controlled, synthetic packet cases. They do not claim production monitoring or broad incident response.",
    claims: [
      {
        id: "packet-notes-01",
        publicWording:
          "Each case links the user’s symptom to the relevant packet fields and a new capture taken after the change.",
        evidenceRefs: ["packet-notes"],
        limitation: "The cases use owned fixtures and documentation addresses.",
        verification: "verified"
      }
    ],
    evidence: [
      {
        id: "packet-notes",
        title: "Four focused packet cases",
        kind: "record",
        caption:
          "Each note keeps the symptom, relevant packet fields, post-change result, and limitation together.",
        claimIds: ["packet-notes-01"],
        privacyClass: "public-sanitized",
        excerpt:
          "DNS       : NXDOMAIN → A record\nTCP       : Reset → completed handshake\nARP       : Two owners → one owner\nPath MTU  : ICMP fragmentation-needed → payload delivered"
      }
    ],
    notes: [
      {
        title: "DNS name failure",
        symptom: "The service could not be opened by name.",
        evidence: "The DNS response returned NXDOMAIN for the requested record.",
        result: "The post-change capture returned the expected A record.",
        limitation: "This note does not identify why the DNS record was wrong."
      },
      {
        title: "TCP reset",
        symptom: "The client connected to the host but the application session closed immediately.",
        evidence: "The server side returned a TCP reset instead of completing the handshake.",
        result: "The post-change capture completed the handshake and carried the test payload.",
        limitation: "The capture proves transport behavior, not the application configuration change."
      },
      {
        title: "Duplicate-IP ARP",
        symptom: "Connectivity changed between two devices using the same address.",
        evidence: "ARP replies associated one IPv4 address with two different MAC addresses.",
        result: "The post-change capture showed one remaining owner.",
        limitation: "The case uses synthetic devices and does not claim switch-level remediation."
      },
      {
        title: "Path MTU",
        symptom: "Small traffic worked while a larger payload failed.",
        evidence: "ICMP type 3, code 4 reported that fragmentation was needed for the path.",
        result: "The post-change capture delivered the same test payload without that response.",
        limitation: "The capture identifies the path symptom, not every possible MTU cause."
      }
    ]
  },
  {
    number: "F3",
    slug: "intune-win32-deployment",
    title: "Intune Win32 application deployment failure",
    tier: "flagship",
    kind: "executed-lab",
    releaseState: "withheld",
    presentation: "intune",
    discipline: "Endpoint management · Intune · Windows 11",
    summary:
      "A candidate lab for tracing a failed Win32 application deployment from assignment and detection logic to client-side Intune Management Extension evidence.",
    employerValue:
      "A corrected detection rule would need to be supported by the failed state, the decisive client log, and a separate successful detection retest.",
    ownership:
      "This scope is reserved for a dedicated lab tenant and disposable Windows device. It is not presented as completed work.",
    environment: ["Dedicated lab tenant", "Microsoft Intune", "Windows 11 ARM64", "Win32 app"],
    status: {
      completion: "Blocked by execution gate",
      execution: "No completed lab run",
      review: "Publication gate defined",
      publication: "Withheld",
      evidenceLevel: "E0"
    },
    question:
      "Why did an assigned Win32 application fail to report as installed, and which detection or applicability check made that decision?",
    approach: [
      "Use a dedicated tenant and a disposable device with no employer or personal production data.",
      "Package a harmless application and record a healthy assignment baseline.",
      "Introduce one controlled detection-rule fault and collect the failed management and client states.",
      "Correct only the known rule, force a new evaluation, and capture a separate successful detection retest. Use an explicit uninstall or a fresh device only if the lab is meant to prove a clean reinstall.",
      "Retire the test device, remove the assignment, and record cleanup before publication."
    ],
    outcome:
      "No public outcome is claimed. The route stays unbuilt until the failure, decisive log, correction, retest, and cleanup records exist.",
    limitation:
      "This candidate does not claim production deployment, Autopilot ownership, employer execution, tenant scale, or business impact.",
    claims: [],
    evidence: [],
    sources: [
      {
        id: "intune-win32-troubleshoot",
        title: "Troubleshoot Win32 app issues",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-ie/intune/intune-service/apps/apps-win32-troubleshoot",
        supports: "Client logs, application detection, applicability, and ARM64 support."
      },
      {
        id: "intune-win32-add-assign",
        title: "Add and assign Win32 apps",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/intune/app-management/deployment/add-win32",
        supports: "Assignment, requirement, and detection-rule behavior."
      }
    ]
  },
  {
    number: "F4",
    slug: "active-directory-recovery",
    title: "Active Directory secure-channel and Group Policy recovery",
    tier: "flagship",
    kind: "executed-lab",
    releaseState: "withheld",
    presentation: "directory",
    discipline: "Windows Server · Active Directory · Group Policy",
    summary:
      "A candidate isolated-domain lab for separating DNS reachability from a broken workstation trust relationship and validating policy after repair.",
    employerValue:
      "A completed record would need to show the failed trust state, the deciding checks, the repair, a rebooted sign-in, and applied policy.",
    ownership:
      "This scope is reserved for an isolated Windows Server and Windows 11 lab. It is not presented as completed work.",
    environment: ["Windows Server Core evaluation", "Active Directory Domain Services", "DNS", "Windows 11"],
    status: {
      completion: "Blocked by execution gate",
      execution: "No completed lab run",
      review: "Publication gate defined",
      publication: "Withheld",
      evidenceLevel: "E0"
    },
    question:
      "Can the client reach the correct domain services, and is the failure caused by DNS, the workstation secure channel, or policy processing?",
    approach: [
      "Build a two-machine domain on an isolated network and record a healthy baseline.",
      "Introduce one controlled trust failure without changing the client DNS configuration.",
      "Collect DNS, domain-controller, secure-channel, event, and policy evidence before repair.",
      "Repair the workstation trust, reboot, sign in with the test account, and run a separate policy retest.",
      "Restore or remove the disposable machines and retain only sanitized evidence."
    ],
    outcome:
      "No public outcome is claimed. The route stays unbuilt until native failure, repair, reboot, policy retest, and cleanup evidence pass review.",
    limitation:
      "This candidate does not claim production administration, replication, high availability, employer execution, or formal L3 ownership.",
    claims: [],
    evidence: [],
    sources: [
      {
        id: "ad-domain-join",
        title: "Join a computer to a domain",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/join-computer-to-domain",
        supports: "Secure-channel tests and repair guidance."
      },
      {
        id: "ad-domain-join-troubleshooting",
        title: "Active Directory domain join troubleshooting guidance",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-in/troubleshoot/windows-server/active-directory/active-directory-domain-join-troubleshooting-guidance",
        supports: "Netsetup logging, DNS dependencies, and domain-join evidence."
      }
    ]
  },
  {
    number: "N1",
    slug: "macos-enrollment-filevault",
    title: "macOS enrollment and FileVault support guide",
    tier: "technical-note",
    kind: "technical-note",
    releaseState: "published",
    presentation: "macos",
    discipline: "Technical note · macOS · Intune · FileVault",
    summary:
      "This guide helps locate where a Mac stopped: enrollment, policy delivery, FileVault, or recovery-key handling.",
    employerValue:
      "The next action depends on where the enrollment or encryption path stopped and whether device-owner or administrator approval is required.",
    ownership:
      "I used Microsoft and Apple deployment guidance to map the support checkpoints shown here. This is a source-based guide, not a managed-tenant lab.",
    environment: ["macOS", "Microsoft Intune guidance", "Apple deployment guidance"],
    status: {
      completion: "Research note",
      execution: "Not an executed lab",
      review: "Primary-source technical review",
      publication: "Cited sources and labelled aids",
      evidenceLevel: "source-cited"
    },
    question:
      "A Mac is not receiving policy, or the user cannot unlock the disk. Where did the process stop?",
    processHeading: "Separate enrollment state from encryption state before changing either.",
    evidenceHeading: "Diagrams and worksheets tied to the source guidance.",
    evidenceDescription:
      "The records below explain the support path. They are examples, not screenshots or output from a managed Mac.",
    matrixHeadings: {
      check: "Checkpoint",
      failure: "Evidence to collect",
      corrected: "Boundary"
    },
    approach: [
      "Confirm who owns the Mac and which enrollment method should apply. Personal enrollment, Automated Device Enrollment, and direct enrollment have different prerequisites.",
      "Check that the Apple MDM push certificate is active. For Company Portal enrollment, confirm that the user approved the management profile and returned to Company Portal to finish registration.",
      "Treat FileVault as a separate check. Confirm the encryption state, whether the account can unlock the volume, and whether an approved recovery key is escrowed.",
      "Stop before removing management, wiping the Mac, displaying a recovery key, or changing encryption without authorization and a recovery plan."
    ],
    outcome:
      "The note identifies the next safe check and makes the handoff boundary explicit.",
    limitation:
      "This is a cited technical note. It does not claim that I enrolled a Mac, administered a tenant, or recovered a live device.",
    claims: [
      {
        id: "mac-note-01",
        publicWording:
          "Device ownership, MDM registration, FileVault status, and recovery-key handling must be checked separately.",
        evidenceRefs: ["mac-flow", "mac-checks", "mac-boundary"],
        sourceRefs: ["mac-intune-enrollment", "mac-filevault-management"],
        limitation: "The workflow is based on cited vendor guidance.",
        verification: "source-cited"
      }
    ],
    evidence: [
      {
        id: "mac-flow",
        title: "Enrollment sequence",
        kind: "record",
        caption:
          "A step-by-step diagram showing where ownership, enrollment, management registration, compliance, and encryption checks separate.",
        claimIds: ["mac-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "01", value: "Confirm device ownership" },
          { label: "02", value: "Identify the approved enrollment method" },
          { label: "03", value: "Check MDM registration" },
          { label: "04", value: "Check policy receipt" },
          { label: "05", value: "Check FileVault and key escrow separately" }
        ],
        excerpt:
          "[support map]\nOwnership → enrollment method → MDM registration\n          → policy check → FileVault state → key escrow"
      },
      {
        id: "mac-checks",
        title: "Support worksheet",
        kind: "record",
        caption:
          "Illustrative checks to record before removing a profile or changing encryption. This is not captured device output.",
        claimIds: ["mac-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "Enrollment method", value: "Expected or unknown" },
          { label: "Management profile", value: "Present or missing" },
          { label: "Registration", value: "Complete or incomplete" },
          { label: "FileVault", value: "On, off, or unknown" },
          { label: "Recovery-key escrow", value: "Confirmed or not confirmed" }
        ],
        excerpt:
          "[illustrative worksheet]\nEnrollment method : expected / unknown\nManagement profile: present / missing\nRegistration       : complete / incomplete\nFileVault state    : on / off / unknown\nRecovery-key escrow: confirmed / not confirmed"
      },
      {
        id: "mac-boundary",
        title: "Escalation boundary",
        kind: "record",
        caption:
          "The note stops before actions that can remove management, expose a recovery key, or risk the user's data.",
        claimIds: ["mac-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "Profile removal", value: "Confirm authorization and recovery plan first" },
          { label: "Recovery key", value: "Do not display or rotate it without approval" },
          { label: "FileVault change", value: "Confirm the recovery path before changing encryption" },
          { label: "Erase or reenroll", value: "Stop until ownership and data risk are understood" }
        ],
        excerpt:
          "Stop and verify authorization before:\n• removing the management profile\n• displaying or rotating a recovery key\n• changing FileVault configuration\n• erasing or reenrolling the Mac"
      }
    ],
    matrix: [
      { check: "Ownership", failure: "Personal or organization-owned", corrected: "Use the approved enrollment path" },
      { check: "MDM registration", failure: "Profile and Company Portal state", corrected: "Tenant or APNs owner if incomplete" },
      { check: "FileVault", failure: "Encryption and unlock-user state", corrected: "Do not change without recovery plan" },
      { check: "Recovery key", failure: "Escrow confirmation only", corrected: "Never publish or expose the key" }
    ],
    sources: [
      {
        id: "mac-intune-enrollment",
        title: "Deployment guide: Enroll macOS devices in Microsoft Intune",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/mem/intune-service/fundamentals/deployment-guide-enrollment-macos",
        supports: "Enrollment methods, prerequisites, and Company Portal workflow."
      },
      {
        id: "mac-filevault-management",
        title: "Manage FileVault with device management",
        publisher: "Apple Platform Deployment",
        url: "https://support.apple.com/guide/deployment/manage-filevault-with-device-management-dep0a2cb7686/1/web/1.0",
        supports: "FileVault management and recovery-key handling."
      }
    ]
  },
  {
    number: "N2",
    slug: "laptop-boot-storage-triage",
    title: "Laptop boot and storage troubleshooting guide",
    tier: "technical-note",
    kind: "technical-note",
    releaseState: "published",
    presentation: "hardware",
    discipline: "Technical note · Hardware · Windows recovery",
    summary:
      "This checklist helps decide whether a no-boot laptop needs hardware service, BitLocker recovery, or Windows repair.",
    employerValue:
      "The startup stop point determines whether to preserve evidence, obtain an approved recovery key, begin Windows recovery, or hand the device to hardware service.",
    ownership:
      "I used Dell and Microsoft documentation to map the no-boot decision path. This is a source-based guide, not a repair record.",
    environment: ["Dell diagnostics guidance", "Windows 11", "BitLocker", "Windows Recovery Environment"],
    status: {
      completion: "Research note",
      execution: "Not an executed lab",
      review: "Primary-source technical review",
      publication: "Cited sources and labelled aids",
      evidenceLevel: "source-cited"
    },
    question:
      "The laptop will not start normally. Does firmware see the drive, do preboot diagnostics report a hardware fault, is BitLocker blocking access, or is Windows failing later?",
    processHeading: "Record where startup stops before choosing a repair path.",
    evidenceHeading: "A fault tree and ticket model, not a claimed repair.",
    evidenceDescription:
      "These diagrams organize vendor guidance into a support handoff. No service tag, diagnostic result, replacement, or completed repair is claimed.",
    matrixHeadings: {
      check: "Checkpoint",
      failure: "What to record",
      corrected: "Next boundary"
    },
    approach: [
      "Record the exact symptom before changing anything: no power, no POST, no bootable device, BitLocker recovery, or a Windows startup failure.",
      "Check whether firmware detects the storage device. On a Dell system, run the F12 preboot diagnostics before assuming Windows is the cause.",
      "Record the diagnostic result, error code, and validation code. Keep the service tag private.",
      "If hardware passes and the drive is detected, check the BitLocker recovery state before opening Windows Recovery Environment.",
      "Do not reset, reimage, initialize, or replace the drive until recovery-key availability and data risk are understood."
    ],
    outcome:
      "The note separates hardware service, approved recovery-key handling, and Windows startup recovery into different paths.",
    limitation:
      "This is a cited technical note. It does not claim that a component failed, data was recovered, a drive was replaced, or a laptop was repaired.",
    claims: [
      {
        id: "hardware-note-01",
        publicWording:
          "Firmware detection, preboot diagnostics, BitLocker state, and Windows recovery answer different parts of a no-boot ticket.",
        evidenceRefs: ["hardware-tree", "hardware-ticket", "hardware-boundary"],
        sourceRefs: [
          "hardware-dell-preboot",
          "hardware-bitlocker-recovery",
          "hardware-windows-recovery"
        ],
        limitation: "The support path is based on cited vendor guidance.",
        verification: "source-cited"
      }
    ],
    evidence: [
      {
        id: "hardware-tree",
        title: "POST-to-Windows fault tree",
        kind: "record",
        caption:
          "A fault map separating power and POST, storage detection, preboot diagnostics, encryption, and Windows startup.",
        claimIds: ["hardware-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "Power and POST", value: "Record the exact stop point" },
          { label: "Storage detection", value: "Confirm whether firmware sees the drive" },
          { label: "Preboot diagnostics", value: "Record result, error code, and validation code" },
          { label: "BitLocker", value: "Confirm the approved recovery-key path" },
          { label: "Windows recovery", value: "Proceed only after hardware and data boundaries are clear" }
        ],
        excerpt:
          "[fault tree]\nPower → POST → drive detected → diagnostics\n                         ↓ pass\n                 BitLocker state → Windows RE"
      },
      {
        id: "hardware-ticket",
        title: "Synthetic support record",
        kind: "record",
        caption:
          "An illustrative handoff format. It is not an employer ticket or a record from a repaired laptop.",
        claimIds: ["hardware-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "Symptom", value: "Record the exact startup stop" },
          { label: "Firmware drive", value: "Detected or not detected" },
          { label: "Diagnostics", value: "Result and code, with no service tag" },
          { label: "BitLocker", value: "Recovery state only" },
          { label: "Data boundary", value: "Risk and approval recorded" },
          { label: "Next owner", value: "Hardware, identity, or Windows support" }
        ],
        excerpt:
          "Symptom       : [record exact startup stop]\nFirmware drive : [detected / not detected]\nDiagnostics    : [result and code, no service tag]\nBitLocker      : [recovery state only]\nData boundary  : [risk and approval recorded]\nNext owner     : [hardware / identity / Windows]"
      },
      {
        id: "hardware-boundary",
        title: "Data-risk boundary",
        kind: "record",
        caption:
          "Actions that can destroy evidence or data remain outside the note until authorization and recovery information are confirmed.",
        claimIds: ["hardware-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "Initialize or erase", value: "Stop until ownership and backup state are known" },
          { label: "Reset or reimage", value: "Stop until the recovery-key path is confirmed" },
          { label: "Replace the drive", value: "Preserve evidence and follow the authorized repair path" }
        ],
        excerpt:
          "Do not initialize, reset, reimage, replace, or erase\nuntil ownership, recovery-key access, backup state,\nand the authorized repair path are known."
      }
    ],
    matrix: [
      { check: "Power and POST", failure: "LED, beep, screen, and exact message", corrected: "Hardware path if POST fails" },
      { check: "Storage detection", failure: "Firmware sees drive or does not", corrected: "Preserve data-risk boundary" },
      { check: "Preboot diagnostics", failure: "Result, error, validation code", corrected: "Hardware service if fault is reported" },
      { check: "BitLocker and WinRE", failure: "Recovery state and key availability", corrected: "Approved recovery before repair" }
    ],
    sources: [
      {
        id: "hardware-dell-preboot",
        title: "How to run Dell preboot diagnostics",
        publisher: "Dell Support",
        url: "https://www.dell.com/support/kbdoc/en-us/000181163/how-to-enter-the-built-in-diagnostics-32-bit-diagnostics-supportassist-epsa-epsa-and-psa",
        supports: "Preboot diagnostic workflow and result collection."
      },
      {
        id: "hardware-bitlocker-recovery",
        title: "BitLocker recovery process",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/recovery-process",
        supports: "Approved recovery-key handling and help-desk boundaries."
      },
      {
        id: "hardware-windows-recovery",
        title: "Windows Recovery Environment",
        publisher: "Microsoft Support",
        url: "https://support.microsoft.com/en-us/windows/windows-recovery-environment-0eb14733-6301-41cb-8d26-06a12b42770b",
        supports: "Windows startup recovery scope and encrypted-drive boundary."
      }
    ]
  },
  {
    number: "N3",
    slug: "enterprise-wifi-triage",
    title: "Enterprise Wi-Fi troubleshooting guide",
    tier: "technical-note",
    kind: "technical-note",
    releaseState: "published",
    presentation: "wifi",
    discipline: "Technical note · Wi-Fi · 802.1X · Windows",
    summary:
      "The Windows checklist moves from adapter and association through 802.1X, DHCP, gateway, DNS, and service reachability.",
    employerValue:
      "A useful handoff identifies the failed layer and preserves the client evidence for the next owner.",
    ownership:
      "I used Microsoft wireless documentation to build this client-side checklist. It does not claim access-point, controller, or RADIUS administration.",
    environment: ["Windows 11", "WLAN AutoConfig", "802.1X concepts", "TCP/IP"],
    status: {
      completion: "Research note",
      execution: "Not an executed lab",
      review: "Primary-source technical review",
      publication: "Cited sources and labelled aids",
      evidenceLevel: "source-cited"
    },
    question:
      "The network is visible, but the user cannot reach internal services. Did Windows associate, authenticate, receive usable IP settings, or fail later in the path?",
    processHeading: "Move from radio state to service reachability without skipping a layer.",
    evidenceHeading: "A client-side worksheet and handoff model.",
    evidenceDescription:
      "The records below are worksheets based on cited Windows commands and troubleshooting guidance. They are not captures from a corporate wireless network.",
    matrixHeadings: {
      check: "Layer",
      failure: "Client evidence",
      corrected: "Likely owner"
    },
    approach: [
      "Confirm that Windows detects the wireless adapter and record the active interface, driver, configured profile, and connection state.",
      "Generate the Windows wireless report and review the WLAN AutoConfig operational log. Preserve the failure reason instead of repeatedly deleting the profile.",
      "If Windows reports a connection, inspect the assigned address, default route, DNS configuration, and direct service reachability. Record an ICMP response from the gateway if it is permitted, but do not treat no reply as decisive by itself.",
      "Hand off certificate or 802.1X failures with the client evidence. Hand off DHCP, gateway, or upstream-path failures with the client configuration already recorded."
    ],
    outcome:
      "The note narrows a wireless ticket to the endpoint, authentication path, or network path and defines the evidence for the next owner.",
    limitation:
      "This is a cited technical note. It does not claim access-point, controller, certificate-authority, NPS, or RADIUS administration.",
    claims: [
      {
        id: "wifi-note-01",
        publicWording:
          "Adapter status, association, authentication, IP configuration, gateway tests, and DNS each answer a different part of the ticket.",
        evidenceRefs: ["wifi-layers", "wifi-worksheet", "wifi-handoff"],
        sourceRefs: [
          "wifi-netsh",
          "wifi-8021x",
          "wifi-ipconfig",
          "wifi-ping",
          "wifi-nslookup",
          "wifi-test-netconnection"
        ],
        limitation: "The workflow is based on cited Microsoft guidance.",
        verification: "source-cited"
      }
    ],
    evidence: [
      {
        id: "wifi-layers",
        title: "Connection ladder",
        kind: "record",
        caption:
          "A connection map that stops at the first unsupported layer instead of treating every symptom as a signal problem.",
        claimIds: ["wifi-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "01", value: "Adapter detected" },
          { label: "02", value: "Associated to the expected network" },
          { label: "03", value: "802.1X authentication completed" },
          { label: "04", value: "Usable IP configuration received" },
          { label: "05", value: "Gateway and route tested" },
          { label: "06", value: "DNS and approved service tested" }
        ],
        excerpt:
          "[connection ladder]\nAdapter → association → 802.1X authentication\n        → DHCP address → gateway → DNS → service"
      },
      {
        id: "wifi-worksheet",
        title: "Command worksheet",
        kind: "command",
        caption:
          "Commands to collect client state. The fields shown are prompts, not invented terminal results.",
        claimIds: ["wifi-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        excerpt:
          "netsh wlan show interfaces\nnetsh wlan show drivers\nnetsh wlan show wlanreport\nipconfig /all\nping <default-gateway>\nnslookup <approved-test-name>\nTest-NetConnection <approved-service> -Port <port>"
      },
      {
        id: "wifi-handoff",
        title: "Handoff record",
        kind: "record",
        caption:
          "An illustrative ticket structure separating endpoint, identity, and network ownership.",
        claimIds: ["wifi-note-01"],
        privacyClass: "public-sanitized",
        role: "deterministic-illustration",
        items: [
          { label: "Association", value: "State recorded" },
          { label: "Authentication", value: "Failure reason recorded" },
          { label: "IPv4 and gateway", value: "Client configuration recorded" },
          { label: "DNS and service", value: "Approved tests recorded" },
          { label: "First failed layer", value: "Endpoint, identity, or network" },
          { label: "Next owner", value: "Named support function" }
        ],
        excerpt:
          "Association state : [recorded]\nAuth failure reason: [recorded]\nIPv4 / gateway     : [recorded]\nDNS / direct test  : [recorded]\nFirst failed layer : [endpoint / identity / network]\nNext owner         : [named support function]"
      }
    ],
    matrix: [
      { check: "Adapter and association", failure: "Interface, driver, profile, state", corrected: "Endpoint support" },
      { check: "802.1X authentication", failure: "WLAN report and AutoConfig reason", corrected: "Identity or wireless owner" },
      { check: "DHCP and gateway", failure: "Address, route, and ICMP response if permitted", corrected: "No reply alone does not prove a path failure" },
      { check: "DNS and service", failure: "Resolver and direct service tests", corrected: "DNS, application, or path owner" }
    ],
    sources: [
      {
        id: "wifi-netsh",
        title: "netsh wlan",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-wlan",
        supports: "Wireless interface, profile, driver, and report commands."
      },
      {
        id: "wifi-8021x",
        title: "Data collection for 802.1X authentication issues",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/data-collection-for-troubleshooting-802-1x-authentication-issues",
        supports: "Client-side authentication evidence and escalation data."
      },
      {
        id: "wifi-ipconfig",
        title: "ipconfig",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig",
        supports: "Address, gateway, DHCP, and DNS configuration collection."
      },
      {
        id: "wifi-ping",
        title: "ping",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping",
        supports: "ICMP echo testing. A missing reply alone does not prove the host or path is unavailable."
      },
      {
        id: "wifi-nslookup",
        title: "nslookup",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup",
        supports: "DNS query and resolver checks."
      },
      {
        id: "wifi-test-netconnection",
        title: "Test-NetConnection",
        publisher: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection?view=windowsserver2025-ps",
        supports: "TCP port and route diagnostics from a Windows client."
      }
    ]
  },
  {
    number: "05",
    slug: "network-inventory-drift",
    title: "Network inventory drift",
    tier: "supporting",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "inventory",
    discipline: "Networking · Nmap · Inventory comparison",
    summary:
      "In an isolated Docker network, an Nmap comparison identifies one missing device, one new device, one address change, and one uncertain result.",
    employerValue:
      "The result keeps observed changes separate from uncertain data and returns to zero findings after correction.",
    ownership:
      "I built the comparison tool, defined the expected inventory and scan boundary, ran the isolated container states, reviewed the output, and prepared the sanitized package.",
    environment: ["Docker internal network", "Nmap", "Python", "Graphviz"],
    status: {
      completion: "Complete within stated scope",
      execution: "Isolated Docker and Nmap run",
      review: "Manifest and technical review",
      publication: "Selected evidence on this page",
      evidenceLevel: "E4"
    },
    question:
      "Which differences between the expected inventory and the observed target list need action, and which observation is too uncertain to treat as fact?",
    approach: [
      "Declare the expected devices, addresses, and the exact owned scan targets before execution.",
      "Record a zero-finding baseline, then introduce one missing device, one new device, one address change, and one uncertain observation.",
      "Run the same comparison after correction and after rebuilding the original state.",
      "Export only documentation addresses, sanitized topology files, result JSON, and checksums."
    ],
    processLabel: "Comparison sequence",
    processHeading:
      "Declare the expected inventory, insert the differences, then compare the corrected state.",
    outcome:
      "The inserted state produced four expected finding types. Correction, rollback, and the repeat each returned zero findings.",
    limitation:
      "This is an isolated container network with explicit owned targets. It does not claim real-time monitoring, 802.1Q behavior, or an enterprise deployment.",
    claims: [
      {
        id: "inventory-drift-01",
        publicWording:
          "The inserted state reported a changed address, a missing device, a new device, and an uncertain observation.",
        evidenceRefs: ["inventory-failure-map", "inventory-evaluation"],
        limitation: "The finding types apply only to the declared lab inventory.",
        verification: "verified"
      },
      {
        id: "inventory-retest-01",
        publicWording:
          "Correction, rollback, and the final repeat each returned zero findings.",
        evidenceRefs: ["inventory-correction-map", "inventory-evaluation"],
        limitation: "The retests use the same isolated target list and expected inventory.",
        verification: "verified"
      }
    ],
    evidence: [
      {
        id: "inventory-baseline-map",
        title: "Expected state",
        kind: "diagram",
        caption:
          "The baseline topology shows the four declared devices before a difference is introduced.",
        claimIds: ["inventory-drift-01"],
        privacyClass: "public-sanitized",
        role: "derived-visual",
        origin: "derived",
        proofValue: "explanation",
        src: "/work-assets/evidence/network-inventory-v5/baseline/topology.svg",
        width: 900,
        height: 398,
        download: "/work-assets/evidence/network-inventory-v5/baseline/drift.json",
        alt: "Baseline network inventory with four expected devices"
      },
      {
        id: "inventory-failure-map",
        title: "Observed differences",
        kind: "diagram",
        caption:
          "The failure topology visualizes the changed, missing, new, and uncertain observations reported by the comparison.",
        claimIds: ["inventory-drift-01"],
        privacyClass: "public-sanitized",
        role: "derived-visual",
        origin: "derived",
        proofValue: "execution",
        src: "/work-assets/evidence/network-inventory-v5/failure/topology.svg",
        width: 900,
        height: 398,
        download: "/work-assets/evidence/network-inventory-v5/failure/drift.json",
        alt: "Network inventory comparison showing four inserted difference types"
      },
      {
        id: "inventory-correction-map",
        title: "Correction and retest",
        kind: "diagram",
        caption:
          "The correction topology returns to the declared inventory, and the result JSON reports zero findings.",
        claimIds: ["inventory-retest-01"],
        privacyClass: "public-sanitized",
        role: "derived-visual",
        origin: "derived",
        proofValue: "execution",
        src: "/work-assets/evidence/network-inventory-v5/correction/topology.svg",
        width: 900,
        height: 398,
        download: "/work-assets/evidence/network-inventory-v5/correction/drift.json",
        alt: "Corrected network inventory returned to the expected four-device state"
      },
      {
        id: "inventory-evaluation",
        title: "State evaluation",
        kind: "result",
        caption:
          "The run evaluator records four finding types in the inserted state and zero in correction, rollback, and repeat.",
        claimIds: ["inventory-drift-01", "inventory-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/network-inventory-v5/evaluation.json",
        excerpt:
          "baseline      : 0 findings\nfailure       : 4 findings\n  changed_ip · missing_device · new_device · uncertain_observation\ncorrection     : 0 findings\nrollback       : 0 findings\nclean repeat   : 0 findings"
      },
      {
        id: "inventory-package",
        title: "Public evidence package",
        kind: "record",
        caption:
          "The checksum list covers the published JSON, Nmap XML, topology files, environment record, and test result.",
        claimIds: ["inventory-drift-01", "inventory-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/network-inventory-v5/SHA256SUMS.txt",
        excerpt:
          "Public package\n• state JSON and topology files\n• sanitized Nmap XML\n• environment and dependency records\n• test output and SHA-256 checksums"
      }
    ],
    visualization: {
      title: "Compare the declared and observed states.",
      description:
        "The failure state changes only the nodes needed to produce the four reviewed finding types.",
      depth: "layered",
      nodes: [
        { id: "router", label: "Edge router", detail: "Expected" },
        { id: "workstation", label: "Workstation", detail: "Address check" },
        { id: "backup", label: "Backup NAS", detail: "Presence check" },
        { id: "printer", label: "Printer", detail: "Observation confidence" },
        { id: "new-device", label: "New device", detail: "Unexpected target" }
      ],
      states: [
        {
          id: "baseline",
          label: "Baseline",
          summary: "All declared targets are present and no additional target is observed.",
          artifactIds: ["inventory-baseline-map"],
          nodeStates: { router: "normal", workstation: "normal", backup: "normal", printer: "normal", "new-device": "unknown" }
        },
        {
          id: "differences",
          label: "Inserted differences",
          summary: "One address changes, one device disappears, one new device appears, and one observation remains uncertain.",
          artifactIds: ["inventory-failure-map", "inventory-evaluation"],
          nodeStates: { router: "normal", workstation: "changed", backup: "failed", printer: "unknown", "new-device": "changed" }
        },
        {
          id: "retest",
          label: "Retest",
          summary: "The declared devices and addresses return, and the comparison reports zero findings.",
          artifactIds: ["inventory-correction-map", "inventory-evaluation"],
          nodeStates: { router: "normal", workstation: "normal", backup: "normal", printer: "normal", "new-device": "unknown" }
        }
      ]
    }
  },
  {
    number: "06",
    slug: "tls-service-trust",
    title: "TLS certificate and hostname triage",
    tier: "supporting",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "tls",
    discipline: "Systems support · TLS · OpenSSL",
    summary:
      "A loopback service test separates an untrusted issuer from a hostname mismatch, then verifies the corrected certificate and HTTPS response.",
    employerValue:
      "A reachable port is not enough. The client must trust the issuer and the requested hostname must match the certificate.",
    ownership:
      "I created the local certificate authority and service certificates, ran the two failure states, inspected the handshake, corrected the certificate selection, and repeated the HTTPS check.",
    environment: ["macOS ARM64", "OpenSSL 3.6", "curl", "Loopback only"],
    status: {
      completion: "Complete within stated scope",
      execution: "Local OpenSSL service run",
      review: "Scripted assertions and artifact check",
      publication: "Selected evidence on this page",
      evidenceLevel: "E3"
    },
    question:
      "The service port answers, but the client refuses HTTPS. Is the issuer untrusted, or does the certificate identify a different hostname?",
    approach: [
      "Create a private lab authority and issue separate certificates for the expected and incorrect hostnames.",
      "Serve the incorrect certificate while trusting the lab authority and record the hostname verification failure.",
      "Serve the expected certificate without the authority file and record the trust failure.",
      "Use the expected certificate and authority together, inspect the handshake, and run a separate HTTPS retest."
    ],
    processLabel: "TLS checks",
    processHeading:
      "Separate port reachability, hostname validation, and issuer trust.",
    outcome:
      "The hostname test and issuer-trust test both failed with curl exit 60 for different reasons. The corrected service returned HTTP 200 with certificate verification result 0.",
    limitation:
      "This is a short-lived loopback lab. It does not test public certificate issuance, browser policy, OCSP, load balancers, or production renewal.",
    claims: [
      {
        id: "tls-faults-01",
        publicWording:
          "The trusted wrong-host certificate failed hostname verification, while the expected certificate failed when its issuer was not trusted.",
        evidenceRefs: ["tls-hostname-fault", "tls-trust-fault"],
        limitation: "The two states use a private lab authority and one local service.",
        verification: "lab-demonstrated"
      },
      {
        id: "tls-retest-01",
        publicWording:
          "With the expected hostname and trusted issuer, the retest returned HTTP 200 and certificate verification result 0.",
        evidenceRefs: ["tls-certificate-check", "tls-retest"],
        limitation: "The successful result covers one loopback HTTPS endpoint.",
        verification: "lab-demonstrated"
      }
    ],
    evidence: [
      {
        id: "tls-hostname-fault",
        title: "Hostname mismatch",
        kind: "command",
        caption:
          "The issuer was trusted, but the certificate did not contain the requested service hostname.",
        claimIds: ["tls-faults-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/tls-service-trust/hostname-fault.txt",
        excerpt:
          "curl: (60) SSL: no alternative certificate subject name matches target host name 'service.lab.test'"
      },
      {
        id: "tls-trust-fault",
        title: "Untrusted issuer",
        kind: "command",
        caption:
          "The expected hostname was served, but the client did not have the private lab authority.",
        claimIds: ["tls-faults-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/tls-service-trust/untrusted-ca-fault.txt",
        excerpt:
          "curl: (60) SSL certificate problem: unable to get local issuer certificate"
      },
      {
        id: "tls-certificate-check",
        title: "Certificate inspection",
        kind: "result",
        caption:
          "OpenSSL reports the expected subject, the lab issuer, TLS 1.3, and a successful verification return code.",
        claimIds: ["tls-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/tls-service-trust/certificate-check.txt",
        excerpt:
          "subject=CN=service.lab.test\nissuer=CN=Portfolio Lab CA\nProtocol: TLSv1.3\nVerify return code: 0 (ok)"
      },
      {
        id: "tls-retest",
        title: "Separate HTTPS retest",
        kind: "result",
        caption:
          "A new request after correction records the HTTP status, loopback address, and certificate result.",
        claimIds: ["tls-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/tls-service-trust/separate-retest.txt",
        excerpt:
          "http_code=200\nremote_ip=127.0.0.1\nssl_verify_result=0"
      },
      {
        id: "tls-package",
        title: "Evidence checksums",
        kind: "record",
        caption:
          "The public package lists the failure outputs, certificate check, retest, and environment record.",
        claimIds: ["tls-faults-01", "tls-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/tls-service-trust/SHA256SUMS.txt",
        excerpt:
          "Public package\n• hostname failure\n• issuer-trust failure\n• certificate check\n• separate HTTPS retest\n• SHA-256 checksums"
      }
    ],
    visualization: {
      title: "A TLS connection has more than one gate.",
      description:
        "Port reachability stays available in both failures. The selected state shows which certificate check stops the request.",
      depth: "layered",
      nodes: [
        { id: "tcp", label: "TCP port", detail: "Service answers" },
        { id: "hostname", label: "Hostname", detail: "SAN match" },
        { id: "issuer", label: "Issuer trust", detail: "CA available" },
        { id: "https", label: "HTTPS", detail: "Application response" }
      ],
      states: [
        {
          id: "wrong-hostname",
          label: "Wrong hostname",
          summary: "TCP answers and the issuer is trusted, but the requested hostname is absent from the certificate.",
          artifactIds: ["tls-hostname-fault"],
          nodeStates: { tcp: "normal", hostname: "failed", issuer: "normal", https: "failed" }
        },
        {
          id: "untrusted-issuer",
          label: "Untrusted issuer",
          summary: "The hostname matches, but the client cannot build trust to the lab authority.",
          artifactIds: ["tls-trust-fault"],
          nodeStates: { tcp: "normal", hostname: "normal", issuer: "failed", https: "failed" }
        },
        {
          id: "verified",
          label: "Verified retest",
          summary: "Hostname and issuer checks pass, and the service returns HTTP 200.",
          artifactIds: ["tls-certificate-check", "tls-retest"],
          nodeStates: { tcp: "normal", hostname: "normal", issuer: "normal", https: "normal" }
        }
      ]
    }
  },
  {
    number: "07",
    slug: "smb-share-access",
    title: "SMB authentication and share permissions",
    tier: "supporting",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "smb",
    discipline: "IT support · SMB · Samba",
    summary:
      "An isolated Samba lab shows the difference between a wrong password and a valid user who lacks access to the share.",
    employerValue:
      "Two users can reach the same SMB service and fail for different reasons, so connectivity, authentication, and authorization must be checked separately.",
    ownership:
      "I built the isolated Samba service, created synthetic users and a read-only share, ran the credential and authorization failures, changed only the intended access boundary, and repeated the file read.",
    environment: ["Samba 4.21", "SMB client", "Docker internal network", "ARM64"],
    status: {
      completion: "Complete within stated scope",
      execution: "Isolated Samba client and server run",
      review: "Scripted assertions and artifact check",
      publication: "Selected evidence on this page",
      evidenceLevel: "E3"
    },
    question:
      "The share is reachable, but access fails. Did authentication fail, or did a valid user reach a share they were not authorized to open?",
    approach: [
      "Create two synthetic users and one read-only support share on an internal Docker network.",
      "Record a wrong-password failure for the allowed user.",
      "Use the second user’s correct password and record the separate share authorization failure.",
      "Add only that user to the allowed share and filesystem group, reload the configuration, and repeat the file read.",
      "Confirm that an unknown user still fails authentication."
    ],
    processLabel: "Access checks",
    processHeading:
      "Test connectivity, authentication, share rules, and filesystem access in that order.",
    outcome:
      "The wrong password returned a logon failure. The valid but unauthorized user reached the SMB service and received access denied. After the group and share change, that user read the sentinel file in two separate sessions. A separate negative test confirmed that a nonexistent account still failed session setup.",
    limitation:
      "This is one Samba server and a synthetic read-only share. It does not claim Windows Server, DFS, production NTFS, Kerberos, or domain administration.",
    claims: [
      {
        id: "smb-faults-01",
        publicWording:
          "The lab produced distinct logon-failure and access-denied results for the same reachable SMB service.",
        evidenceRefs: ["smb-bad-password", "smb-access-denied"],
        limitation: "The identities and share exist only inside the isolated lab.",
        verification: "lab-demonstrated"
      },
      {
        id: "smb-retest-01",
        publicWording:
          "After the share and group change, the previously denied user read the sentinel file in a separate retest, while an unknown user still failed session setup.",
        evidenceRefs: ["smb-config", "smb-correction", "smb-retest", "smb-negative-boundary"],
        limitation: "The retest proves read access to one controlled file.",
        verification: "lab-demonstrated"
      }
    ],
    evidence: [
      {
        id: "smb-bad-password",
        title: "Credential failure",
        kind: "command",
        caption:
          "The allowed account reaches SMB but fails session setup when the password is wrong.",
        claimIds: ["smb-faults-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/smb-share-access/bad-credentials.txt",
        excerpt: "session setup failed: NT_STATUS_LOGON_FAILURE"
      },
      {
        id: "smb-access-denied",
        title: "Authorization failure",
        kind: "command",
        caption:
          "The second account authenticates but cannot connect to the support share.",
        claimIds: ["smb-faults-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/smb-share-access/authorization-fault.txt",
        excerpt: "tree connect failed: NT_STATUS_ACCESS_DENIED"
      },
      {
        id: "smb-config",
        title: "Corrected access boundary",
        kind: "record",
        caption:
          "The share now names both synthetic users, and the second account belongs to the filesystem owner group.",
        claimIds: ["smb-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/smb-share-access/corrected-boundary.txt",
        excerpt:
          "[support]\npath = /srv/support\nvalid users = labuser auditor\n\nauditor groups: auditor, labuser\nshare mode: 0750"
      },
      {
        id: "smb-correction",
        title: "Read after correction",
        kind: "result",
        caption:
          "The previously denied account lists the share and reads the controlled sentinel file.",
        claimIds: ["smb-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/smb-share-access/correction.txt",
        excerpt:
          "readme.txt  25 bytes\ncontrolled support share\ngetting file \\readme.txt of size 25"
      },
      {
        id: "smb-retest",
        title: "Separate session retest",
        kind: "result",
        caption:
          "A new SMB client process reads the same 25-byte sentinel file.",
        claimIds: ["smb-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/smb-share-access/separate-retest.txt",
        excerpt:
          "controlled support share\ngetting file \\readme.txt of size 25"
      },
      {
        id: "smb-package",
        title: "Evidence checksums",
        kind: "record",
        caption:
          "The public package covers both failures, the corrected configuration, the file reads, and the environment record.",
        claimIds: ["smb-faults-01", "smb-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/smb-share-access/SHA256SUMS.txt",
        excerpt:
          "Public package\n• credential and authorization failures\n• corrected share configuration\n• correction and separate retest\n• SHA-256 checksums"
      },
      {
        id: "smb-negative-boundary",
        title: "Unknown user remains denied",
        kind: "result",
        caption:
          "A separate request from a nonexistent account still fails session setup after the intended access change.",
        claimIds: ["smb-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/smb-share-access/negative-boundary.txt",
        excerpt: "session setup failed: NT_STATUS_LOGON_FAILURE"
      }
    ],
    visualization: {
      title: "Find the first gate that rejects the request.",
      description:
        "Connectivity is available in every state. The difference is whether the request stops at authentication or share authorization.",
      depth: "layered",
      nodes: [
        { id: "service", label: "SMB service", detail: "Reachable" },
        { id: "auth", label: "Credentials", detail: "Session setup" },
        { id: "share", label: "Share rule", detail: "valid users" },
        { id: "filesystem", label: "Filesystem", detail: "Group and mode" },
        { id: "file", label: "Sentinel file", detail: "Read test" }
      ],
      states: [
        {
          id: "bad-password",
          label: "Bad password",
          summary: "The SMB service answers, but session authentication fails.",
          artifactIds: ["smb-bad-password"],
          nodeStates: { service: "normal", auth: "failed", share: "unknown", filesystem: "unknown", file: "unknown" }
        },
        {
          id: "access-denied",
          label: "Access denied",
          summary: "Authentication succeeds, but the share rejects the valid account before file access.",
          artifactIds: ["smb-access-denied"],
          nodeStates: { service: "normal", auth: "normal", share: "failed", filesystem: "failed", file: "failed" }
        },
        {
          id: "retest",
          label: "Retest",
          summary: "The intended share and group change allows the file read in a new session.",
          artifactIds: ["smb-config", "smb-correction", "smb-retest", "smb-negative-boundary"],
          nodeStates: { service: "normal", auth: "normal", share: "changed", filesystem: "changed", file: "normal" }
        }
      ]
    }
  },
  {
    number: "08",
    slug: "reverse-proxy-path",
    title: "Tracing an HTTP 502 through a reverse proxy",
    tier: "supporting",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "service",
    discipline: "Systems support · HTTP · Nginx",
    summary:
      "The proxy is reachable and the backend is healthy. The error log points to one incorrect upstream port.",
    employerValue:
      "A client-facing 502 does not prove the application is down. Direct upstream health and proxy configuration must be checked separately.",
    ownership:
      "I built the isolated proxy and backend, inserted the wrong upstream port, captured the 502 and connection-refused log, corrected one configuration line, and repeated the health request.",
    environment: ["Nginx 1.29", "Python HTTP server", "Docker internal network", "ARM64"],
    status: {
      completion: "Complete within stated scope",
      execution: "Isolated proxy and backend run",
      review: "Scripted assertions and artifact check",
      publication: "Selected evidence on this page",
      evidenceLevel: "E3"
    },
    question:
      "The proxy is reachable but returns 502. Is the backend unhealthy, or is the proxy trying the wrong upstream address or port?",
    approach: [
      "Start a small backend health endpoint and confirm it returns the expected response directly.",
      "Point the proxy at a different, closed upstream port and repeat the same client request.",
      "Read the proxy configuration and error log together instead of restarting both services.",
      "Correct only the upstream port, recreate the proxy, and run two successful health requests."
    ],
    processLabel: "Service path",
    processHeading:
      "Check the backend directly before changing the proxy.",
    outcome:
      "The backend returned healthy while the proxy returned 502 and logged connection refused to port 9090. Pointing the proxy to the backend’s actual port 8081 returned HTTP 200 and the expected health response in the correction and separate retest.",
    limitation:
      "This is one internal Docker network and one HTTP health endpoint. It does not test public DNS, TLS termination, load balancing, authentication, or production service ownership.",
    claims: [
      {
        id: "proxy-fault-01",
        publicWording:
          "The backend health endpoint passed directly while the proxy returned 502 and logged a refused connection to port 9090.",
        evidenceRefs: ["proxy-direct", "proxy-fault", "proxy-log"],
        limitation: "The failure covers one inserted upstream-port error.",
        verification: "lab-demonstrated"
      },
      {
        id: "proxy-retest-01",
        publicWording:
          "Changing the upstream port to 8081 returned HTTP 200 and the expected health response in the correction and separate retest.",
        evidenceRefs: ["proxy-config", "proxy-correction", "proxy-retest"],
        limitation: "The successful result covers one local health route.",
        verification: "lab-demonstrated"
      }
    ],
    evidence: [
      {
        id: "proxy-direct",
        title: "Direct backend check",
        kind: "result",
        caption:
          "The application responds directly before any proxy change is made.",
        claimIds: ["proxy-fault-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/reverse-proxy-path/direct-upstream-pass.txt",
        excerpt: "service=inventory-api status=healthy"
      },
      {
        id: "proxy-fault",
        title: "Client-facing failure",
        kind: "command",
        caption:
          "The same health request through the proxy returns HTTP 502.",
        claimIds: ["proxy-fault-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/reverse-proxy-path/proxy-fault.txt",
        excerpt: "HTTP/1.1 502 Bad Gateway"
      },
      {
        id: "proxy-log",
        title: "Upstream refusal",
        kind: "result",
        caption:
          "The proxy log identifies a refused connection to the configured upstream port 9090.",
        claimIds: ["proxy-fault-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/reverse-proxy-path/upstream-error.txt",
        excerpt:
          "connect() failed (111: Connection refused)\nupstream: http://[isolated-lab-address]:9090/health"
      },
      {
        id: "proxy-config",
        title: "One-line correction",
        kind: "record",
        caption:
          "The proxy target changes from the closed port 9090 to the backend’s actual port 8081.",
        claimIds: ["proxy-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/reverse-proxy-path/corrected-config.txt",
        excerpt:
          "before: proxy_pass http://backend:9090/health;\nafter : proxy_pass http://backend:8081/health;"
      },
      {
        id: "proxy-correction",
        title: "Correction result",
        kind: "result",
        caption:
          "The request through the corrected proxy returns the backend health line.",
        claimIds: ["proxy-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/reverse-proxy-path/correction-response.txt",
        excerpt:
          "HTTP/1.1 200 OK\nservice=inventory-api status=healthy"
      },
      {
        id: "proxy-retest",
        title: "Separate retest",
        kind: "result",
        caption:
          "A second request after correction returns the same expected health response.",
        claimIds: ["proxy-retest-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/reverse-proxy-path/separate-retest-response.txt",
        excerpt:
          "HTTP/1.1 200 OK\nservice=inventory-api status=healthy"
      }
    ],
    visualization: {
      title: "Check the service path one hop at a time.",
      description:
        "The backend stays healthy while the proxy points to the wrong port. Only the upstream hop changes.",
      depth: "layered",
      nodes: [
        { id: "client", label: "Client", detail: "Health request" },
        { id: "proxy", label: "Nginx proxy", detail: "Reachable" },
        { id: "upstream", label: "Upstream port", detail: "9090 or 8081" },
        { id: "backend", label: "Backend", detail: "Healthy on 8081" }
      ],
      states: [
        {
          id: "direct",
          label: "Direct check",
          summary: "The backend answers on port 8081 before the proxy is changed.",
          artifactIds: ["proxy-direct"],
          nodeStates: { client: "normal", proxy: "unknown", upstream: "normal", backend: "normal" }
        },
        {
          id: "proxy-fault",
          label: "Proxy fault",
          summary: "The proxy answers the client but attempts the closed upstream port 9090.",
          artifactIds: ["proxy-fault", "proxy-log"],
          nodeStates: { client: "normal", proxy: "normal", upstream: "failed", backend: "normal" }
        },
        {
          id: "retest",
          label: "Retest",
          summary: "The proxy targets port 8081 and the health response passes twice.",
          artifactIds: ["proxy-config", "proxy-correction", "proxy-retest"],
          nodeStates: { client: "normal", proxy: "normal", upstream: "changed", backend: "normal" }
        }
      ]
    }
  },
  {
    number: "09",
    slug: "ssh-access-permissions",
    title: "SSH access and private-key permissions",
    tier: "supporting",
    kind: "executed-lab",
    releaseState: "published",
    presentation: "service",
    discipline: "Systems support · SSH · Linux",
    summary:
      "The SSH service is reachable, but access fails first with the wrong key and then because the correct key has an unsafe local file mode.",
    employerValue:
      "A reachable SSH port does not prove that the client can use its key or that the server accepts the requested account.",
    ownership:
      "I built the isolated SSH server and client, created synthetic keys and accounts, ran the two failure states, corrected the private-key mode, and repeated the remote file check.",
    environment: ["OpenSSH", "Alpine Linux", "Docker internal network", "ARM64"],
    status: {
      completion: "Complete within stated scope",
      execution: "Isolated OpenSSH client and server run",
      review: "Scripted assertions and artifact check",
      publication: "Selected evidence on this page",
      evidenceLevel: "E3"
    },
    question:
      "Port 22 answers, but the session fails. Is the key unauthorized, is the client refusing to use the private key, or is the requested account outside the server rule?",
    approach: [
      "Start an OpenSSH server on an internal Docker network with one allowed synthetic account and one authorized public key.",
      "Confirm that port 22 is reachable, then try a different valid key and record the public-key denial.",
      "Use the authorized key with mode 0644 and record the client-side unsafe-permissions refusal.",
      "Copy the key into the disposable client, set mode 0600, and run a remote identity and sentinel-file check.",
      "Repeat the successful check in a new client and confirm that an unknown account still fails."
    ],
    processLabel: "Access checks",
    processHeading:
      "Separate service reachability, local key handling, server authorization, and account boundaries.",
    outcome:
      "The wrong key reached the server and was denied. The authorized key was ignored at mode 0644, then worked at mode 0600. Two new sessions read the expected sentinel through the allowed account, while an unknown account remained denied.",
    limitation:
      "This is one isolated OpenSSH server using synthetic keys and accounts. It does not claim production bastion access, directory integration, certificate-based SSH, or enterprise key rotation.",
    claims: [
      {
        id: "ssh-auth-01",
        publicWording:
          "Port 22 was reachable while a different valid key was still denied by public-key authentication.",
        evidenceRefs: ["ssh-reachable", "ssh-wrong-key"],
        limitation: "The result covers one isolated server and one unapproved lab key.",
        verification: "lab-demonstrated"
      },
      {
        id: "ssh-mode-01",
        publicWording:
          "The client ignored the authorized private key at mode 0644 and used it after the disposable copy was changed to mode 0600.",
        evidenceRefs: ["ssh-unsafe-mode", "ssh-mode-correction", "ssh-correction"],
        limitation: "The mode check uses the OpenSSH client inside one Alpine container.",
        verification: "lab-demonstrated"
      },
      {
        id: "ssh-boundary-01",
        publicWording:
          "The allowed account read the sentinel in two sessions, while an unknown account remained denied.",
        evidenceRefs: ["ssh-correction", "ssh-retest", "ssh-negative"],
        limitation: "The boundary proves command access to one synthetic account and file.",
        verification: "lab-demonstrated"
      }
    ],
    evidence: [
      {
        id: "ssh-reachable",
        title: "SSH service reachable",
        kind: "result",
        caption:
          "The client reaches the server on TCP 22 before any authentication result is interpreted.",
        claimIds: ["ssh-auth-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/service-reachable.txt",
        excerpt: "ssh-server:22 reachable"
      },
      {
        id: "ssh-wrong-key",
        title: "Different key denied",
        kind: "command",
        caption:
          "A valid but unauthorized key reaches session authentication and receives the expected public-key denial.",
        claimIds: ["ssh-auth-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/wrong-key.txt",
        excerpt: "labops@ssh-server: Permission denied (publickey)."
      },
      {
        id: "ssh-unsafe-mode",
        title: "Authorized key ignored locally",
        kind: "command",
        caption:
          "The OpenSSH client refuses to use the authorized key while its private file is readable by group or other users.",
        claimIds: ["ssh-mode-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/unsafe-key-mode.txt",
        excerpt:
          "WARNING: UNPROTECTED PRIVATE KEY FILE!\nPermissions 0644 for 'lab_key' are too open.\nThis private key will be ignored."
      },
      {
        id: "ssh-mode-correction",
        title: "Local key-mode correction",
        kind: "record",
        caption:
          "Only the disposable client copy changes, from mode 0644 to 0600.",
        claimIds: ["ssh-mode-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/key-mode-correction.txt",
        excerpt: "before=0644\nafter=0600"
      },
      {
        id: "ssh-correction",
        title: "Remote identity and file check",
        kind: "result",
        caption:
          "After the mode correction, the server returns the allowed account, ARM64 architecture, and controlled sentinel line.",
        claimIds: ["ssh-mode-01", "ssh-boundary-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/correction.txt",
        excerpt:
          "user=labops\narch=aarch64\nsentinel=controlled remote support access"
      },
      {
        id: "ssh-retest",
        title: "New-client retest",
        kind: "result",
        caption:
          "A separate disposable client repeats the account and sentinel-file check.",
        claimIds: ["ssh-boundary-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/separate-retest.txt",
        excerpt:
          "retest-user=labops\nretest-sentinel=controlled remote support access"
      },
      {
        id: "ssh-negative",
        title: "Unknown account stays denied",
        kind: "result",
        caption:
          "The corrected key does not open an account that is outside the server’s allowed-user rule.",
        claimIds: ["ssh-boundary-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/negative-boundary.txt",
        excerpt: "unknown@ssh-server: Permission denied (publickey)."
      },
      {
        id: "ssh-package",
        title: "Evidence checksums",
        kind: "record",
        caption:
          "The checksum list covers service reachability, both failures, the key-mode change, successful sessions, and the account boundary.",
        claimIds: ["ssh-auth-01", "ssh-mode-01", "ssh-boundary-01"],
        privacyClass: "public-sanitized",
        origin: "captured",
        proofValue: "execution",
        download: "/work-assets/evidence/ssh-access-permissions/SHA256SUMS.txt",
        excerpt:
          "Public package\n• service reachability\n• key and permission failures\n• correction and new-client retest\n• negative account boundary\n• SHA-256 checksums"
      }
    ],
    visualization: {
      title: "Find where the SSH request stops.",
      description:
        "The service remains reachable. The selected state shows whether the request stops at key authorization, local key handling, or the remote session.",
      depth: "layered",
      nodes: [
        { id: "service", label: "TCP 22", detail: "SSH service" },
        { id: "key-mode", label: "Private-key mode", detail: "Client-side check" },
        { id: "key-match", label: "Authorized key", detail: "Server-side check" },
        { id: "account", label: "Allowed account", detail: "sshd boundary" },
        { id: "command", label: "Remote command", detail: "Identity and file" }
      ],
      states: [
        {
          id: "wrong-key",
          label: "Different key",
          summary: "TCP 22 answers, but the server does not accept the supplied public key.",
          artifactIds: ["ssh-reachable", "ssh-wrong-key"],
          nodeStates: { service: "normal", "key-mode": "normal", "key-match": "failed", account: "failed", command: "failed" }
        },
        {
          id: "unsafe-mode",
          label: "Unsafe key mode",
          summary: "The client refuses to use the authorized private key because mode 0644 exposes it to other users.",
          artifactIds: ["ssh-unsafe-mode", "ssh-mode-correction"],
          nodeStates: { service: "normal", "key-mode": "failed", "key-match": "unknown", account: "unknown", command: "failed" }
        },
        {
          id: "retest",
          label: "Retest",
          summary: "At mode 0600, the allowed account completes the remote checks while an unknown account remains denied.",
          artifactIds: ["ssh-mode-correction", "ssh-correction", "ssh-retest", "ssh-negative"],
          nodeStates: { service: "normal", "key-mode": "changed", "key-match": "normal", account: "normal", command: "normal" }
        }
      ]
    }
  }
];

export const publicProjects = projects.filter((project) => project.releaseState === "published");
export const withheldProjects = projects.filter((project) => project.releaseState === "withheld");
export const selectedProjects = publicProjects.filter((project) => project.tier !== "archived");
export const flagshipProjects = publicProjects.filter((project) => project.tier === "flagship");
export const supportingProjects = publicProjects.filter((project) => project.tier === "supporting");
export const technicalNotes = publicProjects.filter((project) => project.tier === "technical-note");
