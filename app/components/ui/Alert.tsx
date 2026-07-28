"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type AlertType = "success" | "error" | "warning";

export interface AlertItem {
  id: number;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (
    message: string,
    type?: AlertType,
    duration?: number
  ) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    (
        message: string,
        type: AlertType = "success",
        duration = 4000
    ) => {
        
        console.log("showAlert dipanggil", message);

        const id = Date.now() + Math.random();

        setAlerts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
        removeAlert(id);
        }, duration);
    },
    [removeAlert]
    );

  const value = useMemo(
    () => ({
      showAlert,
    }),
    [showAlert]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}

      <div className="alert-container">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            alert={alert}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

function Alert({
  alert,
  onClose,
}: {
  alert: AlertItem;
  onClose: () => void;
}) {
  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    warning: "fa-exclamation-circle",
  };

  const colors = {
    success: "var(--green)",
    error: "var(--red)",
    warning: "var(--yellow)",
  };

  return (
    <div className={`alert ${alert.type}`}>
      <span
        className="alert-icon"
        style={{ color: colors[alert.type] }}
      >
        <i className={`fas ${icons[alert.type]}`} />
      </span>

      <span>{alert.message}</span>

      <button className="alert-close" onClick={onClose}>
        <i className="fas fa-times" />
      </button>
    </div>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert must be used inside AlertProvider");
  }

  return context;
}