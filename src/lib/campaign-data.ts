export const NICHES = [
  "Real Estate",
  "Grocery Retail",
  "Legal Services",
  "Health & Nutrition",
  "Construction",
  "Finance & Insurance",
  "E-commerce",
  "Software/SaaS",
  "Education",
  "Hospitality",
  "Other",
] as const;

export const TARGET_AUDIENCES: Record<string, string[]> = {
  "Real Estate": ["Agents", "Brokers", "Teams", "Transaction Coordinators", "Property Managers"],
  "Grocery Retail": ["Store Owners", "Buyers", "Category Managers", "Independent Stores", "Distributors"],
  "Legal Services": ["Workers Compensation Attorneys", "Personal Injury Lawyers", "Family Law", "Criminal Defense", "Immigration Lawyers"],
  "Health & Nutrition": ["Nutritionists", "Dietitians", "Health Coaches", "Supplement Brands", "Wellness Centers"],
  "Construction": ["General Contractors", "Subcontractors", "Architects", "Interior Designers", "Project Managers"],
  "Finance & Insurance": ["Financial Advisors", "Insurance Agents", "Mortgage Brokers", "Accountants", "Tax Preparers"],
  "E-commerce": ["Shopify Store Owners", "Amazon Sellers", "Dropshippers", "DTC Brands", "Marketplace Sellers"],
  "Software/SaaS": ["Founders", "Product Managers", "CTOs", "DevOps Engineers", "Marketing Leads"],
  "Education": ["Tutors", "Course Creators", "School Administrators", "EdTech Companies", "Training Providers"],
  "Hospitality": ["Hotel Managers", "Restaurant Owners", "Event Planners", "Travel Agents", "Caterers"],
  "Other": [],
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
  targetAudience: string[];
  leads: Lead[];
  emails: EmailTemplate[];
  batchSize: number;
  status: "setup" | "leads" | "emails" | "review" | "sending" | "active" | "completed";
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  createdAt: string;
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function createEmptyCampaign(): Campaign {
  return {
    id: generateId(),
    name: "",
    goal: "",
    websiteUrl: "",
    niche: "",
    targetAudience: [],
    leads: [],
    emails: [],
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
