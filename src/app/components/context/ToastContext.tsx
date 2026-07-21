"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

// 1. Definisikan tipe data untuk Notifikasi
type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Fungsi memicu munculnya toast baru
  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Otomatis hapus notifikasi setelah 4 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* RENDER TOAST CONTAINER DI SINI (Melayang di atas aplikasi) */}
      <div
        className="toast-container"
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
          maxWidth: "400px",
          pointerEvents: "none"
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`custom-toast alert-${toast.type}`}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderRadius: "30px", // Bentuk kapsul melengkung sesuai gambar referensi Anda
              color: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              backgroundColor: toast.type === "success" ? "#47c363" : toast.type === "error" ? "#fc544b" : "#3abaf4",
              transition: "all 0.3s ease",
              animation: "slideDown 0.3s ease-out"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Icon Dinamis berdasarkan Status */}
              <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`} style={{ fontSize: "18px" }}></i>
              <span style={{ fontWeight: 500, fontSize: "14px" }}>{toast.message}</span>
            </div>
            
            {/* Tombol Silang Guna Menutup Manual */}
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontSize: "16px",
                padding: "0",
                marginLeft: "15px"
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Tambahkan style animasi CSS sederhana ke global DOM */}
      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// Custom hook agar pemanggilannya sangat pendek di komponen lain
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast harus digunakan di dalam ToastProvider");
  return context;
};