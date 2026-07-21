"use client";
import React, { useState, useEffect } from "react";
// import MyBarChart from '../../../components/myBarChart';
import api from "@/src/lib/axiosInstance";
import AddForm from "@/src/app/components/form/AddForm";

interface Pembayaran {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  studentId: string;
  student: Mahasiswa;
}
interface Mahasiswa {
  id: string;
  name: string;
  studentNumber: string;
  semester: number;
  class: Kelas;
  tfGroup: GolUkt;
}
interface Kelas {
  name: string;
  year: TahunAjaran;
}
interface GolUkt {
  id: string;
  group: string;
}
interface TahunAjaran {
  id: string;
  name: string;
}

//API services
const getMahasiswa = async () => {
  const res = await api.get("/students");
  return res.data.data;
};
const getPembayaran = async () => {
  const res = await api.get("/payment");
  return res.data.data;
};
const addPembayaran = async (data: {
  code: string;
  status: string;
  studentId: string;
}) => {
  const res = await api.post("/payment", data);
  return res.data;
};
const updatePembayaran = async (
  id: string,
  data: {
    status: string;
  },
) => {
  const res = await api.put(`/payment/${id}`, data);
  return res.data;
};
//end Of API services
const PembayaranPage = () => {
  //buat state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedPembayaran, setSelectedPembayaran] = useState<
    Partial<Pembayaran>
  >({});

  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);

  const initialPembayaranState = {
  studentId: "",
  code: "",
  status: "",
  };
  const [newPembayaran, setNewPembayaran] = useState(initialPembayaranState);
  //end of state

  //tampilkan data awal using seEffect
  useEffect(() => {
    fetchPembayaran();
    fetchMahasiswa();
  }, []);

  const fetchMahasiswa = async () => {
    try {
      const data = await getMahasiswa();
      setMahasiswaList(data);
    } catch (error) {
      console.error("Error fetching mahasiswa:", error);
    }
  };

  const fetchPembayaran = async () => {
    try {
      const data = await getPembayaran();
      setPembayaranList(data);
    } catch (error) {
      console.error("Error fetching pembayaran:", error);
    }
  };
  const openEditModal = (p: Pembayaran) => {
    setSelectedPembayaran(p);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedPembayaran({});
    setIsEditModalOpen(false);
  };
  const handleSaveUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPembayaran.id) return;
    try {
      const updated = await updatePembayaran(selectedPembayaran.id, {
        status: selectedPembayaran.status ?? "",
      });
      setPembayaranList((prev) =>
        prev.map((pembayaran) =>
          pembayaran.id === updated.id ? updated : pembayaran,
        ),
      );
      closeEditModal();
      fetchPembayaran();
    } catch (error) {
      console.log("Gagal menyimpan perubahan pembayaran ==", error);
    }
  };
  const handleAddNewPay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
       await addPembayaran({
        code: newPembayaran.code,
        status: newPembayaran.status,
        studentId: newPembayaran.studentId,
      });
      setNewPembayaran(initialPembayaranState);
      closeEditModal();
      fetchPembayaran();
    } catch (error) {
      console.error("Error adding pembayaran:", error);
    }
  };

  const studentOptions = mahasiswaList.map((m) => ({
    value: m.id,
    label: m.name,
  }));
  const statusOptions = [
    { value: "PAID", label: "PAID" },
    { value: "UNPAID", label: "UNPAID" },
  ];

  const handleNewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewPembayaran((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="section">
      <div className="section-header">
        <h1>Pembayaran</h1>
      </div>

      <div className="section-body">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseEditMatkul"
                >
                  Tambah Mata Kuliah
                </button>
                <div className="collapse" id="collapseEditMatkul">
                  <div className="card card-body">
                    <AddForm
                      onSubmit={handleAddNewPay}
                      collapseTargetId="collapseEditMatkul"
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Mahasiswa",
                          name: "studentId",
                          type: "select", //Atur type menjadi 'text'
                          value: newPembayaran.studentId,
                          options: studentOptions,
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewChange(e),
                        },
                        {
                          label: "Kode Pembayaran",
                          name: "code",
                          type: "text",
                          value: newPembayaran.code,
                          placeholder: "Masukkan Kode Pembayaran",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewChange(e),
                        },
                        {
                          label: "Status Pembayaran",
                          name: "status",
                          type: "select",
                          value: newPembayaran.status,
                          options: statusOptions,
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewChange(e),
                        },
                      ]}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped" id="table-1">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>NIM</th>
                        <th>Kode Pembayaran</th>
                        <th>Golongan</th>
                        <th>Tahun Ajaran</th>
                        <th>Status</th>
                        <th>Dibuat Pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pembayaranList.map((p, index) => (
                        <tr key={p.id}>
                          <td>{index + 1}</td>
                          <td>{p.student?.name ?? "-"}</td>
                          <td>{p.student?.studentNumber ?? "-"}</td>
                          <td>{p.code ?? "-"}</td>
                          <td>{p.student?.tfGroup?.group ?? "-"}</td>
                          <td>{p.student?.class?.year?.name ?? "-"}</td>
                          <td>
                            <span
                              className={`badge badge-${
                                p.status === "PAID"
                                  ? "success"
                                  : p.status === "UNPAID"
                                    ? "danger"
                                    : p.status === "PENDING"
                                      ? "warning"
                                      : "secondary"
                              }`}
                            >
                              {p.status ?? "UNPAID"}
                            </span>
                          </td>
                          <td>
                            {new Date(p.createdAt).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                openEditModal(p);
                              }}
                              className="btn btn-icon btn-primary"
                              id="modal-1"
                            >
                              <i className="fa fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editModalLabel">
                  Edit Pembayaran
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={closeEditModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveUpdate}>
                  <div className="form-group">
                    <label>Nama</label>
                    <input
                      className="form-control"
                      name="name"
                      value={selectedPembayaran.student?.name ?? ""}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>NIM</label>
                    <input
                      className="form-control"
                      name="studentNumber"
                      value={selectedPembayaran.student?.studentNumber ?? ""}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Kode Pembayaran</label>
                    <input
                      className="form-control"
                      name="code"
                      value={selectedPembayaran.code}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Golongan</label>
                    <input
                      className="form-control"
                      name="classId"
                      value={selectedPembayaran.student?.tfGroup?.group ?? ""}
                      readOnly
                    ></input>
                  </div>
                  <div className="form-group">
                    <label>Tahun Ajaran</label>
                    <input
                      className="form-control"
                      name="year"
                      value={
                        selectedPembayaran.student?.class?.year?.name ?? ""
                      }
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="d-block">Status Pembayaran</label>
                    <label className="custom-switch mt-2">
                      <input
                        type="checkbox"
                        name="status"
                        className="custom-switch-input"
                        checked={selectedPembayaran.status === "PAID"}
                        onChange={(e) =>
                          setSelectedPembayaran((prev) => ({
                            ...prev,
                            status: e.target.checked ? "PAID" : "UNPAID",
                          }))
                        }
                      />
                      <span className="custom-switch-indicator"></span>
                      <span className="custom-switch-description font-weight-bold">
                        {selectedPembayaran.status === "PAID" ? (
                          <span className="text-success">PAID</span>
                        ) : (
                          <span className="text-danger">UNPAID</span>
                        )}
                      </span>
                    </label>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                      onClick={closeEditModal}
                    >
                      Tutup
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PembayaranPage;
