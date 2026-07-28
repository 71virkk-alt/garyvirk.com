export type ProjectTier = "flagship" | "supporting" | "archived";
export type EvidenceLevel = "E2" | "E3" | "E4";
export type PrivacyClass = "public-sanitized" | "private-supporting";
export type PresentationType = "timeline" | "change" | "packet" | "notes" | "archive";

export type ProjectStatus = {
  completion: "Complete within stated scope" | "Archived";
  execution: string;
  review: string;
  publication: "Selected evidence on this page" | "Private";
  evidenceLevel: EvidenceLevel;
};

export type EvidenceArtifact = {
  id: string;
  title: string;
  kind: "command" | "result" | "diagram" | "record";
  caption: string;
  claimIds: string[];
  privacyClass: PrivacyClass;
  excerpt?: string;
  src?: string;
  alt?: string;
};

export type ProjectClaim = {
  id: string;
  publicWording: string;
  evidenceRefs: string[];
  limitation: string;
  verification: "verified";
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

export type PortfolioProject = {
  number: string;
  slug: string;
  title: string;
  tier: ProjectTier;
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
  matrix?: ProjectMatrixRow[];
  notes?: ProjectNote[];
};

export const projects: PortfolioProject[] = [
  {
    number: "01",
    slug: "windows-endpoint-readiness",
    title: "Windows endpoint connectivity triage",
    tier: "flagship",
    presentation: "timeline",
    discipline: "IT support · PowerShell · Windows 11",
    summary:
      "A read-only support utility that separates DNS failure from a broader network-path problem and leaves a clean handoff record.",
    employerValue:
      "Shows how I narrow an unclear connectivity ticket before changing the endpoint.",
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
          "Direct TCP remained available during the DNS fault, and the collector classified the result as DNSOnly.",
        evidenceRefs: ["win-dns-fault", "win-dns-retest"],
        limitation: "The test covers one controlled DNS-server fault.",
        verification: "verified"
      },
      {
        id: "win-path-01",
        publicWording:
          "The wrong static network changed the endpoint address and default route, and the collector classified the result as NetworkPath.",
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
        excerpt:
          "Symptom       : Service unavailable by name\nChecks        : Adapter, IP, route, DNS, direct TCP\nFinding       : TCP available; DNS lookup failed\nCorrection    : Restored reviewed DNS server\nRetest        : Name and direct TCP checks passed\nScope         : Synthetic home-lab record"
      }
    ],
    matrix: [
      { check: "Adapter and IP", failure: "Available", corrected: "Available" },
      { check: "Direct service TCP", failure: "Available", corrected: "Available" },
      { check: "DNS name", failure: "No answer", corrected: "A record returned" },
      { check: "Assessment", failure: "DNSOnly", corrected: "Healthy" }
    ]
  },
  {
    number: "02",
    slug: "network-access-control",
    title: "Network access-control change validation",
    tier: "flagship",
    presentation: "change",
    discipline: "Networking · Cisco ACLs · Batfish",
    summary:
      "A four-zone policy change checked as baseline, controlled regression, correction, rollback, and clean repeat.",
    employerValue:
      "Shows how I define expected traffic before a change and check both the requested path and the paths that must stay closed.",
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
      "Batfish covers the complete policy model. Packet Tracer corroborates representative flows on an adapted router-on-a-stick topology. Automated consistency checks are complete, but external reviewer approval is not.",
    claims: [
      {
        id: "acl-change-01",
        publicWording:
          "The inserted HTTPS deny produced the declared regression, and removing it restored the required path.",
        evidenceRefs: ["acl-topology", "acl-failure", "acl-correction"],
        limitation: "The manual simulator check covers the declared HTTPS path.",
        verification: "verified"
      },
      {
        id: "acl-boundary-01",
        publicWording:
          "Guest-to-admin traffic remained blocked during the clean rollback check.",
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
        src: "/work-assets/access-control-topology.svg",
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
        excerpt:
          "ip access-list extended USERS_IN\nno 5\n\npermit tcp 10.20.10.0 0.0.0.255 host 10.20.30.80 eq 443\n6 match(es)\n\nHTTPS request : Pass"
      },
      {
        id: "acl-rollback",
        title: "Rollback boundary check",
        kind: "result",
        caption:
          "After a clean reopen, the required server path returned while guest-to-admin traffic remained denied.",
        claimIds: ["acl-boundary-01"],
        privacyClass: "public-sanitized",
        excerpt:
          "Users to server HTTPS : Pass\nAdmin to server ICMP  : Pass\nGuest to admin ICMP   : Denied\nGUESTS_IN deny matches: 4"
      }
    ],
    matrix: [
      { check: "Users to server HTTPS", failure: "Denied", corrected: "Allowed" },
      { check: "Admin to server", failure: "Unchanged", corrected: "Allowed" },
      { check: "Guest to admin", failure: "Unchanged", corrected: "Denied" },
      { check: "Rollback", failure: "Not applicable", corrected: "Baseline restored" }
    ]
  },
  {
    number: "03",
    slug: "dhcp-failure-isolation",
    title: "DHCP failure isolation",
    tier: "supporting",
    presentation: "packet",
    discipline: "IT support · DHCP · Packet evidence",
    summary:
      "A controlled packet lab that distinguishes no-offer, incorrect-option, and competing-server failures.",
    employerValue:
      "Shows how packet evidence can separate three tickets that all look like a failed address renewal.",
    ownership:
      "I prepared the isolated service and client states, captured each exchange, compared the decisive DHCP fields, and repeated the capture after correction.",
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
      "Restore the intended service state and capture a separate clean exchange."
    ],
    outcome:
      "The captures separated an absent response, a completed lease with incorrect options, and a transaction with two responding servers.",
    limitation:
      "This is an isolated Linux service and client lab. It does not claim Windows client behavior, relay testing, or production DHCP administration.",
    claims: [
      {
        id: "dhcp-01",
        publicWording:
          "The packet sequence distinguishes no-offer, incorrect-option, and competing-server failures.",
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
          "A clean Discover, Offer, Request, and Acknowledgment provides the comparison point for every fault.",
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
          "After restoring the intended service state, the client completed a clean exchange with the reviewed router and DNS values.",
        claimIds: ["dhcp-01"],
        privacyClass: "public-sanitized",
        excerpt:
          "Offer count : 1\nRouter      : expected lab gateway\nDNS server  : expected lab resolver\nResult      : clean exchange"
      }
    ]
  },
  {
    number: "04",
    slug: "packet-triage-library",
    title: "Packet triage notes",
    tier: "supporting",
    presentation: "notes",
    discipline: "Networking · TShark · Troubleshooting",
    summary:
      "Four short packet cases that connect a user symptom to one decisive filter and a separate post-change check.",
    employerValue:
      "Shows how I turn a capture into a bounded support conclusion instead of treating the packet file as the answer.",
    ownership:
      "I created the controlled cases, selected the decisive protocol fields, compared failure and post-change captures, and wrote the support interpretation.",
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
      "Record the bounded change outside the capture.",
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
          "Each note ties a user symptom to decisive packet fields and a separate post-change capture.",
        evidenceRefs: ["packet-notes"],
        limitation: "The cases use owned fixtures and documentation addresses.",
        verification: "verified"
      }
    ],
    evidence: [
      {
        id: "packet-notes",
        title: "Four bounded packet cases",
        kind: "record",
        caption:
          "Each note keeps the symptom, decisive evidence, post-change result, and limitation together.",
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
    number: "A1",
    slug: "network-inventory-drift",
    title: "Network inventory drift",
    tier: "archived",
    presentation: "archive",
    discipline: "Archived lab",
    summary:
      "This earlier lab remains available at its original URL but is no longer part of the selected portfolio.",
    employerValue: "",
    ownership: "",
    environment: [],
    status: {
      completion: "Archived",
      execution: "Synthetic fixtures and controlled tooling",
      review: "Private",
      publication: "Private",
      evidenceLevel: "E2"
    },
    question: "",
    approach: [],
    outcome: "",
    limitation:
      "The project is retained only to keep an existing public route stable.",
    claims: [],
    evidence: []
  }
];

export const selectedProjects = projects.filter((project) => project.tier !== "archived");
export const flagshipProjects = projects.filter((project) => project.tier === "flagship");
export const supportingProjects = projects.filter((project) => project.tier === "supporting");
