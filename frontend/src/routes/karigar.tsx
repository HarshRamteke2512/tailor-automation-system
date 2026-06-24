import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ChevronRight, Search } from "lucide-react";
import { useApp, type OrderStatus } from "@/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/karigar")({
  head: () => ({ meta: [{ title: "Workshop — Karigar" }] }),
  component: Karigar,
});

const FILTERS: ("All" | OrderStatus)[] = ["All", "Pending", "In Progress", "Completed"];

const statusColor = (s: OrderStatus) =>
  s === "Pending"
    ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
    : s === "In Progress"
      ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
      : s === "Completed"
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : "bg-muted text-muted-foreground border-border";

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NumpadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const handleDigit = (d: string) => {
    if (value.length < 4) setValue((prev) => prev + d);
  };

  const handleSubmit = () => {
    if (value.trim()) {
      navigate({ to: "/token/$tokenId", params: { tokenId: value.trim() } });
      setValue("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[320px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>Search Token</DialogTitle>
          <DialogDescription>Enter the token number to view details.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="w-full bg-muted rounded-xl px-4 py-3 text-center text-3xl font-bold tabular-nums tracking-widest">
            {value || <span className="text-muted-foreground/40">—</span>}
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(String(d))}
                className="h-14 rounded-xl bg-card border border-border text-lg font-semibold hover:bg-accent active:scale-95 transition-all cursor-pointer"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => setValue("")}
              className="h-14 rounded-xl bg-card border border-border text-xs font-medium text-muted-foreground hover:bg-accent active:scale-95 transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="h-14 rounded-xl bg-card border border-border text-lg font-semibold hover:bg-accent active:scale-95 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              onClick={() => setValue((prev) => prev.slice(0, -1))}
              className="h-14 rounded-xl bg-card border border-border text-lg font-semibold hover:bg-accent active:scale-95 transition-all cursor-pointer"
            >
              ⌫
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="w-full h-12 rounded-xl bg-gold text-gold-foreground font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            View Token
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Karigar() {
  const { user, orders } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [searchOpen, setSearchOpen] = useState(false);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "karigar") return <Navigate to="/counter" />;

  const stats = {
    Total: orders.length,
    Pending: orders.filter((o) => o.status === "Pending").length,
    "In Progress": orders.filter((o) => o.status === "In Progress").length,
    Done: orders.filter((o) => o.status === "Completed" || o.status === "Delivered").length,
  };

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Workshop</div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Active Tokens</h1>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/50 transition-colors cursor-pointer shrink-0"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 sm:mb-8">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-card border border-border rounded-xl p-4 sm:p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="text-3xl font-semibold mt-2 tabular-nums">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-x-visible md:flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${filter === f ? "bg-gold text-gold-foreground border-gold" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No orders in this view.
            </div>
          )}
          {filtered.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate({ to: "/token/$tokenId", params: { tokenId: o.token } })}
              className="w-full bg-card border border-border hover:border-gold/50 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left transition-colors"
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                <span className="text-xl sm:text-2xl font-bold text-gold tabular-nums">
                  {o.token}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{o.customerName}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor(o.status)}`}
                  >
                    {o.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {o.garmentType} · {o.style || "—"}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">{timeAgo(o.createdAt)}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <NumpadDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </AppShell>
  );
}
