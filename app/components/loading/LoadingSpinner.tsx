"use client";
import React from "react";

interface LoadingSpinnerProps {
  isLoading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div
      className="loading-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Latar belakang semi-transparan putih bersih
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 11000, // Di atas modal dan toast agar mengunci seluruh interaksi
        backdropFilter: "blur(2px)", // Efek blur halus pada konten di belakangnya
      }}
    >
      {/* Container Spinner */}
      <div className="spinner-container" style={{ position: "relative", width: "80px", height: "80px" }}>
        {/* Menggunakan ikon khusus spinner/loading bawaan FontAwesome jika Stisla menyediakannya */}
        <div className="custom-spinner"></div>
      </div>

      {/* Style Animasi CSS Murni untuk membentuk kelopak putar sesuai gambar */}
      <style jsx global>{`
        .custom-spinner {
          width: 64px;
          height: 64px;
          border: 6px solid #e2e8f0;
          border-radius: 50%;
          border-top-color: #5a8dee; /* Warna biru utama sesuai gambar screenshot Anda */
          border-bottom-color: #5a8dee;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;