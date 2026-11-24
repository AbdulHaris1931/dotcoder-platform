import { CampusDrive, DriveApplication } from "@/types";

export const SEED_DRIVES: CampusDrive[] = [
  {
    id: "33333333-0000-0000-0000-000000000001",
    company_name: "Zoho Corporation",
    role_title: "Software Development Engineer (SDE)",
    ctc_range: "₹6.5 - ₹8.5 LPA",
    location: "Chennai & Tenkasi, Tamil Nadu",
    min_readiness_score: 70,
    allowed_departments: ["CSE", "IT", "ECE"],
    max_backlogs: 0,
    drive_date: "2026-12-10",
    application_deadline: "2026-12-05T23:59:59Z",
    status: "Upcoming",
    description:
      "Core product development role across Zoho CRM, Cliq, and Creator. Day-1 on-campus evaluation includes basic programming (Round 1), complex coding without libraries (Round 2), and advanced design (Round 3).",
    applicant_count: 38,
  },
  {
    id: "33333333-0000-0000-0000-000000000002",
    company_name: "Tata Consultancy Services (TCS)",
    role_title: "Digital Specialist Engineer",
    ctc_range: "₹7.5 - ₹9.0 LPA",
    location: "Pan-India / Hybrid",
    min_readiness_score: 75,
    allowed_departments: ["CSE", "IT", "ECE", "EEE", "Mech"],
    max_backlogs: 0,
    drive_date: "2026-11-28",
    application_deadline: "2026-11-24T23:59:59Z",
    status: "Ongoing",
    description:
      "National benchmark drive for digital innovation roles in Cloud, AI/ML, and Cybersecurity. Evaluation is conducted via TCS NQT Sectional Simulator (Quant, Logic, and Coding).",
    applicant_count: 64,
  },
  {
    id: "33333333-0000-0000-0000-000000000003",
    company_name: "Cognizant Technology Solutions",
    role_title: "GenC Elevate Developer",
    ctc_range: "₹4.5 - ₹5.5 LPA",
    location: "Bangalore, Chennai & Coimbatore",
    min_readiness_score: 60,
    allowed_departments: ["CSE", "IT", "ECE", "EEE"],
    max_backlogs: 1,
    drive_date: "2026-12-18",
    application_deadline: "2026-12-12T23:59:59Z",
    status: "Upcoming",
    description:
      "Full-stack and cloud enterprise engineering opportunities. Selection includes Automata coding evaluation, AMCAT logical reasoning, and technical interview.",
    applicant_count: 52,
  },
  {
    id: "33333333-0000-0000-0000-000000000004",
    company_name: "Infosys Limited",
    role_title: "Specialist Programmer (SP)",
    ctc_range: "₹9.5 - ₹11.0 LPA",
    location: "Bangalore & Pune",
    min_readiness_score: 80,
    allowed_departments: ["CSE", "IT"],
    max_backlogs: 0,
    drive_date: "2027-01-15",
    application_deadline: "2027-01-08T23:59:59Z",
    status: "Upcoming",
    description:
      "Elite competitive programming and systems architecture role through HackWithInfy / campus SP tracks. Focuses on Dynamic Programming, Trees, and Graphs.",
    applicant_count: 22,
  },
];

// 100% clean slate by default — zero mock student drive applications
export const SEED_DRIVE_APPLICATIONS: DriveApplication[] = [];
