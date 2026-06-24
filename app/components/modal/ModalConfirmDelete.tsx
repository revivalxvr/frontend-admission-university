"use client";
import React from "react";

interface ModalConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ModalConfirmDelete: React.FC<ModalConfirmDeleteProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete",
  message = "Are you sure you would like to do this?",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 10000, // Di atas elemen lainnya
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
        <div className="modal-content" style={{ borderRadius: "20px", border: "none", padding: "15px" }}>
          
          {/* Tombol Silang (X) di Pojok Kanan Atas */}
          <div className="text-right" style={{ paddingRight: "10px" }}>
            <button
              type="button"
              className="close"
              onClick={onClose}
              style={{ fontSize: "28px", fontWeight: "300", opacity: 0.5 }}
            >
              <span>&times;</span>
            </button>
          </div>

          <div className="modal-body text-center pt-0">
            {/* Icon Peringatan Segitiga Merah Ring (Sesuai Gambar Referensi) */}
            <div
              className="mb-4 d-inline-flex align-items-center justify-content-center"
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#fff5f5",
                borderRadius: "50%",
              }}
            >
              <i className="fas fa-exclamation-triangle" style={{ fontSize: "30px", color: "#e53e3e" }}></i>
            </div>

            {/* Judul Teks */}
            <h4 style={{ fontWeight: "700", color: "#1a202c", marginBottom: "10px" }}>
              {title}
            </h4>

            {/* Pesan Sub-Judul */}
            <p style={{ color: "#718096", fontSize: "15px", lineHeight: "1.5", padding: "0 10px" }}>
              {message}
            </p>
          </div>

          {/* Bagian Tombol Aksi Bawah */}
          <div className="modal-footer border-0 d-flex gap-3 justify-content-center pt-0 pb-3" style={{ gap: "15px" }}>
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              style={{
                flex: 1,
                borderRadius: "12px",
                padding: "12px",
                fontWeight: "600",
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                color: "#1a202c",
                boxShadow: "none"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn"
              onClick={onConfirm}
              style={{
                flex: 1,
                borderRadius: "12px",
                padding: "12px",
                fontWeight: "600",
                backgroundColor: "#c53030", // Warna merah tegas konfirmasi
                color: "#fff",
                boxShadow: "none"
              }}
            >
              Confirm
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalConfirmDelete;