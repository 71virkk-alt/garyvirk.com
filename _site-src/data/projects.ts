export type Project = {
  number: string;
  slug: string;
  title: string;
  discipline: string;
  summary: string;
  result: string;
  environment: string[];
  metrics: Array<{ value: string; label: string }>;
  situation: string;
  build: string[];
  proof: Array<{ label: string; detail: string }>;
  boundary: string;
  visual:
    | { kind: "image"; src: string; alt: string; caption: string }
    | { kind: "matrix"; rows: Array<{ check: string; failure: string; corrected: string }> };
};

export const projects: Project[] = [
  {
    number: "01",
    slug: "windows-endpoint-readiness",
    title: "Windows endpoint readiness",
    discipline: "IT support · PowerShell · Windows 11",
    summary:
      "A read-only support utility that separates DNS-only faults from broader network-path failures and leaves an escalation-ready evidence bundle.",
    result:
      "Two controlled Windows faults were reproduced, classified, corrected, retested, and rolled back in fresh disposable sessions.",
    environment: ["Windows 11 Pro ARM64", "PowerShell 7", "Pester", "UTM"],
    metrics: [
      { value: "47/47", label: "Pester tests" },
      { value: "02", label: "Native fault scenarios" },
      { value: "24", label: "Published artifacts" }
    ],
    situation:
      "A user can report “the network is down” when the adapter, route, DNS resolver, or one service is actually at fault. The project needed to narrow that ticket without changing the endpoint.",
    build: [
      "Collected adapter, address, route, DNS, ICMP, and TCP evidence through a bounded PowerShell module.",
      "Classified incomplete evidence as unknown instead of treating missing data as proof.",
      "Injected a DNS-only failure and a wrong-static-network failure outside the read-only collector.",
      "Repeated the same checks after correction and again after fresh-session rollback."
    ],
    proof: [
      {
        label: "DNS-only fault",
        detail: "IP and TCP remained available while name resolution failed; the collector returned Fail / DNSOnly."
      },
      {
        label: "Wrong static network",
        detail: "Address and route evidence changed together; the collector returned Fail / NetworkPath."
      },
      {
        label: "Release gate",
        detail: "The public payload was rebuilt byte-for-byte, checksum-bound, sanitized, and independently reviewed."
      }
    ],
    boundary:
      "This proves controlled Windows support diagnostics in a dedicated virtual lab. It does not claim production execution or an adapter-down recovery.",
    visual: {
      kind: "matrix",
      rows: [
        { check: "Adapter / IP", failure: "Pass", corrected: "Pass" },
        { check: "Direct TCP", failure: "Pass", corrected: "Pass" },
        { check: "DNS name", failure: "Fail", corrected: "Pass" },
        { check: "Assessment", failure: "DNSOnly", corrected: "Healthy" }
      ]
    }
  },
  {
    number: "02",
    slug: "network-access-control",
    title: "Network access-control change",
    discipline: "Networking · Cisco ACLs · Batfish",
    summary:
      "A four-zone policy change tested as baseline, controlled regression, correction, rollback, and clean repeat.",
    result:
      "One deliberate HTTPS deny changed exactly one modeled policy row; correction and byte-identical rollback restored the baseline.",
    environment: ["Cisco Packet Tracer 9", "PT8200", "802.1Q", "Batfish"],
    metrics: [
      { value: "15", label: "Policy rows per state" },
      { value: "05", label: "Evaluated states" },
      { value: "03", label: "Packet Tracer checks" }
    ],
    situation:
      "An ACL can solve one access request while quietly breaking another path. The project needed a pre-change policy model, a visible failure, and proof that both correction and rollback returned the network to its known-good state.",
    build: [
      "Defined required, prohibited, and unaffected flows across Users, Admin, Servers, and Guests.",
      "Evaluated all 15 policy rows through five hash-bound Batfish states.",
      "Built the matching four-VLAN router-on-a-stick lab in Packet Tracer.",
      "Inserted one deny rule, observed the timeout and counter change, removed it, then reopened the untouched baseline file for rollback."
    ],
    proof: [
      {
        label: "Controlled regression",
        detail: "Only ACL-REQ-001 changed from delivered to denied; the Packet Tracer request timed out and the new deny recorded 12 matches."
      },
      {
        label: "Correction",
        detail: "Removing sequence 5 restored the HTTPS page and the intended permit recorded six matches."
      },
      {
        label: "Rollback",
        detail: "The rollback file is byte-identical to baseline; HTTPS and admin reachability passed while guest-to-admin remained blocked."
      }
    ],
    boundary:
      "Batfish evaluates all 15 rows. Packet Tracer manually corroborates three representative rows on an adapted router-on-a-stick topology.",
    visual: {
      kind: "image",
      src: "/work-assets/access-control-topology.svg",
      alt: "Four-zone access-control topology connecting users, admin, servers, and guests through a router",
      caption: "Published topology · four VLANs · policy applied at the routed boundary"
    }
  },
  {
    number: "03",
    slug: "network-inventory-drift",
    title: "Network inventory drift",
    discipline: "Networking · Nmap · Evidence normalization",
    summary:
      "A fail-closed inventory analyzer that distinguishes new, missing, moved, and uncertain devices while retaining field-level provenance.",
    result:
      "The controlled failure produced four exact drift types; correction, rebuilt rollback, and clean repeat returned to zero findings.",
    environment: ["Python", "Nmap XML", "Docker", "Graphviz"],
    metrics: [
      { value: "06", label: "Native states" },
      { value: "04", label: "Drift types" },
      { value: "15/15", label: "Automated tests" }
    ],
    situation:
      "Inventory comparisons become misleading when a scan is partial or a device identity is uncertain. This project refuses to call a device missing until the exact target coverage is proven complete.",
    build: [
      "Normalized Nmap XML and interface evidence into stable device, address, interface, and link records.",
      "Retained source type, source ID, locator, and confidence on every observation.",
      "Created a controlled missing device, new device, changed IP, and uncertain observation.",
      "Rebuilt the topology from source for rollback and repeated the clean scan."
    ],
    proof: [
      {
        label: "Failure state",
        detail: "Exactly four findings appeared: changed_ip, missing_device, new_device, and uncertain_observation."
      },
      {
        label: "Absence discipline",
        detail: "A missing-device result is allowed only when the explicit target list, run statistics, and complete coverage agree."
      },
      {
        label: "Repeatability",
        detail: "Baseline, correction, rollback, and clean-repeat JSON outputs are byte-identical."
      }
    ],
    boundary:
      "The native runner scans only explicitly owned targets on an isolated documentation-address network. It is not continuous monitoring or broad enterprise discovery.",
    visual: {
      kind: "matrix",
      rows: [
        { check: "Baseline", failure: "0 findings", corrected: "0 findings" },
        { check: "Controlled drift", failure: "4 exact types", corrected: "0 findings" },
        { check: "Rebuilt rollback", failure: "4 exact types", corrected: "0 findings" },
        { check: "Clean repeat", failure: "0 findings", corrected: "Byte-identical" }
      ]
    }
  },
  {
    number: "04",
    slug: "dhcp-failure-isolation",
    title: "DHCP failure isolation",
    discipline: "IT support · DHCP · Packet evidence",
    summary:
      "A disconnected service lab that traces no-offer, incorrect-option, and competing-server failures through real DORA captures.",
    result:
      "Each fault was corrected with a clean DORA capture; rollback rebuilt the owned topology before a final clean repeat.",
    environment: ["Kea DHCP", "BusyBox udhcpc", "TShark", "Linux namespaces"],
    metrics: [
      { value: "10", label: "Captured states" },
      { value: "03", label: "Failure modes" },
      { value: "00", label: "Findings after rollback" }
    ],
    situation:
      "“Renew the address” does not explain whether the service was absent, the lease options were wrong, or another server answered first. This lab isolates those cases at the packet level.",
    build: [
      "Ran real Kea services and a BusyBox client inside owned namespaces with no default route.",
      "Captured complete DORA exchanges and preserved decisive frame references.",
      "Changed one controlled condition at a time: no server, wrong router/DNS, then a competing server.",
      "Tore down and rebuilt the topology from reviewed configuration for rollback."
    ],
    proof: [
      {
        label: "No offer",
        detail: "The capture remained open beyond the response window after the final Discover before absence was accepted."
      },
      {
        label: "Incorrect options",
        detail: "DORA completed, but the offered router and DNS values differed from the reviewed expectation."
      },
      {
        label: "Competing server",
        detail: "Two owned servers answered one transaction and the evidence retained which offer the client selected."
      }
    ],
    boundary:
      "This is an isolated Linux client and service lab. It does not claim Windows DHCP behavior, relay/VLAN testing, production administration, or automatic remediation.",
    visual: {
      kind: "matrix",
      rows: [
        { check: "Healthy baseline", failure: "Clean DORA", corrected: "Clean DORA" },
        { check: "Service unavailable", failure: "No offer", corrected: "Clean DORA" },
        { check: "Wrong options", failure: "Router / DNS mismatch", corrected: "Clean DORA" },
        { check: "Competing server", failure: "Two offers", corrected: "Clean DORA" }
      ]
    }
  },
  {
    number: "05",
    slug: "packet-triage-library",
    title: "Packet triage evidence library",
    discipline: "Networking · TShark · Troubleshooting",
    summary:
      "Five small packet cases that connect a user-visible symptom to a decisive filter, bounded change, and different post-change capture.",
    result:
      "DNS, TCP, ARP, path-MTU, and DHCP failures were reproduced and each post-change check passed.",
    environment: ["TShark", "Capinfos", "tcpdump", "Python"],
    metrics: [
      { value: "05", label: "Packet cases" },
      { value: "05", label: "Post-change checks" },
      { value: "02", label: "Captures per case" }
    ],
    situation:
      "A packet capture is only useful when the analyst can state where it was taken, which frames matter, what changed, and what a separate validation capture proves.",
    build: [
      "Created controlled DNS, TCP reset, duplicate-IP ARP, path-MTU, and DHCP-option failures.",
      "Replayed each capture through fixed TShark field selections instead of trusting authored outcome text.",
      "Derived decisive frames and findings from the supplied protocol fields.",
      "Bound every failure and post-change capture by SHA-256 and carried the lab limitations into each report."
    ],
    proof: [
      {
        label: "DNS / TCP",
        detail: "NXDOMAIN became a valid A answer; a reset to a closed port became a completed handshake and echoed payload."
      },
      {
        label: "ARP / path MTU",
        detail: "Two MAC owners became one; ICMP type 3/code 4 with MTU 1200 disappeared after the path was restored."
      },
      {
        label: "DHCP",
        detail: "The incorrect router option is imported from the separately validated DHCP project and checked against the same captured transaction."
      }
    ],
    boundary:
      "These are owned, documentation-address packet cases. They do not claim production remediation, enterprise monitoring, or a general diagnostic product.",
    visual: {
      kind: "matrix",
      rows: [
        { check: "DNS", failure: "NXDOMAIN", corrected: "A record returned" },
        { check: "TCP", failure: "RST", corrected: "Handshake + echo" },
        { check: "ARP", failure: "Two owners", corrected: "One owner" },
        { check: "Path MTU", failure: "ICMP 3 / 4", corrected: "Payload delivered" },
        { check: "DHCP", failure: "Wrong router", corrected: "Reviewed router" }
      ]
    }
  }
];

export const featuredProjects = projects.slice(0, 3);
