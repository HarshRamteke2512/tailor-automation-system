import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ChevronRight, LogOut, User } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — VANYA" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout, apiConfig, setApiConfig, prefs, setPrefs } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<"java" | "python" | null>(null);
  const [draft, setDraft] = useState("");

  if (!user) return <Navigate to="/login" />;

  const openEdit = (k: "java" | "python") => {
    setDraft(k === "java" ? apiConfig.javaUrl : apiConfig.pythonUrl);
    setEditing(k);
  };
  const saveEdit = () => {
    if (editing === "java") setApiConfig({ ...apiConfig, javaUrl: draft });
    if (editing === "python") setApiConfig({ ...apiConfig, pythonUrl: draft });
    setEditing(null);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8">Settings</h1>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gold flex items-center justify-center">
            <User className="h-5 w-5 text-gold-foreground" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{user.username}</div>
            <div className="text-xs uppercase tracking-wider text-gold mt-0.5">
              {user.role === "counter" ? "Counter Staff" : "Karigar"}
            </div>
          </div>
        </div>

        <Group title="Preferences">
          <ToggleRow
            label="Notifications"
            checked={prefs.notifications}
            onChange={(v) => setPrefs({ ...prefs, notifications: v })}
          />
          <ToggleRow
            label="Haptic Feedback"
            checked={prefs.haptics}
            onChange={(v) => setPrefs({ ...prefs, haptics: v })}
          />
        </Group>

        <Group title="Server Configuration">
          <Row label="Java API" value={apiConfig.javaUrl} onClick={() => openEdit("java")} />
          <Row label="Python API" value={apiConfig.pythonUrl} onClick={() => openEdit("python")} />
          <Row
            label="Reset to Defaults"
            onClick={() =>
              setApiConfig({ javaUrl: "http://127.0.0.1:8089", pythonUrl: "http://127.0.0.1:8000" })
            }
          />
        </Group>

        <button
          onClick={() => {
            if (confirm("Sign out?")) {
              logout();
              navigate({ to: "/login" });
            }
          }}
          className="w-full mt-6 p-4 rounded-xl bg-card border border-border hover:border-destructive/50 text-destructive flex items-center justify-center gap-2 transition-colors h-12"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{editing === "java" ? "Java API URL" : "Python API URL"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Endpoint</Label>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="http://192.168.1.10:8080"
            />
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
                onClick={saveEdit}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 sm:mb-6">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 px-2">
        {title}
      </div>
      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-accent/40 transition-colors text-left"
    >
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {value && <span className="truncate max-w-[140px] sm:max-w-[180px]">{value}</span>}
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
