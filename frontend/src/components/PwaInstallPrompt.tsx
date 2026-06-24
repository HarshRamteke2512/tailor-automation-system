import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const shouldShow = useMemo(
    () => Boolean(deferredPrompt) && !dismissed && !installed,
    [deferredPrompt, dismissed, installed],
  );

  if (!shouldShow) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed left-3 right-3 top-3 z-[60] sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm rounded-2xl border border-gold/30 bg-card/95 backdrop-blur p-3 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Install TAILOR SHOP</div>
          <p className="text-xs text-muted-foreground mt-1">
            Add this app to your home screen for a full-screen mobile experience.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Install
            </Button>
            <Button variant="ghost" onClick={() => setDismissed(true)} className="px-3">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
