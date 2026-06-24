import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAILOR SHOP" },
      { name: "description", content: "Premium custom tailoring boutique management." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === "counter" ? "/counter" : "/karigar"} />;
}
