"use client";
import React, { useState, useEffect } from "react";
// import MyBarChart from '../../../components/myBarChart';
import api from "@/app/lib/axiosInstance";

interface Matkul {
  id: string;
  name: string;
  code: string;
  lectureId: string;
  credits: number;
  lecture: Dosen;
  createdAt: string;
}
interface Dosen {
  id: string;
  name: string;
  major: Prodi;
}
interface Prodi {
  id: string;
  name: string;
  faculty: Fakultas;
}
interface Fakultas {
  id: string;
  name: string;
}

//API service
const getDosen = async () => {
  const response = await api.get("/lecture");
  return response.data.data;
};
const getMatkul = async () => {
  const response = await api.get("/courses");
  return response.data.data;
};
const addMatkul = async (data: {
  name: string;
  code: string;
  lectureId: string;
  credits: number;
}) => {
  const response = await api.post("/courses", data);
  return response.data;
};
const updateMatkul = async (
  id: string,
  data: {
    name: string;
    code: string;
    lectureId: string;
    credits: number;
  },
) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};
const deleteMatkul = async (id: string) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

//end of API services
const MatkulPage = () => {
  //buat state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedMatkul, setSelectedMatkul] = useState<Partial<Matkul>>({});

  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);

  const [newMatkul, setNewMatkul] = useState({
    name: "",
    code: "",
    lectureId: "",
    credits: 0,
  });
  //end of state

  //ambil data awal menggunakan useEffect
  useEffect(() => {
    fetchMatkul();
    fetchDosen();
  }, []);

  const fetchMatkul = async () => {
    try {
      const data = await getMatkul();
      setMatkulList(data);
    } catch (error) {
      console.log("Gagal mengambil data matkul ==", error);
    }
  };
  const fetchDosen = async () => {
    try {
      const data = await getDosen();
      setDosenList(data);
    } catch (error) {
      console.log("Gagal mengambil data dosen ==", error);
    }
  };

  const handleAdldNewMatkul = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await addMatkul(newMatkul);
      setMatkulList((prev) => [...prev, res]);
      setNewMatkul({ name: "", code: "", lectureId: "", credits: 0 });
      // closeEditModal();
      fetchMatkul();
    } catch (error) {
      console.log("Gagal menambahkan matkul ==", error);
    }
  };

  const handleNewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewMatkul((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedMatkul((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMatkul.id) return;
    try {
      const res = await updateMatkul(selectedMatkul.id, {
        name: selectedMatkul.name ?? '',
        code: selectedMatkul.code ?? '',
        lectureId: selectedMatkul.lectureId ?? '',
        credits: selectedMatkul.credits ?? 0,
      });
      setMatkulList((prev) =>
        prev.map((matkul) => (matkul.id === res.id ? res : matkul)),
      );
      closeEditModal();
      fetchMatkul();
    } catch (error) {
      console.log("Gagal mengupdate matkul ==", error);
    }
  };
  const openEditModal = (matkul: Matkul) => {
    setSelectedMatkul(matkul);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedMatkul({});
    setIsEditModalOpen(false);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteMatkul(id);
      setDosenList((prev) => prev.filter((dosen) => dosen.id !== id));
      alert("Data matkul berhasil dihapus!");
      fetchMatkul();
    } catch (error: any) {
      //cek error nya apakah karena  forekey constraint
      const errorData = error.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
      if (errorData?.code === "P2003") {
        alert(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
        );
        console.log("Gagal menghapus matkul ==", errorString);
        console.log("Gagal menghapus matkul ==", errorData);
      }
    }
  };
  return (
    <section className="section">
      <div className="section-header">
        <h1>Akademik</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Akademik</div>
          <div className="breadcrumb-item">
            <a href="/admin/akademik/matkul">Mata Kuliah</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Mata Kuliah</h2>
        <p className="section-lead">
          Menampilkan semua data Mata Kuliah yang ada pada universitas ini
        </p>
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
                    <form onSubmit={handleAdldNewMatkul}>
                      <div className="form-group">
                        <label>Dosen</label>
                        <select
                          className="form-control"
                          onChange={handleNewChange}
                          value={newMatkul.lectureId}
                          name="lectureId"
                          required
                        >
                          <option value="">Pilih Dosen</option>
                          {dosenList.map((dosen) => (
                            <option key={dosen.id} value={dosen.id}>
                              {dosen.name} ({dosen.major?.name}) & (
                              {dosen.major.faculty.name})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nama Mata Kuliah</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nama Mata Kuliah"
                          name="name"
                          onChange={handleNewChange}
                          value={newMatkul.name}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Kode Mata Kuliah</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Kode Mata Kuliah"
                          name="code"
                          onChange={handleNewChange}
                          value={newMatkul.code}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Total SKS</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Total SKS"
                          name="credits"
                          onChange={handleNewChange}
                          value={newMatkul.credits}
                          required
                        />
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
                        <th>Dosen</th>
                        <th>Kode Mata Kuliah</th>
                        <th>Nama</th>
                        <th>Total SKS</th>
                        <th>Dibuat Pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matkulList.map((matkul, index) => (
                        <tr key={matkul.id}>
                          <td>{index + 1}</td>
                          <td>{matkul.lecture?.major?.faculty?.name ?? "-"}</td>
                          <td>{matkul.lecture?.major?.name ?? "-"}</td>
                          <td>{matkul.lecture?.name ?? "-"}</td>
                          <td>{matkul.code}</td>
                          <td>{matkul.name}</td>
                          <td>{matkul.credits}</td>
                          <td>
                            {new Date(matkul.createdAt).toLocaleString(
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
                                openEditModal(matkul);
                              }}
                            >
                              <i className="far fa-edit"></i>
                            </a>
                            <a
                              href="#"
                              className="btn btn-icon btn-danger"
                              onClick={() => handleDelete(matkul.id)}
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
              <form onSubmit={handleSaveEdit}>
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
                    <label>Dosen</label>
                    <select
                      className="form-control"
                      onChange={handleInputChange}
                      value={selectedMatkul.lectureId}
                      name="lectureId"
                      required
                    >
                      <option value="">Pilih Dosen</option>
                      {dosenList.map((dosen) => (
                        <option key={dosen.id} value={dosen.id}>
                          {dosen.name} ({dosen.major?.name}) & (
                          {dosen.major.faculty.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nama Mata Kuliah</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={selectedMatkul.name}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="form-group">
                      <label>Code Mata Kuliah</label>
                      <input
                        type="text"
                        name="code"
                        className="form-control"
                        value={selectedMatkul.code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>SKS</label>
                    <input
                      type="number"
                      name="credits"
                      className="form-control"
                      value={selectedMatkul.credits}
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

export default MatkulPage;
