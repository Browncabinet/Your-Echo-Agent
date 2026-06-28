import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, BookOpen, Wallet, Store, LogOut, LogIn, Sparkles, Radar } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon?: typeof Store; external?: boolean };

const NAV: NavItem[] = [
  { to: "/for-agents", label: "Marketplace", icon: Store },
  { to: "/for-agents/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/for-agents/discover", label: "Discover", icon: Sparkles },
  { to: "/for-agents/radar", label: "My Radar", icon: Radar },
  { to: "/for-agents/billing", label: "Billing", icon: Wallet },
  { to: "/for-agents/docs", label: "Docs", icon: BookOpen },
];

interface PartnerShellProps {
  children: ReactNode;
  width?: "narrow" | "wide";
  hideNav?: boolean;
}

export function PartnerShell({ children, width = "wide", hideNav = false }: PartnerShellProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/for-agents";
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#08080c] text-zinc-100 antialiased"
      style={{ fontFamily: "'Manrope', system-ui, -apple-system, sans-serif" }}
    >
      {/* subtle radial glow + grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 60%)" }}
      />

      <header className="relative z-10 border-b border-white/[0.06] bg-[#08080c]/80 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="cursor-pointer flex items-center"><Logo /></Link>
            {!hideNav && (
              <nav className="hidden md:flex items-center gap-1 text-sm">
                {NAV.map((item) => {
                  const active = pathname === item.to || (item.to !== "/for-agents" && pathname.startsWith(item.to));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors",
                        active
                          ? "text-white bg-white/[0.06]"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://yourechoagent.com/.well-known/agent.json"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/[0.06]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API live
            </a>
            {user ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                className="text-zinc-400 hover:text-white hover:bg-white/[0.05] gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/[0.05]">
                  <Link to="/for-agents/login" className="gap-1.5"><LogIn className="w-3.5 h-3.5" /> Log in</Link>
                </Button>
                <Button asChild size="sm" className="bg-white text-zinc-900 hover:bg-zinc-200 font-medium">
                  <Link to="/for-agents/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "relative z-10 flex-1 container mx-auto px-4 py-10 sm:py-14",
          width === "narrow" ? "max-w-md" : "max-w-6xl"
        )}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}
