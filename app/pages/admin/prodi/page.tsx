'use client';
import React, { useState, useEffect } from 'react';
import api from '@/app/lib/axiosInstance';



interface Fakultas {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updateAt: string;
}
interface Prodi {
  id: number;
  name: string;
  code: string;
  facultyId:string;
  faculty?: Fakultas;
  createdAt: string;
}

//API services
const getProdis = async () => {
  const response = await api.get('/majors');
  return response.data.data;
}
const getFaculties = async () => {
  const response = await api.get('/faculties');
  return response.data.data;
}
const addProdis = async (data: { name: string; code: string; facultyId: string }) => {
  const response = await api.post('/majors', data);
  return response.data;
}

const getProdiById = async (id: number) => {
  const response = await api.get(`/majors/${id}`);
  return response.data.data;
}
const updateProdis = async (id: number, data: { name: string; code: string; facultyId: string }) => {
  const response = await api.put(`/majors/${id}`, data);
  return response.data;
}
const deleteProdis = async (id: number) => {
  const response = await api.delete(`/majors/${id}`);
  return response.data;
}
const ProdiPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<Partial<Prodi>>({});
  const [newProdi, setNewProdi] = useState({
    name: "",
    code: "",
    facultyId: "",
  });

  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [facultiList, setFacultiList] = useState<Fakultas[]>([]);

  const fetchProdis = async () => {
   try {
     const data = await getProdis();
    setProdiList(data);
   } catch (error) {
      console.log("Gagal mengambil data prodi ==",error);
   }
  }
  const fetchFaculties = async () => {
    try {
      const data = await getFaculties();
     setFacultiList(data);
    } catch (error) {
       console.log("Gagal mengambil data fakultas ==",error);
    }
  }
  //ambil data awal
  useEffect(() => {
    fetchProdis();
    fetchFaculties();
  }, []);
  const openEditModal = (prodi: Prodi) => {
    setSelectedProdi(prodi);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProdi({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedProdi((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewProdiChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProdi((prev) => ({ ...prev, [name]: value }));
  };


  const handleAddNewProdi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const saved = await addProdis(newProdi);
      setProdiList((prev) => [...prev, saved]);
      setNewProdi({ name: "", code: "", facultyId: "" });
      fetchProdis();
    } catch (error) {
      console.error("Gagal menambahkan prodi ==", error);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
    !selectedProdi.id || 
    !selectedProdi.name || 
    !selectedProdi.code || 
    !selectedProdi.facultyId
  ) return;
    try {
      const updated = await updateProdis(selectedProdi.id, 
        {
          name: selectedProdi.name,
          code: selectedProdi.code,
          facultyId: selectedProdi.facultyId,
        }
      );
      fetchProdis();
      closeEditModal();
      setProdiList((prev) => prev.map((prodi) => (prodi.id === updated.id ? updated : prodi)));
    } catch (error) {
      console.log("Gagal menyimpan perubahan prodi ==",error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteProdis(id);
      setProdiList((prev) => prev.filter((prodi) => prodi.id !== id));
      alert("Data prodi berhasil dihapus!");
      fetchProdis();
    } catch (error : any) {
      //cek error nya apakah karena  forekey constraint
      const errorData = error.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
     if (errorData?.code === "P2003") {
        alert(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
        );
      console.log("Gagal menghapus prodi ==", errorString);
    }
  };
}

  return (
    <section className="section">
      <div className="section-header">
        <h1>Master</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Master</div>
          <div className="breadcrumb-item"><a href="/admin/prodi">Program Studi</a></div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Program Studi</h2>
        <p className="section-lead">
          Menampilkan semua data Program Studi yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button className="btn btn-primary btn-sm mb-2" type="button" data-toggle="collapse" data-target="#collapseTambahProdi">
                  Tambah Prodi
                </button>
                <div className="collapse" id="collapseTambahProdi">
                  <div className="card card-body">
                    <form onSubmit={handleAddNewProdi}>
                      <div className="form-group">
                        <label htmlFor="fakultas">Nama Fakultas</label>
                        <select
                          className="form-control"
                          id="fakultas"
                          name="facultyId"
                          value={newProdi.facultyId}
                          onChange={handleNewProdiChange}
                          required
                        >
                          <option value="">-- Pilih Fakultas --</option>
                          {facultiList.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                          <option value=""></option>
                         
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nama Prodi</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Nama Prodi"
                          value={newProdi.name}
                          onChange={handleNewProdiChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Kode</label>
                        <input
                          type="text"
                          name="code"
                          className="form-control"
                          placeholder="Kode"
                          value={newProdi.code}
                          onChange={handleNewProdiChange}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">Simpan</button>
                    </form>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-striped" id="table-1">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fakultas</th>
                        <th>Nama</th>
                        <th>Kode</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prodiList.map((prodi, index) => (
                        <tr key={prodi.id ?? `new-${index}`}>
                          <td>{index + 1}</td>
                          <td>{prodi.faculty?.name}</td>
                          <td>{prodi.name}</td>
                          <td>{prodi.code}</td>
                          <td>
                            {
                              new Date(prodi.createdAt ?? "").toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            }
                            </td>
                          <td>
                            <a href="#" className="btn btn-icon btn-primary" onClick={(e) => { e.preventDefault(); openEditModal(prodi); }}>
                              <i className="far fa-edit"></i>
                            </a>
                            <a href="#" className="btn btn-icon btn-danger" onClick={(e) => { e.preventDefault(); handleDelete(prodi.id); }}>
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
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Program Studi</h5>
                  <button type="button" className="close" onClick={closeEditModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nama Fakultas</label>
                    <select
                      name="fakultas"
                      className="form-control"
                      value={selectedProdi.facultyId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Pilih Fakultas --</option>
                      {facultiList.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nama Prodi</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={selectedProdi.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Kode</label>
                    <input
                      type="text"
                      name="code"
                      className="form-control"
                      value={selectedProdi.code}
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

export default ProdiPage;
