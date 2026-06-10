"use client";
import React, { useState, useEffect } from "react";
import api from "@/app/lib/axiosInstance";

interface Fakultas {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updateAt: string;
}
interface Prodi {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  faculty?: Fakultas;
  createdAt: string;
}
interface Dosen {
  faculty: any;
  id: string;
  name: string;
  email: string;
  lectureNumber: number;
  position: string;
  majorId: string;
  major?: Prodi & { faculty?: Fakultas };
  createdAt: string;
  updateAt: string;
}

//start of API Services
const getDosen = async () => {
  const response = await api.get("/lecture");
  return response.data.data;
};

const getProdis = async () => {
  const response = await api.get("/majors");
  return response.data.data;
};

const addDosen = async (data: {
  name: string;
  email: string;
  lectureNumber: number;
  position: string;
  majorId: string;
}) => {
  const response = await api.post("/lecture", data);
  return response.data;
};

const updateDosen = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    lectureNumber?: number;
    position?: string;
    majorId?: string;
  },
) => {
  const response = await api.put(`/lecture/${id}`, data);
  return response.data;
};

const deleteDosen = async (id: string) => {
  const response = await api.delete(`/lecture/${id}`);
  return response.data;
};
// end of API Services
const DosenPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState<Partial<Dosen>>({});
  const [newDosen, setNewDosen] = useState({
    name: "",
    email: "",
    lectureNumber: 0,
    position: "",
    majorId: "",
  });
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);

  const fetchDosen = async () => {
    try {
      const data = await getDosen();
      setDosenList(data);
    } catch (error) {
      console.log("Gagal mengambil data dosen ==", error);
    }
  };

  const fetchProdis = async () => {
    try {
      const data = await getProdis();
      setProdiList(data);
    } catch (error) {
      console.log("Gagal mengambil data prodi ==", error);
    }
  };

  useEffect(() => {
    fetchDosen();
    fetchProdis();
  }, []);

  const openEditModal = (dosen: Dosen) => {
    setSelectedDosen(dosen);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedDosen({});
    setIsEditModalOpen(false);
  };

  const handleAddNewDosen = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const saved = await addDosen(newDosen);
      setDosenList((prev) => [...prev, saved]);
      setNewDosen({
        name: "",
        email: "",
        lectureNumber: 0,
        position: "",
        majorId: "",
      });
      fetchDosen();
    } catch (error) {
      console.error("Gagal menambahkan dosen ==", error);
    }
  };

  const handleNewDosenChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewDosen((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedDosen((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!selectedDosen.id) return;
    try {
      const updated = await updateDosen(selectedDosen.id, {
        name: selectedDosen.name,
        email: selectedDosen.email,
        lectureNumber: selectedDosen.lectureNumber,
        position: selectedDosen.position,
        majorId: selectedDosen.majorId,
      });
      setDosenList((prev) =>
        prev.map((dosen) => (dosen.id === updated.id ? updated : dosen)),
      );
      closeEditModal();
      fetchDosen();
    } catch (error) {
      console.log ("Gagal menyimpan perubahan dosen ==",error);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteDosen(id);
      setDosenList((prev) => prev.filter((dosen) => dosen.id !== id));
      alert("Data dosen berhasil dihapus!");
      fetchDosen();
    } catch (error: any) {
      //cek error nya apakah karena  forekey constraint
      const errorData = error.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
      if (errorData?.code === "P2003") {
        alert(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
        );
        console.log("Gagal menghapus dosen ==", errorString);
        console.log("Gagal menghapus dosen ==", errorData);
      }
    }
  };
  return (
    <section className="section">
      <div className="section-header">
        <h1>Pengguna</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Pengguna</div>
          <div className="breadcrumb-item">
            <a href="../pengguna/dosen.html">Dosen</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Dosen</h2>
        <p className="section-lead">
          Menampilkan semua data Dosen yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseEditDosen"
                >
                  Tambah Dosen
                </button>
                <div className="collapse" id="collapseEditDosen">
                  <div className="card card-body">
                    <form onSubmit={handleAddNewDosen} method="POST">
                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Nama</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Masukan Nama Dosen"
                            value={newDosen.name}
                            onChange={handleNewDosenChange}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            placeholder="Masukan Email Dosen"
                            value={newDosen.email}
                            onChange={handleNewDosenChange}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Program Studi</label>
                          <select
                            className="form-control"
                            name="majorId"
                            value={newDosen.majorId}
                            onChange={handleNewDosenChange}
                          >
                            <option value="">---Pilih Prodi---</option>
                            {prodiList.map((prodi) => (
                              <option key={prodi.id} value={prodi.id}>
                                {prodi.name} ({prodi.faculty?.name})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group col-md-6">
                          <label>NIP</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lectureNumber"
                            value={newDosen.lectureNumber}
                            onChange={handleNewDosenChange}
                          />
                        </div>
                        <div className="form-group col-md-3">
                          <label>Jabatan</label>
                          <input
                            type="text"
                            className="form-control"
                            name="position"
                            placeholder="Masukan Jabatan Dosen"
                            value={newDosen.position}
                            onChange={handleNewDosenChange}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <button type="submit" className="btn btn-primary">
                          Simpan
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          data-toggle="collapse"
                          data-target="#collapseEditMahasiswa"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped" id="table-1">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Fakultas</th>
                        <th>Program Studi</th>
                        <th>NIP</th>
                        <th>Jabatan</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Data dummy, bisa diganti dengan map dari state/props */}
                      {dosenList.map((dosen, index) => (
                        <tr key={dosen.id ?? `new-${index}`}>
                          <td>{index + 1}</td>
                          <td>{dosen.name}</td>
                          <td>{dosen.email}</td>
                          <td>{dosen.major?.faculty?.name}</td>
                          <td>{dosen.major?.name}</td>
                          <td>{dosen.lectureNumber}</td>
                          <td>{dosen.position}</td>
                          <td>
                            {new Date(dosen.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            <a
                              href="#"
                              className="btn btn-icon btn-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                openEditModal(dosen);
                              }}
                            >
                              <i className="far fa-edit"></i>
                            </a>
                            <a
                              href="#"
                              className="btn btn-icon btn-danger"
                              onClick={() => handleDelete(dosen.id)}
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
      {isEditModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Program Dosen</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={closeEditModal}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nama Dosen</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={selectedDosen.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Dosen</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={selectedDosen.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Program studi</label>
                    <select
                      className="form-control"
                      name="majorId"
                      value={selectedDosen.majorId}
                      onChange={handleInputChange}
                      required
                    >
                      <option>---Pilih Program Studi---</option>
                      {prodiList.map((prodi) => (
                        <option key={prodi.id} value={prodi.id}>
                          {prodi.name} ({prodi.faculty?.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>NIP</label>
                    <input
                      type="number"
                      name="lectureNumber"
                      className="form-control"
                      value={selectedDosen.lectureNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Jabatan</label>
                    <input
                      type="text"
                      name="position"
                      className="form-control"
                      value={selectedDosen.position}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={closeEditModal}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DosenPage;
