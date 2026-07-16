"use client";
import { useState, useEffect } from "react";
import api from "@/app/lib/axiosInstance";

interface Pembayaran {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  student: Mahasiswa;
}

interface Mahasiswa {
  name: string;
  studentNumber: string;
  email: string;
  class: {
    name: string;
    major: {
      name: string;
      faculty: {
        name: string;
      };
    };
  };
  tfGroup: {
    group: string;
    amount: number;
  };
}

const getPembayaran = async () => {
  const res = await api.get("/manage-students/payment");
  return res.data.data;
};

const updatePembayaran = async (id: string) => {
  const res = await api.put(`/manage-students/payment/${id}`, {
    status: "PAID",
  });
  return res.data;
};

const MahasiswaPembayaran = () => {
  const [loading, setLoading] = useState(true);
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";

    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    );

    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await fetchPembayaran();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchPembayaran = async () => {
    try {
      const data = await getPembayaran();
      setPembayaranList(data);
    } catch (err) {
      console.error("Gagal fetch KHS:", err);
    }
  };

  const handlePayment = async (id: string) => {
    const pembayaran = pembayaranList.find((p) => p.id === id);
    if (!pembayaran) return;

    const data = {
      id: pembayaran.id,
      name: pembayaran.student.name,
      amount: pembayaran.student.tfGroup.amount,
      studentNumber: pembayaran.student.studentNumber,
      major: pembayaran.student.class.major.name,
      email: pembayaran.student.email,
    };

    // const res = await fetch("/api/tokenizer", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // });
    // const responseData = await res.json();
    // window.snap.pay(responseData.token)

    try {
      const res = await api.post("/payment/create-token", data);
      const responseData = res.data;
          // console.log({responseData});
      (window as any).snap?.pay(responseData.token);
    } catch (error: any) {
      console.error("Error saat memproses pembayaran:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan pada server.");
    }
  };

  const unpaidList = pembayaranList.filter((p) => p.status === "UNPAID" || p.status === "PENDING");
  const paidList = pembayaranList.filter((p) => p.status === "PAID");

  return (
    <section className="section">
      <div className="section-header">
        <h1>Pembayaran</h1>
      </div>

      <div className="section-body">
        <div className="row">
          <div className="col-12">
            <div className="card">
              {loading ? (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ minHeight: "300px" }}
                ></div>
              ) : (
                <>
                  <div className="card-body">
                    {unpaidList.length > 0 && (
                      <>
                        <section
                          className="hero bg-warning text-dark py-3 mb-4 rounded shadow-sm"
                          id="hero-ukt"
                        >
                          <div className="hero-inner text-center">
                            <p className="lead">
                              Silahkan untuk melakukan pembayaran ukt terlebih
                              dahulu agar anda dapat mengajukan kartu rencarana
                              studi
                            </p>
                          </div>
                        </section>

                        <div className="table-responsive">
                          <table className="table table-striped" id="uktTable">
                            <thead>
                              <tr>
                                <th>Nama</th>
                                <th>NIM</th>
                                <th>Kelas</th>
                                <th>Program Studi</th>
                                <th>Fakultas</th>
                                <th>Golongan</th>
                                <th>Total Tagihan</th>
                                <th>Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {unpaidList.map((pembayaran) => (
                                <tr key={pembayaran.id}>
                                  <td>{pembayaran.student.name}</td>
                                  <td>{pembayaran.student.studentNumber}</td>
                                  <td>{pembayaran.student.class.name}</td>
                                  <td>{pembayaran.student.class.major.name}</td>
                                  <td>
                                    {
                                      pembayaran.student.class.major.faculty
                                        .name
                                    }
                                  </td>
                                  <td>{pembayaran.student.tfGroup.group}</td>
                                  <td>
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                    }).format(
                                      pembayaran.student.tfGroup.amount,
                                    )}
                                  </td>
                                  <td>
                                    <a
                                      href="#"
                                      className="btn btn-danger"
                                      onClick={() =>
                                        handlePayment(pembayaran.id)
                                      }
                                    >
                                      Bayar
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    <div className="table-responsive mt-4">
                      <table className="table table-striped" id="table-1">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Total Tagihan</th>
                            <th>Kode Pembayaran</th>
                            <th>Golongan</th>
                            <th>Tahun Ajaran</th>
                            <th>Status</th>
                            <th>Dibuat Pada</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paidList.length > 0 ? (
                            paidList.map((p, idx) => (
                              <tr key={p.id}>
                                <td>{idx + 1}</td>
                                <td>{p.student.name}</td>
                                <td>{p.student.email}</td>
                                <td>
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                    }).format(
                                      p.student.tfGroup.amount,
                                    )}
                                  </td>
                                <td>{p.code}</td>
                                <td>{p.student.tfGroup.group}</td>
                                <td>2025/2026</td>

                                <td>
                                  <span className="badge badge-success">
                                    {p.status}
                                  </span>
                                </td>
                                <td>
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center">
                                Belum ada pembayaran sukses.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MahasiswaPembayaran;
