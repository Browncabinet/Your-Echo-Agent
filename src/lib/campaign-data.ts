export const NICHES = [
  "SaaS & Software",
  "AI & Emerging Technology",
  "Healthcare & MedTech",
  "Finance & FinTech",
  "Marketing & Advertising",
  "E-commerce & Retail",
  "Education & EdTech",
  "Real Estate",
  "Construction & Infrastructure",
  "Sustainability & Climate Tech",
  "Legal & Compliance",
  "Human Resources & Recruiting",
  "Manufacturing & Supply Chain",
  "Cybersecurity",
  "Web3 & Blockchain",
  "Coaching & Professional Development",
  "Consulting & Professional Services",
  "Nonprofit & Social Impact",
  "Hospitality & Events",
] as const;

export const TARGET_AUDIENCES: Record<string, string[]> = {
  "SaaS & Software": ["Founders", "Product Managers", "CTOs", "DevOps Engineers", "Marketing Leads"],
  "AI & Emerging Technology": ["AI Founders", "ML Engineers", "Research Leads", "Product Managers", "Investors"],
  "Healthcare & MedTech": ["Clinicians", "Hospital Admins", "MedTech Founders", "Wellness Centers", "Health Coaches"],
  "Finance & FinTech": ["Financial Advisors", "FinTech Founders", "Mortgage Brokers", "Accountants", "Insurance Agents"],
  "Marketing & Advertising": ["Agency Owners", "CMOs", "Brand Managers", "Performance Marketers", "Content Strategists"],
  "E-commerce & Retail": ["Shopify Store Owners", "Amazon Sellers", "DTC Brands", "Retail Buyers", "Marketplace Sellers"],
  "Education & EdTech": ["Course Creators", "School Administrators", "EdTech Founders", "Tutors", "Training Providers"],
  "Real Estate": ["Agents", "Brokers", "Teams", "Transaction Coordinators", "Property Managers"],
  "Construction & Infrastructure": ["General Contractors", "Subcontractors", "Architects", "Project Managers", "Civil Engineers"],
  "Sustainability & Climate Tech": ["Climate Founders", "Sustainability Officers", "Renewable Energy Devs", "ESG Analysts", "Impact Investors"],
  "Legal & Compliance": ["Personal Injury Lawyers", "Family Law", "Corporate Counsel", "Compliance Officers", "Immigration Lawyers"],
  "Human Resources & Recruiting": ["Recruiters", "HR Directors", "Talent Acquisition Leads", "People Ops", "Staffing Agency Owners"],
  "Manufacturing & Supply Chain": ["Plant Managers", "Operations Directors", "Supply Chain Leads", "Procurement Officers", "Logistics Managers"],
  "Cybersecurity": ["CISOs", "Security Engineers", "Pentesters", "SOC Analysts", "Compliance Leads"],
  "Web3 & Blockchain": ["Web3 Founders", "Smart Contract Devs", "DAO Leaders", "Crypto Investors", "Protocol Engineers"],
  "Coaching & Professional Development": ["Executive Coaches", "Life Coaches", "Career Coaches", "Trainers", "Course Creators"],
  "Consulting & Professional Services": ["Independent Consultants", "Boutique Firms", "Strategy Advisors", "Fractional Executives", "Accountants"],
  "Nonprofit & Social Impact": ["Executive Directors", "Development Officers", "Program Managers", "Grant Writers", "Board Members"],
  "Hospitality & Events": ["Hotel Managers", "Restaurant Owners", "Event Planners", "Caterers", "Travel Agents"],
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  linkedin?: string;
  approved: boolean;
};

export type EmailTemplate = {
  id: string;
  subject: string;
  subjectB?: string;
  body: string;
  delay?: number;
  type: "initial" | "followup";
};

export type Campaign = {
  id: string;
  name: string;
  goal: string;
  websiteUrl: string;
  niche: string;
  location: string;
  targetAudience: string[];
  sellingPoints: string[];
  leads: Lead[];
  emails: EmailTemplate[];
  batchSize: number;
  status: "setup" | "leads" | "emails" | "review" | "sending" | "active" | "paused" | "completed";
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  createdAt: string;
};

export function generateId(): string {
  return crypto.randomUUID();
}

export const BATCH_TIERS = [
  { value: 50, label: "Starter", range: "0–50", description: "Test your first batch of emails", tier: "Free" },
  { value: 200, label: "Small", range: "51–200", description: "Great for testing a campaign", tier: "Starter" },
  { value: 500, label: "Medium", range: "201–500", description: "Solid outreach volume", tier: "Growth" },
  { value: 2000, label: "Large", range: "501–2,000", description: "Scale your outreach", tier: "Pro" },
] as const;

export function createEmptyCampaign(): Campaign {
  return {
    id: generateId(),
    name: "",
    goal: "",
    websiteUrl: "",
    niche: "",
    location: "",
    targetAudience: [],
    sellingPoints: [],
    leads: [],
    emails: [],
    batchSize: 50,
    status: "setup",
    stats: { sent: 0, opened: 0, clicked: 0, replied: 0 },
    createdAt: new Date().toISOString(),
  };
}

export function generateSampleLeads(count: number): Lead[] {
  const firstNames = ["Sarah", "Michael", "Jennifer", "David", "Lisa", "James", "Emily", "Robert", "Jessica", "Daniel"];
  const lastNames = ["Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  const companies = ["Apex Group", "Summit Co", "Pinnacle LLC", "Elite Services", "Prime Solutions", "Vanguard Inc", "NextGen Corp", "Blue Harbor", "Redwood Partners", "Golden State Realty"];

  return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
    id: generateId(),
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    company: companies[i % companies.length],
    email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, "")}.com`,
    linkedin: `https://linkedin.com/in/${firstNames[i % firstNames.length].toLowerCase()}${lastNames[i % lastNames.length].toLowerCase()}`,
    approved: false,
  }));
}

export function generateEmailTemplates(campaignName: string, goal: string): EmailTemplate[] {
  return [
    {
      id: generateId(),
      subject: `Quick question about your business`,
      subjectB: `Thought of you — quick intro`,
      body: `Hi {{name}},\n\nI came across {{company}} and was impressed by what you're doing.\n\nI'm reaching out because ${goal.toLowerCase()}. I think there could be a great fit here.\n\nWould you be open to a quick 10-minute chat this week?\n\nBest,\n[Your Name]`,
      type: "initial",
    },
    {
      id: generateId(),
      subject: `Following up — {{company}}`,
      body: `Hi {{name}},\n\nJust wanted to bump this to the top of your inbox. I know things get busy!\n\nI'd love to show you how we can help {{company}} — it only takes 10 minutes.\n\nWould tomorrow or Thursday work for a quick call?\n\nBest,\n[Your Name]`,
      delay: 5,
      type: "followup",
    },
  ];
}
