import { supabase } from '@/integrations/supabase/client';
import { type Lead, generateId } from '@/lib/campaign-data';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

export const firecrawlApi = {
  async scrape(url: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options: { formats: ['markdown'] } },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async search(query: string, options?: { limit?: number; lang?: string; country?: string }): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options: { limit: options?.limit || 20, lang: options?.lang, country: options?.country } },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },
};

// Extract leads from scraped markdown content
export function extractLeadsFromMarkdown(markdown: string): Lead[] {
  const leads: Lead[] = [];
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.]+/g;
  const linkedinRegex = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+/g;

  const emails = [...new Set(markdown.match(emailRegex) || [])];
  const linkedins = markdown.match(linkedinRegex) || [];

  // Try to find name-email pairs by looking at lines with emails
  const lines = markdown.split('\n');

  for (const email of emails) {
    // Skip generic/noreply emails
    if (/noreply|no-reply|support@|admin@|hello@|help@/i.test(email)) continue;

    const lead: Lead = {
      id: generateId(),
      name: '',
      company: '',
      email,
      approved: false,
    };

    // Try to find the name near the email in the text
    for (const line of lines) {
      if (line.includes(email)) {
        // Try to extract a name from the same line
        const cleanLine = line.replace(email, '').replace(/[|*\[\]()#>-]/g, '').trim();
        const nameParts = cleanLine.split(/[,;:\t]+/);
        if (nameParts[0] && nameParts[0].trim().length > 1 && nameParts[0].trim().length < 50) {
          lead.name = nameParts[0].trim();
        }
        if (nameParts[1] && nameParts[1].trim().length > 1) {
          lead.company = nameParts[1].trim();
        }
        break;
      }
    }

    // Try to guess company from email domain
    if (!lead.company) {
      const domain = email.split('@')[1];
      if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'].includes(domain)) {
        lead.company = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
      }
    }

    // Assign linkedin if available
    if (linkedins.length > 0) {
      lead.linkedin = linkedins.shift();
    }

    leads.push(lead);
  }

  return leads;
}

// Extract leads from search results (multiple pages)
export function extractLeadsFromSearchResults(results: any[]): Lead[] {
  const allLeads: Lead[] = [];
  const seenEmails = new Set<string>();

  console.log(`[LeadExtraction] Processing ${results.length} search results`);

  for (const result of results) {
    // Combine markdown, description, title, and url for maximum extraction
    const parts = [
      result.markdown || '',
      result.description || '',
      result.title || '',
      result.url || '',
    ];
    const combined = parts.join('\n');
    console.log(`[LeadExtraction] Result "${result.title || result.url || '?'}" — ${combined.length} chars`);
    
    const pageLeads = extractLeadsFromMarkdown(combined);

    for (const lead of pageLeads) {
      if (!seenEmails.has(lead.email)) {
        seenEmails.add(lead.email);
        allLeads.push(lead);
      }
    }
  }

  console.log(`[LeadExtraction] Total unique leads found: ${allLeads.length}`);
  return allLeads;
}
