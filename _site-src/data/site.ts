export const profile = {
  name: "Gary Virk",
  role: "IT Support & Network Infrastructure Specialist",
  location: "Mississauga, Ontario, Canada",
  email: "i@garyvirk.com",
  linkedin: "https://www.linkedin.com/in/gary-virk/",
  statement: "IT support that gets to the why.",
  introduction:
    "I troubleshoot endpoints, networks, identity, and connectivity—then document the fix so the next incident is faster to resolve.",
  summary:
    "IT specialist with nearly three years of hands-on experience across enterprise endpoint deployment, escalated support, network troubleshooting, and technical documentation."
} as const;

export const experience = [
  {
    company: "Cummins Inc.",
    role: "IT Specialist",
    location: "Mississauga, Ontario",
    period: "May 2023 — December 2025",
    duration: "2 years 8 months",
    summary:
      "Enterprise endpoint deployment, escalated technical support, infrastructure troubleshooting, and documentation.",
    highlights: [
      "Deployed and configured Dell client and server hardware for enterprise rollouts, including imaging, hardware configuration, deployment, and post-deployment support.",
      "Handled escalations involving endpoints, network connectivity, and identity.",
      "Supported VLAN and switch changes, DHCP and DNS troubleshooting, and connectivity triage.",
      "Created runbooks and incident notes that made repeat issues easier to resolve and escalate."
    ]
  },
  {
    company: "Bluum",
    role: "User Support Technician",
    location: "Markham, Ontario",
    period: "April 2023 — May 2023",
    duration: "2 months · on-site",
    summary:
      "Hands-on hardware support, user assistance, ticket documentation, and evidence-ready escalation.",
    highlights: [
      "Diagnosed hardware issues, replaced components, configured peripherals, and supported users on site.",
      "Maintained clear ticket records and escalated unresolved issues with the troubleshooting evidence already collected."
    ]
  }
] as const;

export const capabilities = [
  {
    number: "01",
    title: "Endpoint & user support",
    description:
      "Windows endpoints, imaging and deployment, hardware diagnosis, peripheral setup, ticket handling, remote support, and escalation."
  },
  {
    number: "02",
    title: "Windows Server & identity",
    description:
      "Active Directory, Group Policy, DNS, DHCP, authentication issues, Event Viewer, and Windows Server lab administration."
  },
  {
    number: "03",
    title: "Networks & connectivity",
    description:
      "TCP/IP, VLANs, routing and switching, subnetting, Wi-Fi, access-control fundamentals, Wireshark, and SNMP."
  },
  {
    number: "04",
    title: "Documentation & automation",
    description:
      "Incident notes, runbooks, knowledge-base writing, PowerShell and shell scripting fundamentals, inventory reporting, and clean handoffs."
  }
] as const;

export const credentials = [
  {
    name: "Cisco CCNA",
    detail: "Routing, switching, IP connectivity, network access, security, and automation foundations."
  },
  {
    name: "CompTIA A+",
    detail: "Endpoint hardware, operating systems, troubleshooting, security, and operational procedures."
  },
  {
    name: "CompTIA Network+",
    detail: "Network concepts, infrastructure, operations, security, and troubleshooting."
  },
  {
    name: "CompTIA CIOS",
    detail: "IT Operations Specialist stackable credential combining A+ and Network+."
  }
] as const;

export const method = [
  ["Understand", "Turn the user’s symptom into a precise, testable problem."],
  ["Isolate", "Identify the layer most likely to explain the failure."],
  ["Test", "Run the smallest useful checks and record what they prove."],
  ["Verify", "Confirm the fix from the user and system perspective."],
  ["Document", "Leave a concise resolution and a clean escalation path."]
] as const;

export const activeLab = {
  eyebrow: "In progress · Lab environment",
  title: "Windows Server identity troubleshooting",
  description:
    "A Windows Server 2022 environment with AD DS, DNS, DHCP, Group Policy, and Windows 11 clients. The first case will document an account-lockout incident from the initial symptom through evidence collection, resolution, and validation.",
  evidence: [
    "Sanitized topology",
    "Server-role checklist",
    "Event Viewer checks",
    "PowerShell commands",
    "Escalation handoff"
  ]
} as const;
