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
  | "archive";
export type ArtifactRole =
  | "execution-proof"
  | "deterministic-illustration";

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
    | "Cited sources and deterministic aids"
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
      "A read-only support utility that separates DNS failure from a broader network-path problem and leaves a clean handoff record.",
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
    kind: "executed-lab",
    releaseState: "published",
    presentation: "change",
    discipline: "Networking · Cisco ACLs · Batfish",
    summary:
      "A four-zone policy change checked as baseline, controlled regression, correction, rollback, and clean repeat.",
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
    kind: "executed-lab",
    releaseState: "published",
    presentation: "packet",
    discipline: "IT support · DHCP · Packet evidence",
    summary:
      "A controlled packet lab that distinguishes no-offer, incorrect-option, and competing-server failures.",
    employerValue:
      "The packet sequence separates no response, incorrect lease options, and two responding servers.",
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
    kind: "executed-lab",
    releaseState: "published",
    presentation: "notes",
    discipline: "Networking · TShark · Troubleshooting",
    summary:
      "Four short packet cases that connect a user symptom to one decisive filter and a separate post-change check.",
    employerValue:
      "Each note identifies the decisive frames and keeps the post-change capture separate.",
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
    title: "macOS enrollment and FileVault support",
    tier: "technical-note",
    kind: "technical-note",
    releaseState: "published",
    presentation: "macos",
    discipline: "Technical note · macOS · Intune · FileVault",
    summary:
      "A source-cited support path for separating an incomplete Intune enrollment from a FileVault or recovery-key problem.",
    employerValue:
      "The useful decision is where the enrollment or encryption path stopped and which action needs device-owner or administrator approval.",
    ownership:
      "I wrote this note from Microsoft and Apple deployment guidance. The workflow and support record are reconstructed aids. I did not run this scenario against a managed tenant.",
    environment: ["macOS", "Microsoft Intune guidance", "Apple deployment guidance"],
    status: {
      completion: "Research note",
      execution: "Not an executed lab",
      review: "Primary-source technical review",
      publication: "Cited sources and deterministic aids",
      evidenceLevel: "source-cited"
    },
    question:
      "A Mac is not receiving policy, or the user cannot unlock the disk. Where did the process stop?",
    processHeading: "Separate enrollment state from encryption state before changing either.",
    evidenceHeading: "Reconstructed aids, tied to the source guidance.",
    evidenceDescription:
      "The records below explain the support path. They are deterministic reconstructions, not screenshots or output from a managed Mac.",
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
          "Device ownership, enrollment method, MDM registration, encryption state, and recovery-key handling are separate support checkpoints.",
        evidenceRefs: ["mac-flow", "mac-checks", "mac-boundary"],
        sourceRefs: ["mac-intune-enrollment", "mac-filevault-management"],
        limitation: "The workflow is reconstructed from cited vendor guidance.",
        verification: "source-cited"
      }
    ],
    evidence: [
      {
        id: "mac-flow",
        title: "Enrollment sequence",
        kind: "record",
        caption:
          "A deterministic sequence showing where ownership, enrollment, management registration, compliance, and encryption checks separate.",
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
          "[reconstructed support map]\nOwnership → enrollment method → MDM registration\n          → policy check → FileVault state → key escrow"
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
    title: "Laptop boot and storage triage",
    tier: "technical-note",
    kind: "technical-note",
    releaseState: "published",
    presentation: "hardware",
    discipline: "Technical note · Hardware · Windows recovery",
    summary:
      "A source-cited preboot-to-Windows checklist for separating hardware failure, storage access, BitLocker recovery, and operating-system startup problems.",
    employerValue:
      "The useful decision is whether to preserve evidence, obtain an approved recovery key, begin Windows recovery, or hand the device to hardware service.",
    ownership:
      "I wrote this note from Dell diagnostics and Microsoft recovery documentation. The fault tree and ticket are reconstructed aids. I did not run the published scenario on a faulting laptop.",
    environment: ["Dell diagnostics guidance", "Windows 11", "BitLocker", "Windows Recovery Environment"],
    status: {
      completion: "Research note",
      execution: "Not an executed lab",
      review: "Primary-source technical review",
      publication: "Cited sources and deterministic aids",
      evidenceLevel: "source-cited"
    },
    question:
      "The laptop will not start normally. Does firmware see the drive, do preboot diagnostics report a hardware fault, is BitLocker blocking access, or is Windows failing later?",
    processHeading: "Record where startup stops before choosing a repair path.",
    evidenceHeading: "A fault tree and ticket model, not a claimed repair.",
    evidenceDescription:
      "These deterministic aids organize vendor guidance into a support handoff. No service tag, diagnostic result, replacement, or completed repair is claimed.",
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
        limitation: "The support path is reconstructed from cited vendor guidance.",
        verification: "source-cited"
      }
    ],
    evidence: [
      {
        id: "hardware-tree",
        title: "POST-to-Windows fault tree",
        kind: "record",
        caption:
          "A deterministic map separating power and POST, storage detection, preboot diagnostics, encryption, and Windows startup.",
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
          "[reconstructed fault tree]\nPower → POST → drive detected → diagnostics\n                         ↓ pass\n                 BitLocker state → Windows RE"
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
    title: "Enterprise Wi-Fi connection triage",
    tier: "technical-note",
    kind: "technical-note",
    releaseState: "published",
    presentation: "wifi",
    discipline: "Technical note · Wi-Fi · 802.1X · Windows",
    summary:
      "A source-cited client-side checklist for locating a wireless failure at association, authentication, IP configuration, gateway testing, or DNS.",
    employerValue:
      "The useful output is a handoff that identifies which layer failed and preserves the relevant client evidence.",
    ownership:
      "I wrote this note from Microsoft Windows wireless documentation. The worksheet and support record are reconstructed aids. I did not administer an access point, controller, RADIUS server, or live corporate network.",
    environment: ["Windows 11", "WLAN AutoConfig", "802.1X concepts", "TCP/IP"],
    status: {
      completion: "Research note",
      execution: "Not an executed lab",
      review: "Primary-source technical review",
      publication: "Cited sources and deterministic aids",
      evidenceLevel: "source-cited"
    },
    question:
      "The network is visible, but the user cannot reach internal services. Did Windows associate, authenticate, receive usable IP settings, or fail later in the path?",
    processHeading: "Move from radio state to service reachability without skipping a layer.",
    evidenceHeading: "A client-side worksheet and handoff model.",
    evidenceDescription:
      "The records below are deterministic reconstructions based on cited Windows commands and troubleshooting guidance. They are not captures from a corporate wireless network.",
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
          "Association, authentication, IP configuration, gateway testing, and DNS are separate checkpoints in a Windows Wi-Fi ticket.",
        evidenceRefs: ["wifi-layers", "wifi-worksheet", "wifi-handoff"],
        sourceRefs: [
          "wifi-netsh",
          "wifi-8021x",
          "wifi-ipconfig",
          "wifi-ping",
          "wifi-nslookup",
          "wifi-test-netconnection"
        ],
        limitation: "The workflow is reconstructed from cited Microsoft guidance.",
        verification: "source-cited"
      }
    ],
    evidence: [
      {
        id: "wifi-layers",
        title: "Connection ladder",
        kind: "record",
        caption:
          "A deterministic map that stops at the first unsupported layer instead of treating every symptom as a signal problem.",
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
          "[reconstructed connection ladder]\nAdapter → association → 802.1X authentication\n        → DHCP address → gateway → DNS → service"
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
      { check: "DHCP and gateway", failure: "Address, route, and ICMP response if permitted", corrected: "No ICMP reply alone is non-decisive" },
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
    number: "A1",
    slug: "network-inventory-drift",
    title: "Network inventory drift",
    tier: "archived",
    kind: "archive",
    releaseState: "published",
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

export const publicProjects = projects.filter((project) => project.releaseState === "published");
export const withheldProjects = projects.filter((project) => project.releaseState === "withheld");
export const selectedProjects = publicProjects.filter((project) => project.tier !== "archived");
export const flagshipProjects = publicProjects.filter((project) => project.tier === "flagship");
export const supportingProjects = publicProjects.filter((project) => project.tier === "supporting");
export const technicalNotes = publicProjects.filter((project) => project.tier === "technical-note");
