"use client";
import React, { useState, useEffect } from "react";
import api from "@/app/lib/axiosInstance";

interface Mahasiswa {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  semester: number;
  classOf: number;
  tfGroupId: string;
  tfGroup?: GolUkt;
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
interface GolUkt {
  id: string;
  group: string;
}
interface Kelas {
  id: string;
  name: string;
  major: Prodi;
}

//API services
const getGolUkt = async () => {
  const res = await api.get("/tf-groups");
  return res.data.data;
};
const getKelas = async () => {
  const res = await api.get("/class");
  return res.data.data;
};
const getMahasiswa = async () => {
  const res = await api.get("/students");
  return res.data.data;
};
const addMahasiswa = async (data: {
  name: string;
  email: string;
  semester: number;
  classOf: number;
  tfGroupId: string;
  classId: string;
}) => {
  const res = await api.post("/students", data);
  return res.data;
};
const updateMahasiswa = async (
  id: string,
  data: {
    name: string;
    email: string;
    semester: number;
    classOf: number;
    tfGroupId: string;
    classId: string;
  },
) => {
  const res = await api.put(`/students/${id}`, data);
  return res.data;
};
const deleteMahasiswa = async (id: string) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
}
const MahasiswaPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Partial<Mahasiswa>>({});
  const [newMahasiswa, setNewMahasiswa] = useState({
    name: "",
    email: "",
    semester: 0,
    classOf: 0,
    tfGroupId: "",
    classId: "",
  });
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [golUktList, setGolUktList] = useState<GolUkt[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);


  const fetchMahasiswa = async () => {
    try {
      const data = await getMahasiswa();
      setMahasiswaList(data);
    } catch (error) {
      console.error("Error fetching mahasiswa:", error);
    }
  }
  const fetchGolUkt = async () => {
    try {
      const data = await getGolUkt();
      setGolUktList(data);
    } catch (error) {
      console.error("Error fetching gol ukt:", error);
    }
  }
  const fetchKelas = async () => {
    try {
      const data = await getKelas();
      setKelasList(data);
    } catch (error) {
      console.error("Error fetching kelas:", error);
    }
  }
  //ambil data awal 
  useEffect(() => {
    fetchMahasiswa();
    fetchGolUkt();
    fetchKelas();
  }, [])

  const openEditModal = (mahasiswa: Mahasiswa) => {
    setSelectedMahasiswa(mahasiswa);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedMahasiswa({});
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedMahasiswa((prev) => ({ ...prev, [name]: value }));
  }
  const handleNewMahasiswaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMahasiswa((prev) => ({ ...prev, [name]: value }));
  }

  //untuk simpan perubahan di modal
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMahasiswa.id) return;
    try {
      const updated = await updateMahasiswa(selectedMahasiswa.id, {
        name: selectedMahasiswa.name ?? '',
        email: selectedMahasiswa.email ?? '',
        semester: selectedMahasiswa.semester ?? 0,
        classOf: selectedMahasiswa.classOf ?? 0,
        tfGroupId: selectedMahasiswa.tfGroupId ?? '',
        classId: selectedMahasiswa.classId ?? '',
      });
      setMahasiswaList((prev) =>
        prev.map((mahasiswa) => (mahasiswa.id === updated.id ? updated : mahasiswa)),
      );
      closeEditModal();
      fetchMahasiswa();
    } catch (error) {
      console.log ("Gagal menyimpan perubahan mahasiswa ==",error);
    }
  };

  const handleAddNewMahasiswa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await addMahasiswa(newMahasiswa);
      setMahasiswaList((prev) => [...prev, res]);
      setNewMahasiswa({ name: "", email: "", semester: 0, classOf: 0, tfGroupId: "", classId: "" });
      closeEditModal();
      fetchMahasiswa();
    } catch (error) {
      console.log ("Gagal menyimpan mahasiswa baru ==",error);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteMahasiswa(id);
      setMahasiswaList((prev) => prev.filter((m) => m.id !== id));
    } catch (err:any) {
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
        alert("Tidak dapat menghapus data karena masih terhubung dengan data lain");
      } 
      // 2. Jaring pengaman jika backend crash / Error 500
      else if (errorStatus === 500) {
        alert("Terjadi kesalahan pada server (Internal Server Error 500). Mohon periksa log backend Anda.");
      } 
      // 3. Error umum lainnya
      else {
        const pesanError = errorData?.message || err.message || "Unknown error";
        alert("Terjadi kesalahan saat menghapus data: " + pesanError);
      }
    }
  }
  return (
    <section className="section">
      <div className="section-header">
        <h1>Pengguna</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Pengguna</div>
          <div className="breadcrumb-item">
            <a href="../pengguna/mahasiswa.html">Pengguna</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Mahasiswa</h2>
        <p className="section-lead">
          Menampilkan semua data Mahasiswa yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseEditMahasiswa"
                >
                  Tambah Mahasiswa
                </button>
                <div className="collapse" id="collapseEditMahasiswa">
                  <div className="card card-body">
                    <form action="#" method="POST"
                    onSubmit={handleAddNewMahasiswa}
                    >
                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Nama</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Nama"
                            value={newMahasiswa.name}
                           onChange={handleNewMahasiswaChange}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            placeholder="Email"
                            value={newMahasiswa.email}
                            onChange={handleNewMahasiswaChange}
                          />
                        </div>
                        <div className="form-group col-md-3">
                          <label>Semester</label>
                          <input
                            type="number"
                            className="form-control"
                            name="semester"
                            placeholder="Semester"
                            value ={newMahasiswa.semester}
                            onChange={handleNewMahasiswaChange}
                          />
                        </div>
                        <div className="form-group col-md-3">
                          <label>Angkatan</label>
                          <input
                            type="number"
                            className="form-control"
                            name="classOf"
                            placeholder="Angkatan"
                            value ={newMahasiswa.classOf}
                            onChange={handleNewMahasiswaChange}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Kelas</label>
                          <select 
                          className ="form-control"
                          name="classId"
                          value={newMahasiswa.classId}
                          onChange={handleNewMahasiswaChange}
                          >
                          <option>--Pilih Kelas--</option>
                          {kelasList.map((kelas) => (
                            <option key={kelas.id} value={kelas.id}>
                              {kelas.name} ({kelas.major.name})
                            </option>
                          ))}
                          </select>
                        </div>
                        <div className="form-group col-md-6">
                          <label>Golongan UKT</label>
                          <select
                            className="form-control"
                            name="tfGroupId"
                            value={newMahasiswa.tfGroupId}
                            onChange={handleNewMahasiswaChange}
                          >
                            <option>--Pilih Golongan UKT--</option>
                            {golUktList.map((tfGroup) => (
                              <option key={tfGroup.id} value={tfGroup.id}>
                                {tfGroup.group}
                              </option>
                            ))}
                            
                          </select>
                        </div>
                     
                      </div>
                      <div className="mt-3">
                        <button type="submit" className="btn btn-primary">
                          Simpan
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
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
                        <th>Kelas</th>
                        <th>Golongan UKT</th>
                        <th>NIM</th>
                        <th>Semester</th>
                        <th>Angkatan</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mahasiswaList.map((mahasiswa, index) => (
                        <tr key={mahasiswa.id}>
                        <td>{index + 1}</td>
                        <td>{mahasiswa.name}</td>
                        <td>{mahasiswa.email}</td>
                        <td>{mahasiswa.class?.major?.faculty?.name}</td>
                        <td>{mahasiswa.class?.major?.name}</td>
                        <td>{mahasiswa.class?.name}</td>
                        <td>{mahasiswa.tfGroup?.group}</td>
                        <td>{mahasiswa.studentNumber}</td>
                        <td>{mahasiswa.semester}</td>
                        <td>{mahasiswa.classOf}</td>
                        <td>{
                          new Date(mahasiswa.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                          }</td>
                        
                        <td>
                          <button
                            className="btn btn-icon btn-primary"
                             onClick={(e) => {
                                e.preventDefault();
                                openEditModal(mahasiswa);
                              }}
                          >
                            <i className="far fa-edit"></i>
                          </button>
                          <a href="#" className="btn btn-icon btn-danger"
                           onClick={(e) => {
                                e.preventDefault();
                                handleDelete(mahasiswa.id);
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
          className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
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
                    <label>Nama</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={selectedMahasiswa.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={selectedMahasiswa.email}
                      onChange={handleInputChange}
                    />
                  </div>
                
                   <div className="form-group">
                    <label>Semester</label>
                    <input
                      type="number"
                      className="form-control"
                      name="semester"
                      value={selectedMahasiswa.semester}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kelas</label>
                      <select 
                        className ="form-control"
                        name="classId"
                        value={selectedMahasiswa.classId}
                        onChange={handleInputChange}
                        >
                        <option>--Pilih Kelas--</option>
                        {kelasList.map((kelas) => (
                          <option key={kelas.id} value={kelas.id}>
                            {kelas.name} ({kelas.major.name})
                          </option>
                        ))}
                     </select>
                  </div>
                  <div className="form-group">
                    <label>Angkatan</label>
                    <input
                      type="number"
                      className="form-control"
                      name="classOf"
                      value={selectedMahasiswa.classOf}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                     <label>Golongan UKT</label>
                        <select
                          className="form-control"
                          name="tfGroupId"
                          value={selectedMahasiswa.tfGroupId}
                          onChange={handleInputChange}
                          >
                          <option>--Pilih Golongan UKT--</option>
                          {golUktList.map((tfGroup) => (
                          <option key={tfGroup.id} value={tfGroup.id}>
                            {tfGroup.group}
                          </option>
                          ))}
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

export default MahasiswaPage;
