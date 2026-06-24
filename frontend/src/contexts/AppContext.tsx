import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "counter" | "karigar";
export interface User {
  username: string;
  role: Role;
}
export type OrderStatus = "Pending" | "In Progress" | "Completed" | "Delivered";

export interface Order {
  id: number;
  token: string;
  customerName: string;
  phone: string;
  garmentType: string;
  style: string;
  measurements: Record<string, string>;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  fabricPhoto?: string;
}

interface AppState {
  user: User | null;
  login: (role: Role, username: string, password: string) => void;
  logout: () => void;
  orders: Order[];
  addOrder: (o: Omit<Order, "id" | "token" | "status" | "createdAt">) => Promise<Order | null>;
  updateStatus: (id: number, status: OrderStatus) => Promise<void>;
  setFabricPhoto: (id: number, dataUrl: string) => void;
  apiConfig: { javaUrl: string; pythonUrl: string };
  setApiConfig: (c: { javaUrl: string; pythonUrl: string }) => void;
  prefs: { notifications: boolean; haptics: boolean };
  setPrefs: (p: { notifications: boolean; haptics: boolean }) => void;
  loading: boolean;
}

const NORMALIZE_STATUS: Record<string, OrderStatus> = {
  BOOKED: "Pending",
  IN_PRODUCTION: "In Progress",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

const Ctx = createContext<AppState | null>(null);

const DEFAULTS = {
  javaUrl: "http://127.0.0.1:8089",
  pythonUrl: "http://127.0.0.1:8000",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [apiConfig, setApiConfigState] = useState(DEFAULTS);
  const [prefs, setPrefsState] = useState({ notifications: true, haptics: true });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Restore User Auth Session & Config Metadata
  useEffect(() => {
    try {
      const u = localStorage.getItem("tailor_user");
      const a = localStorage.getItem("tailor_api");
      const p = localStorage.getItem("tailor_prefs");
      if (u) setUser(JSON.parse(u));
      if (a) setApiConfigState(JSON.parse(a));
      if (p) setPrefsState(JSON.parse(p));
    } catch (error) {
      console.error("Failed to restore local layout profiles", error);
    }
    setReady(true);
  }, []);

  // 2. Fetch Live Database Records from Mayank's Java API on Startup
  useEffect(() => {
    if (!ready) return;

    setLoading(true);
    fetch(`${apiConfig.javaUrl}/api/orders`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to read server records");
        return res.json();
      })
      .then((data) => {
        const formattedData = data.map((o: any) => ({
          ...o,
          id: o.id || o.orderId,
          token: o.token,
          customerName: o.customerName || o.name,
          status: NORMALIZE_STATUS[o.status as keyof typeof NORMALIZE_STATUS] || o.status || "Pending"
        }));
        setOrders(formattedData);
      })
      .catch((err) => console.error("Database connection dropped or unreachable:", err))
      .finally(() => setLoading(false));
  }, [ready, apiConfig.javaUrl]);

  const login = (role: Role, username: string, _password: string) => {
    const u = { username: username || (role === "counter" ? "counter" : "karigar"), role };
    setUser(u);
    localStorage.setItem("tailor_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tailor_user");
  };

  // 3. FIX: Safely translate field structures bidirectional to unfreeze UI Routers
  const addOrder: AppState["addOrder"] = async (o) => {
    try {
      const payload = {
        ...o,
        orderDate: new Date().toISOString().split("T")[0],
        estHours: 4,
        deliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split("T")[0],
        status: "BOOKED"
      };

      const res = await fetch(`${apiConfig.javaUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Server validation rejected submission.");
      }

      const savedOrder = await res.json();

      const normalizedOrder: Order = {
        id: savedOrder.orderId ?? savedOrder.id,
        token: savedOrder.token,
        customerName: savedOrder.customerName ?? savedOrder.name ?? o.customerName,
        phone: savedOrder.phone ?? o.phone,
        garmentType: savedOrder.garmentType ?? o.garmentType,
        style: savedOrder.style ?? o.style ?? "",
        measurements: savedOrder.measurements ?? o.measurements ?? {},
        notes: savedOrder.notes ?? o.notes ?? "",
        status: NORMALIZE_STATUS[savedOrder.status as keyof typeof NORMALIZE_STATUS] ?? "Pending",
        createdAt: savedOrder.createdAt ?? new Date().toISOString(),
      };

      setOrders((prev) => [normalizedOrder, ...prev]);
      return normalizedOrder;
    } catch (err: any) {
      console.error("Critical submission failure log:", err);
      alert(err.message || "Failed to commit order execution block.");
      return null;
    }
  };

  const STATUS_ENDPOINT: Record<OrderStatus, string> = {
    "Pending": "production",
    "In Progress": "complete",
    "Completed": "deliver",
    "Delivered": "deliver",
  };

  const updateStatus = async (id: number, status: OrderStatus) => {
    try {
      const endpoint = STATUS_ENDPOINT[status];
      const res = await fetch(`${apiConfig.javaUrl}/api/orders/${id}/${endpoint}`, {
        method: "PUT",
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || "State change rejection sequence.");
      }

      const updatedOrder = await res.json();

      const normalizedUpdated = {
        id: updatedOrder.orderId ?? updatedOrder.id,
        token: updatedOrder.token,
        customerName: updatedOrder.customerName ?? updatedOrder.name,
        phone: updatedOrder.phone ?? "",
        garmentType: updatedOrder.garmentType ?? "",
        style: updatedOrder.style ?? "",
        measurements: updatedOrder.measurements ?? {},
        notes: updatedOrder.notes ?? "",
        status: status,
        createdAt: updatedOrder.createdAt ?? new Date().toISOString(),
      };

      setOrders((prev) => prev.map((o) => (o.id === id ? normalizedUpdated : o)));
    } catch (err: any) {
      alert(err.message || "Failed to execute workflow change.");
    }
  };

  const setFabricPhoto = (id: number, dataUrl: string) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fabricPhoto: dataUrl } : o)));

  const setApiConfig = (c: typeof DEFAULTS) => {
    setApiConfigState(c);
    localStorage.setItem("tailor_api", JSON.stringify(c));
  };

  const setPrefs = (p: typeof prefs) => {
    setPrefsState(p);
    localStorage.setItem("tailor_prefs", JSON.stringify(p));
  };

  return (
    <Ctx.Provider
      value={{
        user,
        login,
        logout,
        orders,
        addOrder,
        updateStatus,
        setFabricPhoto,
        apiConfig,
        setApiConfig,
        prefs,
        setPrefs,
        loading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be within AppProvider");
  return ctx;
}
