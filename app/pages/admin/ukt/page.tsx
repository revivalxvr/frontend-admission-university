"use client";
import React, { useState, useEffect } from "react";
// import MyBarChart from '../../../components/myBarChart';
import api from "@/app/lib/axiosInstance";

interface Mahasiswa {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  semester: number;
  classOf: number;
  classId: string;
  class?: Kelas;
  createdAt: string;
}
interface Fakultas {
  id: string;
  name: string;
}
interface Prodi {
  id: string;
  name: string;
  faculty: Fakultas;
}
interface Kelas {
  id: string;
  name: string;
  major: Prodi;
  majorId: string;
}
interface GolUkt {
  id: string;
  studentId: string;
  status: string;
  student: Mahasiswa;
  createdAt: string;
}

//API services
const getMahasiswa = async () => {
  const res = await api.get("/students");
  return res.data.data;
};
const getProdi = async () => {
  const res = await api.get("/majors");
  return res.data.data;
};
const getUkt = async () => {
  const res = await api.get("/tuition-fees");
  return res.data.data;
};
const addUkt = async (data: { studentId: string; status: string }) => {
  const res = await api.post("/tuition-fees", data);
  return res.data;
};
const updateUkt = async (
  id: string,
  data: { studentId: string; status: string },
) => {
  const res = await api.put(`/tuition-fees/${id}`, data);
  return res.data;
};
const deleteUkt = async (id: string) => {
  const res = await api.delete(`/tuition-fees/${id}`);
  return res.data;
};
// end of API services

const UKTPage = () => {
  //buat state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUkt, setSelectedUkt] = useState<Partial<GolUkt>>({});

  const [uktList, setUktList] = useState<GolUkt[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);

  const [newUkt, setNewUkt] = useState({
    studentId: "",
    status: "",
  });
  //end of state

  //ambil data awal menggunakan useEffect
  useEffect(() => {
    fetchMahasiswa();
    fetchUkt();
    fetchProdi();
  }, []);

  const fetchMahasiswa = async () => {
    try {
      const data = await getMahasiswa();
      setMahasiswaList(data);
    } catch (error) {
      console.error("Error fetching mahasiswa:", error);
    }
  };
  const fetchUkt = async () => {
    try {
      const data = await getUkt();
      setUktList(data);
    } catch (error) {
      console.error("Error fetching ukt:", error);
    }
  };
  const fetchProdi = async () => {
    try {
      const data = await getProdi();
      setProdiList(data);
    } catch (error) {
      console.error("Error fetching prodi:", error);
    }
  };
  //end of ambil data awal

  const getProdiAndFakultas = (majorId: string) => {
    const res = prodiList.find((m) => m.id === majorId);
    if (!res)
      return {
        fakultas: "",
        prodi: "",
      };
    return {
      majorName: res.name,
      facultyName: res.faculty?.name || "-",
    };
  };

  const handAddNewUkt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await addUkt(newUkt);
      setUktList((prev) => [...prev, res]);
      setNewUkt({ studentId: "", status: "" });
      fetchUkt();
    } catch (error) {
      console.error("Gagal menambahkan ukt ==", error);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUkt.id) return;
    try {
      const updated = await updateUkt(selectedUkt.id, {
        studentId: selectedUkt.studentId ?? "",
        status: selectedUkt.status ?? "",
      });
      setUktList((prev) =>
        prev.map((ukt) => (ukt.id === updated.id ? updated : ukt)),
      );
      closeEditModal();
      fetchUkt();
    } catch (error) {
      console.log("Gagal menyimpan perubahan ukt ==", error);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteUkt(id);
      setUktList((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error("Gagal delete kelas:", err);

      const errorData = err.response?.data;
      const errorStatus = err.response?.status; // Mengambil status code (misal: 500)
      const errorString = JSON.stringify(errorData || "").toLowerCase();

      // 1. Cek jika disebabkan oleh Foreign Key Constraint (Prisma P2003)
      if (
        errorData?.code === "P2003" ||
        errorString.includes("foreign key") ||
        errorString.includes("constraint")
      ) {
        alert(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
        );
      }
      // 2. Jaring pengaman jika backend crash / Error 500
      else if (errorStatus === 500) {
        alert(
          "Terjadi kesalahan pada server (Internal Server Error 500). Mohon periksa log backend Anda.",
        );
      }
      // 3. Error umum lainnya
      else {
        const pesanError = errorData?.message || err.message || "Unknown error";
        alert("Terjadi kesalahan saat menghapus data: " + pesanError);
      }
    }
  };

  const handleNewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewUkt((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedUkt((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (ukt: GolUkt) => {
    setSelectedUkt(ukt);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedUkt({});
    setIsEditModalOpen(false);
  };
  return (
    <section className="section">
      <div className="section-header">
        <h1>Pembayaran</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Pembayaran</div>
          <div className="breadcrumb-item">
            <a href="../pembayaran/ukt.html">Uang Kuliah Tunggal</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">UKT</h2>
        <p className="section-lead">
          Menampilkan semua data UKT yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseEditUKT"
                >
                  Tambah UKT
                </button>
                <div className="collapse" id="collapseEditUKT">
                  <div className="card card-body">
                    <form onSubmit={handAddNewUkt}>
                      <div className="form-group">
                        <label htmlFor="nama">Nama</label>
                        <select
                          className="form-control"
                          id="nama"
                          name="studentId"
                          value={newUkt.studentId}
                          onChange={handleNewChange}
                          required
                        >
                          <option value="">-- Pilih Mahasiswa --</option>
                          {mahasiswaList.map((mhs) => (
                            <option key={mhs.id} value={mhs.id}>
                              {mhs.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          className="form-control"
                          id="status"
                          name="status"
                          value={newUkt.status}
                          onChange={handleNewChange}
                          required
                          >
                          <option value="">-- Pilih Status --</option>
                          <option value="Lunas">Lunas</option>
                          <option value="Belum Lunas">Belum Lunas</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Simpan
                      </button>
                    </form>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped" id="table-1">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fakultas</th>
                        <th>Program Studi</th>
                        <th>Nama</th>
                        <th>NIM</th>
                        <th>Semester</th>
                        <th>Status</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uktList.map((ukt, index) => (
                        <tr key={ukt.id}>
                          <td>{index + 1}</td>
                          <td>
                            {
                              getProdiAndFakultas(
                                ukt.student?.class?.majorId || "",
                              ).facultyName
                            }
                          </td>
                          <td>
                            {
                              getProdiAndFakultas(
                                ukt.student?.class?.majorId || "",
                              ).majorName
                            }
                          </td>
                          <td>{ukt.student?.name || "-"}</td>
                          <td>{ukt.student?.studentNumber || "-"}</td>
                          <td>{ukt.student?.semester}</td>
                          <td>{ukt.status}</td>
                          <td>
                            {new Date(ukt.createdAt).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td>
                            <a
                              href="#"
                              className="btn btn-icon btn-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                openEditModal(ukt);
                              }}
                            >
                              <i className="far fa-edit"></i>
                            </a>
                            <a
                              href="#"
                              className="btn btn-icon btn-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(ukt.id);
                              }}
                            >
                              <i className="fa fa-trash"></i>
                            </a>
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
                  Edit Mahasiswa
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
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label htmlFor="name">Nama Mahasiswa</label>
                    <input
                      className="form-control"
                      id="name"
                      value={selectedUkt.student?.name}
                      readOnly
                   />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={selectedUkt.status}
                      onChange={handleInputChange}
                      required
                    > 
                        <option value="">-- Pilih Status --</option>
                        <option value="Lunas">Lunas</option>
                        <option value="Belum Lunas">Belum Lunas</option>
                    </select>
                   
                   
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
                      Simpan
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

export default UKTPage;
