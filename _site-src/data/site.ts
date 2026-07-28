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
  focus: "Computers have been part of my life since I was a kid.",
  location: "Mississauga, Ontario, Canada",
  shortLocation: "Mississauga, Ontario",
  email: "i@garyvirk.com",
  linkedin: "https://www.linkedin.com/in/gary-virk/",
  introduction:
    "I studied IT Systems & Network Administration at St. Clair College in Windsor and continued my networking training through Cisco Networking Academy.",
  workIntroduction:
    "I later moved into hands-on support, working with endpoints, hardware, deployments, networks, and complex technical cases.",
  summary:
    "IT specialist in Mississauga with hands-on experience supporting Windows and Mac endpoints, deploying devices, diagnosing Dell hardware, and troubleshooting network and server-related issues. Trained in computer networking at St. Clair College and Cisco Networking Academy."
} as const;

export const experience = [
  {
    company: "Experis / Manpower",
    assignment: "Assigned to Cummins",
    role: "User Support Technician",
    location: "Mississauga, Ontario",
    period: "May 2023 to December 2025",
    summary:
      "Supported workplace technology on site, including Windows endpoints, imaging and rebuilds, account and device tasks, Dell client hardware, and ServiceNow ticket records.",
    highlights: [
      "Imaged, rebuilt, configured, and supported Windows endpoints used by employees on site.",
      "Completed approved account and device tasks, diagnosed Dell client hardware, and set up peripherals.",
      "Recorded troubleshooting steps in ServiceNow and handed off unresolved issues with the evidence already collected."
    ]
  },
  {
    company: "Bluum",
    assignment: "",
    role: "User Support Technician",
    location: "Markham, Ontario",
    period: "April 2023 to May 2023",
    summary:
      "Provided on-site hardware support, user assistance, peripheral setup, ticket documentation, and escalation handoffs.",
    highlights: [
      "Diagnosed client hardware, replaced approved components, configured peripherals, and assisted users on site.",
      "Kept ticket records current and escalated unresolved issues with concise troubleshooting notes."
    ]
  }
] as const;

export const education = [
  {
    school: "St. Clair College",
    location: "Windsor, Ontario",
    program: "IT Systems & Network Administration",
    detail:
      "Coursework included routing and switching, Windows administration, Linux, network services, virtualization, packet analysis, and support fundamentals."
  },
  {
    school: "Cisco Networking Academy",
    location: "Windsor, Ontario",
    program: "Systems, Networking, and LAN/WAN Management",
    detail: "Applied networking study covering addressing, routing, switching, and LAN/WAN operations."
  }
] as const;

export const capabilities = [
  {
    number: "01",
    title: "Endpoint and user support",
    description:
      "Windows imaging and rebuilds, hardware diagnosis, peripherals, account and device tasks, remote support, and escalation."
  },
  {
    number: "02",
    title: "Ticket and knowledge work",
    description:
      "ServiceNow records, incident notes, troubleshooting evidence, handoffs, and practical support documentation."
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
    detail: "Routing, switching, IP connectivity, network access, security, and automation foundations."
  },
  {
    name: "CompTIA A+",
    detail: "Endpoint hardware, operating systems, troubleshooting, security, and support operations."
  },
  {
    name: "CompTIA Network+",
    detail: "Network concepts, infrastructure, operations, security, and troubleshooting."
  },
  {
    name: "CompTIA CIOS",
    detail: "IT Operations Specialist stackable credential earned through A+ and Network+."
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
      "Gary worked as a User Support Technician through Experis / Manpower on a Cummins assignment from May 2023 to December 2025.",
    publicWording:
      "User Support Technician, Experis / Manpower, assigned to Cummins, May 2023 to December 2025.",
    evidenceSource: "Supplied professional profile and résumé export.",
    limitation: "The client assignment and employer of record are shown separately.",
    verification: "verified"
  },
  {
    id: "experience-bluum-01",
    exactClaim:
      "Gary worked as a User Support Technician at Bluum from April 2023 to May 2023.",
    publicWording: "User Support Technician, Bluum, April 2023 to May 2023.",
    evidenceSource: "Supplied professional profile and résumé export.",
    limitation: "No unsupported volume, SLA, or outcome metric is attached.",
    verification: "verified"
  },
  {
    id: "education-01",
    exactClaim: "Gary studied IT Systems & Network Administration at St. Clair College.",
    publicWording: "IT Systems & Network Administration, St. Clair College.",
    evidenceSource: "Supplied professional profile and résumé export.",
    limitation: "The website does not restate an unverified credential type.",
    verification: "verified"
  },
  {
    id: "credential-01",
    exactClaim: "Gary earned CCNA, CompTIA A+, Network+, and CIOS credentials.",
    publicWording: "CCNA, CompTIA A+, Network+, and CIOS.",
    evidenceSource: "Supplied professional profile and résumé export.",
    limitation: "The website does not claim a current expiry or renewal state.",
    verification: "verified"
  },
  {
    id: "profile-story-01",
    exactClaim: "Computers have been part of Gary's life since he was a kid.",
    publicWording: profile.focus,
    evidenceSource: "Portfolio owner wording supplied for this revision.",
    limitation: "The website does not attach an invented age, device, event, or employment history to this personal statement.",
    verification: "owner-attested"
  },
  {
    id: "profile-scope-01",
    exactClaim:
      "Gary has worked with Mac systems, endpoint setup and deployments, server-related issues, and L3 support cases.",
    publicWording:
      "Mac systems, endpoint setup and deployments, server-related issues, and L3 support cases.",
    evidenceSource: "Portfolio owner attestation supplied for this revision.",
    limitation:
      "The website does not infer a platform, formal job title, scale, employer, or business outcome beyond the owner's wording.",
    verification: "owner-attested"
  }
];
