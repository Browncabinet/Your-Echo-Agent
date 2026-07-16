import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: DM } = loadDMSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const { fontFamily: MONO } = loadJetBrains("normal", { weights: ["400", "500"], subsets: ["latin"] });

// Brand palette (glass blue/green)
const BG_1 = "#050b18";
const BG_2 = "#081428";
const BLUE = "#3B82F6";
const CYAN = "#22D3EE";
const GREEN = "#10B981";
const INK = "#E6F0FF";
const MUTED = "#8AA3C7";

// ---------- Background ----------
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const drift = Math.sin(t * Math.PI * 2) * 30;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 800px at ${50 + drift}% ${40 - drift * 0.5}%, ${BG_2} 0%, ${BG_1} 60%, #020610 100%)` }}>
      {/* Grid */}
      <AbsoluteFill style={{ opacity: 0.18, backgroundImage: `linear-gradient(${BLUE}22 1px, transparent 1px), linear-gradient(90deg, ${BLUE}22 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
      {/* Glow orbs */}
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", left: `${10 + drift * 0.4}%`, top: `${-10 + Math.cos(t * Math.PI * 2) * 5}%`, background: `radial-gradient(circle, ${BLUE}55 0%, transparent 65%)`, filter: "blur(20px)" }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", right: `${5 - drift * 0.3}%`, bottom: `${-8 + Math.sin(t * Math.PI * 2) * 5}%`, background: `radial-gradient(circle, ${GREEN}44 0%, transparent 65%)`, filter: "blur(20px)" }} />
    </AbsoluteFill>
  );
};

// ---------- Reusable card ----------
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    border: `1px solid ${BLUE}33`,
    borderRadius: 20,
    padding: 28,
    color: INK,
    fontFamily: DM,
    boxShadow: `0 20px 60px ${BLUE}22, inset 0 1px 0 rgba(255,255,255,0.08)`,
    backdropFilter: "blur(0px)",
    ...style,
  }}>{children}</div>
);

// ---------- Scene 1: Radar / discover ----------
const SceneDiscover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });
  const sweep = interpolate(frame, [0, 90], [0, 360]);

  const dots = [
    { x: 62, y: 30, d: 20, label: "Podcast · SaaS Founders" },
    { x: 78, y: 55, d: 40, label: "Newsletter · GrowthOps" },
    { x: 55, y: 72, d: 60, label: "Community · Indie Hackers" },
    { x: 85, y: 40, d: 30, label: "Event · DevTools Summit" },
  ];

  return (
    <AbsoluteFill style={{ padding: 120 }}>
      {/* Left copy */}
      <div style={{ position: "absolute", left: 120, top: 260, maxWidth: 620, opacity: s }}>
        <div style={{ fontFamily: MONO, color: CYAN, fontSize: 22, letterSpacing: 3, marginBottom: 18 }}>01 · DISCOVER</div>
        <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 92, color: INK, lineHeight: 1.02, letterSpacing: -2 }}>
          Rooms where your buyers already live.
        </div>
        <div style={{ fontFamily: DM, color: MUTED, fontSize: 26, marginTop: 22, lineHeight: 1.4 }}>
          Echo scans podcasts, newsletters, communities, and events — ranked by fit.
        </div>
      </div>

      {/* Right radar */}
      <div style={{ position: "absolute", right: 140, top: 180, width: 640, height: 640 }}>
        {[1, 2, 3, 4].map((r) => (
          <div key={r} style={{ position: "absolute", inset: `${(4 - r) * 60}px`, borderRadius: "50%", border: `1px solid ${BLUE}44` }} />
        ))}
        {/* sweep */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: "50%", height: "50%", transformOrigin: "0 0", transform: `rotate(${sweep}deg)`, background: `conic-gradient(from 0deg, ${CYAN}55, transparent 30%)` }} />
        </div>
        {/* Center pulse */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: "50%", background: CYAN, boxShadow: `0 0 40px ${CYAN}` }} />
        {/* Dots */}
        {dots.map((d, i) => {
          const local = frame - d.d;
          const appear = spring({ frame: local, fps, config: { damping: 12 } });
          return (
            <div key={i} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, transform: `translate(-50%, -50%) scale(${appear})`, opacity: appear }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: GREEN, boxShadow: `0 0 20px ${GREEN}` }} />
              <div style={{ position: "absolute", left: 22, top: -6, whiteSpace: "nowrap", fontFamily: MONO, fontSize: 14, color: INK, background: `${BG_1}cc`, border: `1px solid ${BLUE}55`, padding: "4px 10px", borderRadius: 6 }}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: Draft typing ----------
const SceneDraft: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });
  const fullText = "Hi Maya — loved your episode on B2B distribution. We built Echo to help founders like you get invited to the rooms where buyers hang out. Would love to send you a 90-second demo.";
  const chars = Math.floor(interpolate(frame, [20, 130], [0, fullText.length], { extrapolateRight: "clamp" }));
  const typed = fullText.slice(0, chars);
  const cursor = frame % 20 < 10 ? "|" : " ";

  return (
    <AbsoluteFill style={{ padding: 120 }}>
      <div style={{ position: "absolute", right: 140, top: 260, maxWidth: 620, opacity: s, textAlign: "right" }}>
        <div style={{ fontFamily: MONO, color: GREEN, fontSize: 22, letterSpacing: 3, marginBottom: 18 }}>02 · DRAFT</div>
        <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 92, color: INK, lineHeight: 1.02, letterSpacing: -2 }}>
          Warm outreach, written for you.
        </div>
        <div style={{ fontFamily: DM, color: MUTED, fontSize: 26, marginTop: 22, lineHeight: 1.4 }}>
          Per-contact drafts that reference their work — never a template.
        </div>
      </div>

      <div style={{ position: "absolute", left: 120, top: 200, width: 780, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, opacity: s }}>
        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${BLUE}, ${CYAN})` }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 20 }}>Maya Chen</div>
              <div style={{ color: MUTED, fontSize: 15, fontFamily: MONO }}>maya@ledgerloop.com</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 999, border: `1px solid ${GREEN}66`, color: GREEN, fontSize: 14, fontFamily: MONO }}>fit 94</div>
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.55, color: INK, minHeight: 260 }}>
            {typed}<span style={{ color: CYAN }}>{cursor}</span>
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 3: Reply intelligence ----------
const SceneReply: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });

  const replies = [
    { name: "Devon A.", tag: "Interested", tone: GREEN, snippet: "Yes — send the deck.", d: 10 },
    { name: "Priya R.", tag: "Meeting", tone: CYAN, snippet: "Thursday 2pm works.", d: 30 },
    { name: "Jonas W.", tag: "Follow up", tone: BLUE, snippet: "Circle back in Q4.", d: 50 },
    { name: "Ana B.", tag: "Interested", tone: GREEN, snippet: "Love this — intro'ing to Sam.", d: 70 },
  ];

  return (
    <AbsoluteFill style={{ padding: 120 }}>
      <div style={{ position: "absolute", left: 120, top: 220, maxWidth: 620, opacity: s }}>
        <div style={{ fontFamily: MONO, color: BLUE, fontSize: 22, letterSpacing: 3, marginBottom: 18 }}>03 · REPLIES</div>
        <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 92, color: INK, lineHeight: 1.02, letterSpacing: -2 }}>
          Every reply, pre-classified.
        </div>
        <div style={{ fontFamily: DM, color: MUTED, fontSize: 26, marginTop: 22, lineHeight: 1.4 }}>
          Interest, meetings, objections — with drafts ready to send.
        </div>
      </div>

      <div style={{ position: "absolute", right: 140, top: 180, width: 640, display: "flex", flexDirection: "column", gap: 18 }}>
        {replies.map((r, i) => {
          const local = frame - r.d;
          const ap = spring({ frame: local, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ transform: `translateX(${interpolate(ap, [0, 1], [60, 0])}px)`, opacity: ap }}>
              <Card style={{ padding: 22 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${r.tone}, ${BLUE})` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 600, fontSize: 20 }}>{r.name}</div>
                      <div style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${r.tone}66`, color: r.tone, fontSize: 12, fontFamily: MONO }}>{r.tag}</div>
                    </div>
                    <div style={{ color: MUTED, fontSize: 17, marginTop: 4 }}>{r.snippet}</div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 4: Closing wordmark ----------
const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const sub = spring({ frame: frame - 20, fps, config: { damping: 20 } });
  const line = interpolate(frame, [10, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
      <div style={{ textAlign: "center", opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)` }}>
        <div style={{ fontFamily: MONO, color: CYAN, fontSize: 22, letterSpacing: 6, marginBottom: 28 }}>ECHO</div>
        <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 132, color: INK, letterSpacing: -3, lineHeight: 1 }}>
          Discover. Draft. <span style={{ background: `linear-gradient(90deg, ${CYAN}, ${GREEN})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Send.</span>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${BLUE}, ${GREEN}, transparent)`, width: 600, margin: "36px auto 24px", transform: `scaleX(${line})` }} />
        <div style={{ fontFamily: DM, color: MUTED, fontSize: 30, opacity: sub }}>
          Your always-on outreach agent.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene: Community Radar ----------
const SceneRadar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });

  // URL typing
  const url = "ledgerloop.com";
  const urlChars = Math.floor(interpolate(frame, [8, 34], [0, url.length], { extrapolateRight: "clamp" }));
  const typedUrl = url.slice(0, urlChars);
  const caret = frame % 20 < 10 ? "▍" : " ";

  // Analyzing bar
  const analyzeStart = 40;
  const analyzeProgress = interpolate(frame, [analyzeStart, analyzeStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const analyzing = frame >= analyzeStart && frame < analyzeStart + 34;
  const nicheOpacity = interpolate(frame, [analyzeStart + 26, analyzeStart + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const results = [
    { kind: "NEWSLETTER", label: "GrowthOps Weekly", meta: "12.4k subs · weekly", approach: "SPONSOR", tone: CYAN, d: 80 },
    { kind: "COMMUNITY",  label: "Indie Hackers · SaaS", meta: "38k members · very active", approach: "POST", tone: GREEN, d: 92 },
    { kind: "EVENT",      label: "DevTools Summit '26", meta: "Oct · virtual · 4.2k RSVP", approach: "SPEAK", tone: BLUE, d: 104 },
    { kind: "FORUM",      label: "r/SaaS", meta: "high engagement · daily", approach: "COMMENT", tone: "#a78bfa", d: 116 },
  ];

  return (
    <AbsoluteFill style={{ padding: 120 }}>
      {/* Left copy */}
      <div style={{ position: "absolute", left: 120, top: 200, maxWidth: 640, opacity: s }}>
        <div style={{ fontFamily: MONO, color: GREEN, fontSize: 22, letterSpacing: 3, marginBottom: 18 }}>NEW · COMMUNITY RADAR</div>
        <div style={{ fontFamily: DM, fontWeight: 700, fontSize: 82, color: INK, lineHeight: 1.02, letterSpacing: -2 }}>
          Paste a URL.<br/>Get the rooms.
        </div>
        <div style={{ fontFamily: DM, color: MUTED, fontSize: 24, marginTop: 22, lineHeight: 1.4 }}>
          Echo reads your site, infers your niche, and surfaces newsletters, communities, events, and forums — with how to approach each one.
        </div>

        {/* URL input */}
        <div style={{ marginTop: 40, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)` }}>
          <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: MONO, color: MUTED, fontSize: 16 }}>https://</div>
            <div style={{ fontFamily: MONO, color: INK, fontSize: 22, flex: 1 }}>{typedUrl}<span style={{ color: CYAN }}>{caret}</span></div>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`, color: "#02121a", fontFamily: DM, fontWeight: 600, fontSize: 15 }}>Analyze</div>
          </Card>

          {/* Analyzing / niche */}
          <div style={{ marginTop: 18, height: 6, borderRadius: 4, background: `${BLUE}22`, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${analyzeProgress * 100}%`, background: `linear-gradient(90deg, ${CYAN}, ${GREEN})`, boxShadow: `0 0 12px ${CYAN}` }} />
          </div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 15, color: analyzing ? CYAN : MUTED, minHeight: 22 }}>
            {analyzing ? "› scanning site · inferring niche · matching rooms…" : ""}
          </div>
          <div style={{ opacity: nicheOpacity, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["fintech", "SMB accounting", "founder-led", "north america"].map((t) => (
              <div key={t} style={{ padding: "6px 14px", borderRadius: 999, border: `1px solid ${GREEN}66`, color: GREEN, fontSize: 14, fontFamily: MONO }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right results feed */}
      <div style={{ position: "absolute", right: 120, top: 160, width: 640, display: "flex", flexDirection: "column", gap: 16 }}>
        {results.map((r, i) => {
          const local = frame - r.d;
          const ap = spring({ frame: local, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ transform: `translateX(${interpolate(ap, [0, 1], [80, 0])}px)`, opacity: ap }}>
              <Card style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 2, color: r.tone, padding: "3px 10px", borderRadius: 6, border: `1px solid ${r.tone}66` }}>{r.kind}</div>
                  <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 13, color: MUTED }}>approach →</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 2, color: INK, padding: "3px 10px", borderRadius: 6, background: `${r.tone}22`, border: `1px solid ${r.tone}88` }}>{r.approach}</div>
                </div>
                <div style={{ fontFamily: DM, fontWeight: 600, fontSize: 24, color: INK }}>{r.label}</div>
                <div style={{ fontFamily: DM, color: MUTED, fontSize: 16, marginTop: 4 }}>{r.meta}</div>
              </Card>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};


// ---------- Persistent HUD ticks (subtle brand) ----------
const HUD: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: 60, left: 60, fontFamily: "monospace", color: `${INK}88`, fontSize: 16, letterSpacing: 3 }}>ECHO · OUTREACH AGENT</div>
    <div style={{ position: "absolute", top: 60, right: 60, fontFamily: "monospace", color: `${INK}66`, fontSize: 16, letterSpacing: 2 }}>yourechoagent.com</div>
    <div style={{ position: "absolute", bottom: 50, left: 60, right: 60, height: 1, background: `linear-gradient(90deg, transparent, ${BLUE}66, transparent)` }} />
  </AbsoluteFill>
);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG_1 }}>
      <Background />
      <HUD />
      <Sequence from={0} durationInFrames={130}><SceneDiscover /></Sequence>
      <Sequence from={130} durationInFrames={140}><SceneRadar /></Sequence>
      <Sequence from={270} durationInFrames={140}><SceneDraft /></Sequence>
      <Sequence from={410} durationInFrames={110}><SceneReply /></Sequence>
      <Sequence from={520} durationInFrames={70}><SceneClose /></Sequence>
    </AbsoluteFill>
  );
};
