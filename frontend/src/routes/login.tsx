import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ArrowLeft, ClipboardList, Eye, EyeOff, LayoutDashboard, Scissors } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp, type Role } from "@/contexts/AppContext";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — TAILOR SHOP" }] }),
  component: Login,
});

function Login() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  if (user) {
    navigate({ to: user.role === "counter" ? "/counter" : "/karigar" });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    login(role, username, password);
    navigate({ to: role === "counter" ? "/counter" : "/karigar" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-[radial-gradient(ellipse_at_top,_oklch(0.25_0.05_260)_0%,_transparent_60%)]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="h-14 w-14 rounded-xl bg-gold flex items-center justify-center mb-4 shadow-[0_8px_30px_-10px_oklch(0.78_0.13_85_/_0.6)]">
            <Scissors className="h-6 w-6 text-gold-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-wide">VANYA</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mt-1">
            Where Every Stitch Finds Harmony
          </p>
        </div>

        {!role ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground mb-6">Choose your workspace</p>
            <button
              onClick={() => setRole("counter")}
              className="w-full p-4 sm:p-5 rounded-xl bg-card border border-border hover:border-gold transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Counter Staff</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Front desk · Create orders & issue tokens
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setRole("karigar")}
              className="w-full p-4 sm:p-5 rounded-xl bg-card border border-border hover:border-gold transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Karigar</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Workshop · Manage stitching queue
                  </div>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-4 bg-card border border-border rounded-xl p-5 sm:p-6"
          >
            <button
              type="button"
              onClick={() => setRole(null)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold mb-1">
                {role === "counter" ? "Counter Staff" : "Karigar"}
              </div>
              <h2 className="text-lg font-semibold">Sign in to continue</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u">Username</Label>
              <Input
                id="u"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === "counter" ? "counter" : "karigar"}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <div className="relative">
                <Input
                  id="p"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
              Sign in
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              Demo mode · any credentials work
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
