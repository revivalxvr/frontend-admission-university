"use client";
import React, { useState, useEffect } from "react";
import api from "@/app/lib/axiosInstance";

interface Kelas {
  id: string;
  name: string;
  majorId: string;
  major?: Prodi;
  yearId: string;
  year?: TahunAjaran;
  createdAt: string;
}

interface Prodi {
  id: string;
  name: string;
  code: string;
  facultyId: string;
}
interface TahunAjaran {
  id: string;
  name: string;
  dateStart: string;
  dateEnd: string;
  status: boolean;
}

//API services
const getClass = async () => {
  const res = await api.get("/class"); //done
  return res.data.data;
};

const getProdi = async () => {
  const res = await api.get("/majors"); //done
  return res.data.data;
};
const getTahunAjaran = async () => {
  const res = await api.get("/years");  //done
  return res.data.data;
};

const addClass = async (data: {
  name: string;
  majorId: string;
  yearId: string;
}) => {
  const res = await api.post("/class", data); 
  return res.data;
};

const updateClass = async (
  id: string,
  data: { name: string; majorId: string; yearId: string },
) => {
  const res = await api.put(`/class/${id}`, data);
  return res.data;
};

const deleteClass = async (id: string) => {
  const res = await api.delete(`/class/${id}`);
  return res.data;
};

const KelasPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<Partial<Kelas>>({});
  const [newClass, setNewClass] = useState({
    name: "",
    majorId: "",
    yearId: "",
  });
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [faculties, setFaculties] = useState<{ [key: string]: string }>({});
 
//ambil data awal
useEffect(() => {
  fetchKelas();
  fetchProdi();
  fetchFaculties();
  fetchTahunAjaran();
 
}, [])

const fetchProdi = async () => {
  try {
    const data = await getProdi();
    setProdiList(data);
  } catch (error) {
    console.error("Error fetching prodi:", error);
  }
}

const fetchKelas = async () => {
  try {
    const data = await getClass();
    setKelasList(data);
  } catch (error) {
    console.error("Error fetching kelas:", error);
  }
}

const fetchTahunAjaran = async () => {
  try {
    const data = await getTahunAjaran();
    setTahunAjaranList(data);
  } catch (error) {
    console.error("Error fetching tahun ajaran:", error);
  }
}

const fetchFaculties = async () => {
  try {
    const res = await api.get('/faculties');
    const data = res.data.data;
    //bikin map facultyId -> facultyName
    const map: { [key: string]: string } = {};
    data.forEach((faculty: any) => {
      map[faculty.id] = faculty.name;
    });
    setFaculties(map);
  } catch (error) {
    console.error("Error fetching tahun fakultas:", error);
  }
}
const openEditModal = (kelas : Kelas) => {
  setSelectedKelas(kelas);
  setIsEditModalOpen(true);
}
const closeEditModal = () => {
  setIsEditModalOpen(false);
  setSelectedKelas({});
}

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setSelectedKelas((prev) => ({ ...prev, [name]: value }));
}
const handleNewkelasChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewClass((prev) => ({ ...prev, [name]: value }));
  
}

const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if(!selectedKelas.id) return;
  try {
    const updated = await updateClass(selectedKelas.id, {
      name: selectedKelas.name ?? "",
      majorId: selectedKelas?.majorId ?? "",
      yearId: selectedKelas?.yearId ?? "",
    })
    setKelasList((prev) =>
      prev.map((kelas) => (kelas.id === updated.id ? updated : kelas)),
    );
    closeEditModal();
    fetchKelas();
  } catch (error) {
    console.log ("Gagal menyimpan perubahan kelas ==",error);
  }
}
const handleAddNewKelas = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const addKelas = await addClass(newClass);
    setKelasList((prev) => [...prev, addKelas]);
    setNewClass({ name: "", majorId: "", yearId: "" });
    closeEditModal();
    fetchKelas();
  } catch (error) {
    console.log ("Gagal menyimpan kelas baru ==",error);
  }
}
const handleDelete = async (id: string) => {
if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteClass(id);
      setKelasList((prev) => prev.filter((k) => k.id !== id));
    } catch (err : any) {
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
        <h1>Master</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Master</div>
          <div className="breadcrumb-item">
            <a href="../master/kelas.html">Kelas</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Kelas</h2>
        <p className="section-lead">
          Menampilkan semua data Kelas yang ada pada universitas ini
        </p>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseEditKelas"
                >
                  Tambah Kelas
                </button>
                <div className="collapse" id="collapseEditKelas">
                  <div className="card card-body">
                    <form onSubmit={handleAddNewKelas}>
                      <div className="form-group">
                        <label>Nama Program Studi</label>
                        <select
                          className="form-control"
                          name = "majorId"
                          value={newClass.majorId}
                          onChange={handleNewkelasChange}
                          required
                        >
                          <option value="">-- Pilih Program studi --</option>
                          {prodiList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                    </select>
                      </div>
                      <div className="form-group">
                        <label>Nama Tahun Ajaran</label>
                        <select
                          className="form-control"
                          name = "yearId"
                          value={newClass.yearId}
                          onChange={handleNewkelasChange}
                          required
                        >
                          <option value="">-- Pilih Tahun Ajaran --</option>
                          {tahunAjaranList.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nama Kelas</label>
                          <input
                          className="form-control"
                          type="text"
                          name = "name"
                          value={newClass.name}
                          placeholder="Masukan Nama Kelas Baru"
                          onChange={handleNewkelasChange}
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
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fakultas</th>
                        <th>Program Studi</th>
                        <th>Tahun Ajaran</th>
                        <th>Nama Kelas</th>
                        <th>Dibuat Pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kelasList.map((kelas, index) => (
                        <tr key={kelas.id}>
                          <td>{index + 1}</td>
                          <td>{faculties[kelas.major?.facultyId ?? ""]}</td>
                          <td>{kelas.major?.name}</td>
                          <td>{kelas.year?.name}</td>
                          <td>{kelas.name}</td>
                          <td>{
                            new Date (kelas.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                            }</td>
                          <td>
                            {/* <a href="/admin/pilihkelas" className="btn btn-icon btn-warning">
                              <i className="fa fa-users"></i>
                            </a> */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                openEditModal(kelas);
                              }}
                              className="btn btn-icon btn-primary mx-1"
                            >
                              <i className="far fa-edit"></i>
                            </button>
                            <a href="#" className="btn btn-icon btn-danger"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete(kelas.id);
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

                {/* Modal Edit */}
                {/* <div
                  className="modal fade"
                  id="editModal"
                  tabIndex={-1}
                  aria-labelledby="editModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="editModalLabel">
                          Edit Kelas
                        </h5>
                        <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      {selectedKelas && (
                        <div className="modal-body">
                          <div className="form-group">
                            <label>Nama Fakultas</label>
                            <select
                              className="form-control"
                              name="yearId"
                              value={selectedKelas.yearId}
                              onChange={handleInputChange}
                            >
                              {tahunAjaranList.map((year) => (
                                <option key={year.id} value={year.id}>
                                  {year.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Program Studi</label>
                            <input
                              className="form-control"
                              name="name"
                              value={selectedKelas.name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Tahun Ajaran</label>
                            <input
                              className="form-control"
                              name="tahunAjaran"
                              // value={selectedKelas.tahunAjaran}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Nama Kelas</label>
                            <input
                              className="form-control"
                              name="namaKelas"
                              // value={selectedKelas.namaKelas}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      )}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-dismiss="modal"
                        >
                          Tutup
                        </button>
                        <button
                          // onClick={handleSave}
                          className="btn btn-primary"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* End Modal */}
              </div>
            </div>
          </div>
        </div>
      </div>
        {isEditModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Program Studi</h5>
                  <button type="button" 
                  className="close" 
                  onClick={closeEditModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nama Program Studi</label>
                    <select
                      className="form-control"
                      name = "majorId"
                      value={selectedKelas.majorId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Pilih Program studi --</option>
                      {prodiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nama Tahun Ajaran</label>
                    <select
                      name="yearId"
                      className="form-control"
                      value={selectedKelas.yearId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Pilih Tahun Ajaran --</option>
                      {tahunAjaranList.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nama Kelas</label>
                    <input
                      type="text"
                      name="code"
                      className="form-control"
                      value={selectedKelas.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Batal</button>
                  <button type="submit" className="btn btn-primary">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default KelasPage;
