'use client';
import React, { useState, useEffect } from 'react';
import MyBarChart from '../../../components/myBarChart';
import api from '@/app/lib/axiosInstance';

interface GolonganUKT {
  id: string;
  group: string;
  amount: number;
  createdAt: string;
}

const getGolUkt = async () => {
  const res = await api.get('/tf-groups');
  return res.data.data;
}

const addGolUkt = async (data: { group: string; amount: number }) => {
  const res = await api.post('/tf-groups', data);
  return res.data;
}

const updateGoUkt = async (id: string, data: { group?: string; amount?: number }) => {
  const res = await api.put(`/tf-groups/${id}`, data);
  return res.data;
}

const deleteGolUkt = async (id: string) => {
  const res = await api.delete(`/tf-groups/${id}`);
  return res.data;
}

const GolUKTPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGolUkt, setSelectedGolUkt] = useState<Partial<GolonganUKT>>({});
  const [newGolUkt, setNewGolUkt] = useState({
    group: "",
    amount: null,
  })
  const [golUktList, setGolUktList] = useState<GolonganUKT[]>([]);

   const fetchData = async () => {
      try {
        const data = await getGolUkt();
        setGolUktList(data);
      } catch (error) {
        console.log("Gagal mengambil data Golongan UKT ==",error);
      }
    }

  //ambil data awal
  useEffect(() => {
    fetchData();
  }, [])

 const openEditModal = (ukt: GolonganUKT) => {
  setSelectedGolUkt(ukt);
  setIsEditModalOpen(true);
 } 

 const closeEditModal = () => {
   setIsEditModalOpen(false);
   setSelectedGolUkt({});
 }

 const handleInputChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedGolUkt((prev) => ({ ...prev, [name]: name === "amount" ? Number(value) : value }));
 }
 const handleNewGolUktChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewGolUkt((prev) => ({ ...prev, [name]: name === "amount" ? Number(value) : value }));
 }

const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!selectedGolUkt.id) return;
  try {
    const updated = await updateGoUkt(selectedGolUkt.id, {
      group: selectedGolUkt.group,
      amount: selectedGolUkt.amount,
    });
    fetchData();
    closeEditModal();
  } catch (error) {
    console.log("Gagal menyimpan perubahan Golongan UKT ==",error);
  }
}

const handleAddNewGolUkt = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const playload = {
      group: newGolUkt.group,
      amount: Number(newGolUkt.amount), //pastika number
    }
     const saved = await addGolUkt(playload);
      setGolUktList((prev) => [...prev, saved]);
      setNewGolUkt({ group: " " , amount: null });
      fetchData();
  } catch (error) {
    console.log ("Gagal menambahkan Golongan UKT ==",error);
  }
}

 const handleDelete = async(id : string) => {
 if(!confirm("Apakah anda yakin ingin menghapus data ini?")) return;


   try {
    await deleteGolUkt(id);
    setGolUktList((prev) => prev.filter((ukt) => ukt.id !== id));
    alert("Data Golongan UKT berhasil dihapus!");
    fetchData();
   } catch (err: any) {
     //cek error nya apakah karena  forekey constraint
      const errorData = err.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
      if (errorData?.code === "P2003") {
        alert(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
        );
      } else {
        alert("Terjadi kesalahan saat menghapus data" + err.message);
      }

      console.error("====Gagal delete golongan UKT ===", errorString);
      console.error("====Gagal delete golongan UKT ===", errorData);

    }
   }
 

  return (
    <section className="section">
      <div className="section-header">
        <h1>Pembayaran</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Pembayaran</div>
          <div className="breadcrumb-item">
            <a href="../pembayaran/golongan-ukt.html">Golongan Kuliah Tunggal</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Golongan UKT</h2>
        <p className="section-lead">
          Menampilkan semua data Golongan UKT yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseEditGolonganUKT"
                >
                  Tambah Golongan UKT
                </button>
                <div className="collapse" id="collapseEditGolonganUKT">
                  <div className="card card-body">
                    <form onSubmit={handleAddNewGolUkt}>
                      <div className="form-group">
                        <label>Golongan</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nama Golongan"
                          name="group"
                          value={newGolUkt.group}
                          onChange={handleNewGolUktChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Jumlah</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Jumlah"
                          name="amount"
                          value={newGolUkt.amount ?? ""}
                          onChange={handleNewGolUktChange}
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
                        <th>Golongan</th>
                        <th>Jumlah</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {golUktList.map((ukt, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{ukt.group}</td>
                          <td>{
                            new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ukt.amount)
                            }</td>
                          <td>{
                            new Date(ukt.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                            }</td>
                          <td>
                            <a href="#" className="btn btn-icon btn-primary"
                              onClick={() => openEditModal(ukt)}
                            >
                              <i className="far fa-edit"></i>
                            </a>
                            <a href="#" className="btn btn-icon btn-danger"
                              onClick={() => handleDelete(ukt.id)}>
                              <i className="fa fa-trash"></i>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal */}
                {isEditModalOpen && (
                  <div
                    className="modal fade show"
                    style={{
                      display: "block",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1050,
                    }}
                  >
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <form onSubmit={handleSave}>
                          <div className="modal-header">
                            <h5 className="modal-title">Edit UKT</h5>
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
                              <label>Golongan UKT</label>
                              <input
                                type="text"
                                className="form-control"
                                name="group"
                                value={selectedGolUkt?.group}
                                onChange={(e) => {
                                  // Cek dulu apakah selectedGolUkt ada isinya (tidak null)
                                  if (selectedGolUkt) {
                                    const newName = e.target.value;
                                    setSelectedGolUkt({
                                      ...selectedGolUkt, // Taruh spread di ATAS
                                     group: newName,
                                    });
                                  }
                                }}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Jumlah</label>
                              <input
                                type="text"
                                className="form-control"
                                name="amount"
                                value={selectedGolUkt?.amount || ""}
                                onChange={(e) => {
                                  if (selectedGolUkt) {
                                    setSelectedGolUkt({
                                      ...selectedGolUkt,
                                      amount: Number(e.target.value),

                                    });
                                  }
                                }}
                                required
                              />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GolUKTPage;
