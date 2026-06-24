import { createFileRoute, Navigate, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useApp, type OrderStatus } from "@/contexts/AppContext";

export const Route = createFileRoute("/token/$tokenId")({
  head: ({ params }) => ({ meta: [{ title: `Token ${params.tokenId} — Details` }] }),
  component: TokenDetail,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <div className="text-5xl font-bold text-muted-foreground">404</div>
      <h1 className="text-xl font-semibold">Token not found</h1>
      <p className="text-sm text-muted-foreground">No order exists with this token.</p>
      <Link to="/karigar" className="text-gold hover:underline text-sm">
        Back to Workshop
      </Link>
    </div>
  ),
});

const statusColor = (s: OrderStatus) =>
  s === "Pending"
    ? "bg-orange-500"
    : s === "In Progress"
      ? "bg-blue-500"
      : s === "Completed"
        ? "bg-emerald-500"
        : "bg-muted";

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function TokenDetail() {
  const { tokenId } = Route.useParams();
  const { user, orders, updateStatus } = useApp();
  const navigate = useNavigate();
  const order = orders.find((o) => o.token === tokenId);

  if (!user) return <Navigate to="/login" />;

  const change = (s: OrderStatus) => {
    if (!order) return;
    if (confirm(`Mark token ${order.token} as ${s}?`)) updateStatus(order.id, s);
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <div className="text-5xl font-bold text-muted-foreground">404</div>
        <h1 className="text-xl font-semibold">Token not found</h1>
        <p className="text-sm text-muted-foreground">
          No order exists with token <strong>{tokenId}</strong>.
        </p>
        <Link to="/karigar" className="text-gold hover:underline text-sm">
          Back to Workshop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: user.role === "counter" ? "/counter" : "/karigar" })}
            className="p-2 -ml-2 rounded-md hover:bg-accent text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="text-sm font-semibold">Token {order.token}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              {order.status}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Token</div>
          <div className="text-5xl sm:text-6xl font-bold text-gold tabular-nums tracking-wider">
            {order.token}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`h-2 w-2 rounded-full ${statusColor(order.status)}`} />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {order.status}
            </span>
          </div>
          <div className="mt-4 text-lg font-medium">{order.customerName}</div>
          <div className="text-sm text-muted-foreground">{order.phone}</div>
          <div className="text-xs text-muted-foreground/70 mt-1">
            Received {timeAgo(order.createdAt)}
          </div>
        </div>

        <Section label="Garment">
          <div className="font-medium">{order.garmentType}</div>
          <div className="text-sm text-muted-foreground mt-1">{order.style || "—"}</div>
        </Section>

        <Section label="Measurements">
          <div className="divide-y divide-border/50">
            {Object.entries(order.measurements)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="tabular-nums">{v}″</span>
                </div>
              ))}
          </div>
          {order.notes && (
            <div className="mt-4 p-3 rounded-lg bg-gold/10 border border-gold/30">
              <div className="text-[10px] uppercase tracking-wider text-gold mb-1">
                Tailor Notes
              </div>
              <div className="text-sm">{order.notes}</div>
            </div>
          )}
        </Section>

        {order.fabricPhoto && (
          <Section label="Fabric Photo">
            <img
              src={order.fabricPhoto}
              alt="Fabric"
              className="w-full rounded-lg border border-border"
            />
          </Section>
        )}

        {user.role === "karigar" && (
          <Section label="Actions">
            <div className="space-y-2">
              {order.status === "Pending" && (
                <>
                  <Button
                    onClick={() => change("In Progress")}
                    className="w-full bg-orange-500 hover:bg-orange-500/90 text-white"
                  >
                    Start Working
                  </Button>
                  <Button onClick={() => change("Delivered")} variant="outline" className="w-full">
                    Mark Delivered
                  </Button>
                </>
              )}
              {order.status === "In Progress" && (
                <>
                  <Button
                    onClick={() => change("Completed")}
                    className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white"
                  >
                    Mark Complete
                  </Button>
                  <Button onClick={() => change("Delivered")} variant="outline" className="w-full">
                    Mark Delivered
                  </Button>
                </>
              )}
              {order.status === "Completed" && (
                <Button
                  onClick={() => change("Delivered")}
                  className="w-full bg-blue-600 hover:bg-blue-600/90 text-white"
                >
                  Mark Delivered
                </Button>
              )}
              {order.status === "Delivered" && (
                <div className="text-center py-4 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                  Order delivered · final state
                </div>
              )}
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">{label}</div>
      {children}
    </div>
  );
}
