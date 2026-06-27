import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Camera, Check, ImageIcon, Mic, MicOff, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/counter")({
  head: () => ({ meta: [{ title: "New Order — Counter" }] }),
  component: Counter,
});

const GARMENTS = ["Shirt", "Trouser", "Suit", "Kurta", "Sherwani", "Blazer", "Waistcoat", "Achkan"];

const MEASUREMENTS_BY_GARMENT: Record<string, string[]> = {
  Shirt: ["Chest", "Shoulder", "Sleeve", "Neck", "Shirt/Kurta Length"],
  Trouser: ["Waist", "Hip", "Trouser Length"],
  Suit: ["Chest", "Waist", "Hip", "Shoulder", "Sleeve", "Trouser Length", "Neck"],
  Kurta: ["Chest", "Shoulder", "Sleeve", "Neck", "Shirt/Kurta Length"],
  Sherwani: ["Chest", "Waist", "Hip", "Shoulder", "Sleeve", "Shirt/Kurta Length", "Neck"],
  Blazer: ["Chest", "Waist", "Shoulder", "Sleeve", "Neck"],
  Waistcoat: ["Chest", "Waist", "Shoulder", "Shirt/Kurta Length"],
  Achkan: ["Chest", "Waist", "Shoulder", "Sleeve", "Shirt/Kurta Length", "Neck"],
};

const emptyForm = {
  customerName: "",
  phone: "",
  garmentType: "Shirt",
  style: "",
  notes: "",
  measurements: Object.fromEntries(MEASUREMENTS_BY_GARMENT.Shirt.map((m) => [m, ""])) as Record<string, string>,
};

function Counter() {
  const { user, addOrder, refreshOrders } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dictating, setDictating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handlePhoto = (f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setPhotoError("File too large — 5MB max.");
      return;
    }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(f);
  };

  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice dictation is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (dictating) {
      recognitionRef.current?.stop();
      setDictating(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (last) setForm((f) => ({ ...f, notes: last[0].transcript }));
    };
    recognition.onerror = () => setDictating(false);
    recognition.onend = () => setDictating(false);
    recognitionRef.current = recognition;
    recognition.start();
    setDictating(true);
  };

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "counter") return <Navigate to="/karigar" />;

  const setMeas = (k: string, v: string) =>
    setForm((f) => ({ ...f, measurements: { ...f.measurements, [k]: v } }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.phone) return;
    const o = await addOrder({ ...form, fabricPhoto: photoPreview ?? undefined });
    if (o) setIssuedToken(o.token);
  };

  const reset = () => {
    setIssuedToken(null);
    setForm(emptyForm);
    setPhotoPreview(null);
    setPhotoError(null);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Counter</div>
            <h1 className="text-2xl sm:text-3xl font-semibold">New Order</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Capture measurements and issue a 4-digit token for the fabric bundle.
            </p>
          </div>
          <button
            onClick={refreshOrders}
            className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:border-gold/50 transition-colors cursor-pointer shrink-0"
            title="Refresh orders"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6 sm:space-y-8">
          <Section title="Customer">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer Name">
                <Input
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  required
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </Field>
            </div>
          </Section>

          <Section title="Garment">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Garment Type">
                <Select
                  value={form.garmentType}
                  onValueChange={(v) => {
                    const prev = form.measurements;
                    const relevant = MEASUREMENTS_BY_GARMENT[v] ?? [];
                    const merged = Object.fromEntries(relevant.map((m) => [m, prev[m] ?? ""]));
                    setForm({ ...form, garmentType: v, measurements: merged });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GARMENTS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Style / Description">
              <Textarea
                rows={3}
                value={form.style}
                onChange={(e) => setForm({ ...form, style: e.target.value })}
                placeholder="Fabric, cut, collar, buttons, finishing details…"
              />
            </Field>
          </Section>

          <Section title="Measurements (inches)">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(MEASUREMENTS_BY_GARMENT[form.garmentType] ?? []).map((m) => (
                <Field key={m} label={m}>
                  <Input
                    inputMode="decimal"
                    value={form.measurements[m]}
                    onChange={(e) => setMeas(m, e.target.value)}
                    placeholder="—"
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Tailor Notes">
            <div className="flex gap-2">
              <Textarea
                className="flex-1"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions for the karigar…"
              />
              <Button
                type="button"
                variant={dictating ? "default" : "outline"}
                onClick={toggleDictation}
                className={`shrink-0 self-start ${dictating ? "bg-red-500 hover:bg-red-500/90 text-white animate-pulse" : ""}`}
                title={dictating ? "Stop dictation" : "Start voice dictation"}
              >
                {dictating ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            {dictating && (
              <div className="text-[10px] text-green-500 uppercase tracking-wider">
                Listening… speak clearly
              </div>
            )}
          </Section>

          <Section title="Fabric Photo">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Fabric"
                className="w-full rounded-lg border border-border"
              />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => cameraRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" /> Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => fileRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Gallery
              </Button>
            </div>
            {photoPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setPhotoPreview(null); setPhotoError(null); }}
                className="text-xs text-muted-foreground"
              >
                Remove photo
              </Button>
            )}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            />
            {photoError && <div className="text-xs text-destructive">{photoError}</div>}
          </Section>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
              Clear
            </Button>
            <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90 px-8">
              Generate Token
            </Button>
          </div>
        </form>
      </div>

      <Dialog
        open={!!issuedToken}
        onOpenChange={(o) => {
          if (!o) reset();
        }}
      >
        <DialogContent className="max-w-lg bg-card border-gold/30">
          <div className="text-center py-8">
            <div className="h-14 w-14 mx-auto rounded-full bg-gold/20 flex items-center justify-center mb-6">
              <Check className="h-7 w-7 text-gold" />
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Token Issued
            </div>
            <div
              className="text-5xl sm:text-[80px] leading-none font-bold text-gold tabular-nums tracking-wider mb-6"
              style={{ textShadow: "0 4px 30px oklch(0.78 0.13 85 / 0.4)" }}
            >
              {issuedToken}
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Write this number on the customer's fabric bundle.
            </p>
            <Button
              onClick={reset}
              className="bg-gold text-gold-foreground hover:bg-gold/90 w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
      <h3 className="text-xs uppercase tracking-[0.2em] text-gold">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
