import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ClipboardList, LayoutDashboard, LogOut, Scissors, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  const counterTabs = [
    { to: "/counter", label: "New Order", icon: ClipboardList },
    { to: "/settings", label: "Settings", icon: Settings },
  ];
  const karigarTabs = [
    { to: "/karigar", label: "Workshop", icon: LayoutDashboard },
    { to: "/settings", label: "Settings", icon: Settings },
  ];
  const tabs = user.role === "counter" ? counterTabs : karigarTabs;

  return (
    <div className="min-h-screen flex flex-col pb-[calc(env(safe-area-inset-bottom)+4rem)] sm:pb-0">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gold flex items-center justify-center">
              <Scissors className="h-4 w-4 text-gold-foreground" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-semibold tracking-wide">TAILOR SHOP</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] hidden sm:block">
                {user.role === "counter" ? "Counter Desk" : "Karigar Workshop"}
              </div>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {tabs.map((t) => {
              const active = pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${active ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="ml-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="sm:hidden ml-auto text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 min-w-0">{children}</main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3 gap-1 p-2 max-w-6xl mx-auto">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] transition-colors ${active ? "bg-gold text-gold-foreground" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                <span className="leading-none">{t.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="leading-none">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
