export type VerificationState =
  | "verified"
  | "owner-attested"
  | "lab-demonstrated"
  | "source-cited"
  | "withheld";

export type ClaimRecord = {
  id: string;
  exactClaim: string;
  publicWording: string;
  evidenceSource: string;
  limitation: string;
  verification: VerificationState;
};

export const profile = {
  name: "Gary Virk",
  role: "IT Specialist",
  focus: "Endpoint support and network troubleshooting.",
  location: "Mississauga, Ontario, Canada",
  shortLocation: "Mississauga, Ontario",
  email: "i@garyvirk.com",
  linkedin: "https://www.linkedin.com/in/gary-virk/",
  introduction:
    "I’m an IT specialist based in Mississauga, Ontario. My work has covered Windows endpoints, Dell hardware, software support, imaging and deployment, and endpoint connectivity. The case studies below show how I narrow down faults, document the work, and retest the fix.",
  summary:
    "IT specialist in Mississauga with hands-on experience in Windows endpoint support, device imaging and deployment, Dell hardware diagnosis, software support, and endpoint connectivity. Ontario College Diploma in Computer Systems Technician - Networking from St. Clair College."
} as const;

export const experience = [
  {
    company: "Experis / Manpower Services Canada Ltd.",
    assignment: "Dell Canada assignment at Cummins",
    role: "Field Service / End-User Support Technician",
    location: "Mississauga, Ontario",
    period: "May 2023 to December 2025",
    summary:
      "Provided on-site end-user support for Windows endpoints, Dell hardware, software, device-level connectivity, imaging, deployment, and ServiceNow ticket records.",
    highlights: [
      "Diagnosed Windows, Microsoft Office, software, wired and wireless connectivity, and Dell hardware issues.",
      "Imaged, configured, deployed, repaired, and replaced laptops, desktops, workstations, and peripherals.",
      "Managed support tickets in ServiceNow and documented diagnostic steps, actions, resolutions, and escalations."
    ]
  }
] as const;

export const education = [
  {
    school: "St. Clair College",
    location: "Windsor, Ontario",
    program: "Computer Systems Technician - Networking",
    detail:
      "Ontario College Diploma. Coursework included networking, system configuration, programming, databases, web technologies, and technical communication."
  }
] as const;

export const capabilities = [
  {
    number: "01",
    title: "Endpoint and user support",
    description:
      "Windows imaging and deployment, Dell hardware diagnosis, software support, peripherals, device-level connectivity, and escalation."
  },
  {
    number: "02",
    title: "Ticketing and documentation",
    description:
      "ServiceNow tickets, incident notes, diagnostic steps, handoffs, and support documentation."
  },
  {
    number: "03",
    title: "Networks and connectivity",
    description:
      "TCP/IP, DHCP, DNS, VLAN concepts, routing and switching, Wi-Fi, access-control fundamentals, and packet analysis."
  },
  {
    number: "04",
    title: "Support scripting",
    description:
      "PowerShell and Python tools for focused data collection, repeatable checks, and clear support output."
  }
] as const;

export const credentials = [
  {
    name: "Cisco CCNA",
    detail: "Routing, switching, IP connectivity, network access, security, and automation foundations.",
    verification: "owner-attested"
  },
  {
    name: "CompTIA A+",
    detail: "Endpoint hardware, operating systems, troubleshooting, security, and support operations.",
    verification: "owner-attested"
  },
  {
    name: "CompTIA Network+",
    detail: "Network concepts, infrastructure, operations, security, and troubleshooting.",
    verification: "owner-attested"
  },
  {
    name: "CompTIA CIOS",
    detail: "IT Operations Specialist stackable credential earned through A+ and Network+.",
    verification: "owner-attested"
  }
] as const;

export const claimRegister: ClaimRecord[] = [
  {
    id: "profile-role-01",
    exactClaim: "Gary is targeting IT support and networking roles.",
    publicWording: profile.role,
    evidenceSource: "Current portfolio positioning and supplied professional profile.",
    limitation: "This headline does not replace the official title used in each employment record.",
    verification: "verified"
  },
  {
    id: "experience-cummins-01",
    exactClaim:
      "Gary worked for Manpower Services Canada Ltd., operating as Experis, as a Field Service / End-User Support Technician from May 15, 2023 to December 17, 2025, assigned to Dell Canada and working on site at Cummins.",
    publicWording:
      "Field Service / End-User Support Technician, Experis / Manpower Services Canada Ltd., Dell Canada assignment at Cummins, May 2023 to December 2025.",
    evidenceSource: "Employment reference letter issued April 15, 2026.",
    limitation: "The public month range omits exact days; employer, assignment, and client site are shown separately.",
    verification: "verified"
  },
  {
    id: "education-01",
    exactClaim:
      "Gary earned an Ontario College Diploma in Computer Systems Technician - Networking from St. Clair College.",
    publicWording:
      "Ontario College Diploma, Computer Systems Technician - Networking, St. Clair College.",
    evidenceSource: "St. Clair College diploma and official transcript.",
    limitation: "The public website omits student identifiers and transcript details.",
    verification: "verified"
  },
  {
    id: "credential-01",
    exactClaim: "Gary earned CCNA, CompTIA A+, Network+, and CIOS credentials.",
    publicWording: "CCNA, CompTIA A+, Network+, and CIOS.",
    evidenceSource: "Supplied professional profile and résumé export.",
    limitation: "The website does not claim a current expiry or renewal state.",
    verification: "owner-attested"
  },
  {
    id: "profile-scope-01",
    exactClaim:
      "Gary has supported Windows endpoints, Dell hardware, software, device-level network connectivity, imaging, deployments, and ServiceNow ticket records.",
    publicWording:
      "Windows endpoints, Dell hardware, software, device-level connectivity, imaging, deployments, and ServiceNow ticket records.",
    evidenceSource: "Employment reference letter issued April 15, 2026.",
    limitation:
      "The website does not add unsupported scale, SLA, volume, L3 ownership, server administration, or business-outcome claims.",
    verification: "verified"
  }
];
