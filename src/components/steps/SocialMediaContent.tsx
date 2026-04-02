import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Linkedin, Instagram, Twitter, Copy, Check } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { useState } from "react";

type Props = {
  campaign: Campaign;
  onBack: () => void;
};

function ContentCard({
  icon: Icon,
  platform,
  title,
  content,
  color,
}: {
  icon: any;
  platform: string;
  title: string;
  content: string;
  color: string;
}) {
  const [text, setText] = useState(content);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{platform}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">Manual — you post yourself</Badge>
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="text-sm" />
      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
    </Card>
  );
}

export function SocialMediaContent({ campaign, onBack }: Props) {
  const biz = campaign.name || "your business";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Social Media Content</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ready-to-post content for your outreach. Edit and copy!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ContentCard
          icon={Linkedin}
          platform="LinkedIn"
          title="Connection Note"
          color="bg-primary/10 text-primary"
          content={`Hi [Name], I came across your profile and was impressed by your work in ${campaign.targetAudience || "the industry"}. I'm working on ${biz} and would love to connect and share ideas. Looking forward to connecting!`}
        />
        <ContentCard
          icon={Linkedin}
          platform="LinkedIn"
          title="Follow-up Message"
          color="bg-primary/10 text-primary"
          content={`Thanks for connecting! I wanted to share a quick resource that's been helping professionals in ${campaign.niche || "your space"}: [link]. Would love to hear your thoughts — always looking to learn from experienced folks like yourself.`}
        />
        <ContentCard
          icon={Instagram}
          platform="Instagram"
          title="Caption + Carousel Idea"
          color="bg-accent text-accent-foreground"
          content={`🚀 3 ways ${campaign.niche || "your industry"} pros are saving 10+ hours/week:\n\n1️⃣ Automating follow-ups\n2️⃣ Using AI for lead research\n3️⃣ Personalizing outreach at scale\n\nWhich one are you trying first? 👇\n\n#${(campaign.niche || "business").replace(/\s+/g, "")} #Outreach #GrowthHacking`}
        />
        <ContentCard
          icon={Twitter}
          platform="X (Twitter)"
          title="Thread Starter"
          color="bg-foreground/10 text-foreground"
          content={`I just ran my first cold outreach campaign for ${biz}.\n\nHere's what happened:\n\n🧵 Thread 👇\n\n1/ Started with ${campaign.leads.length} leads from a single directory\n2/ Personalized every email using AI\n3/ Results came in within 48 hours\n\nThe key? Authenticity > volume.`}
        />
      </div>

      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Button>
    </div>
  );
}
