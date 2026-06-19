"use client";
import React, { useState, useEffect } from "react";
import api from "@/app/lib/axiosInstance";

interface TahunAjaran {
  id?: number; //bisa undifined saat pertama kali di tambahkan jadi "?"
  name: string;
  dateStart: string;
  dateEnd: string;
  status: boolean;
  createdAt: string;
}

const TahunAjaranPage = () => {
  const [data, setData] = useState<TahunAjaran[]>([]);
  const [newTahun, setNewTahun] = useState<TahunAjaran>({
    name: "",
    dateStart: "",
    dateEnd: "",
    status: false,
    createdAt: "",
  });
  const [selectedEdit, setSelectedEdit] = useState<TahunAjaran | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  //API services CRUD
  const fetchData = async () => {
    try {
      const res = await api.get("/years");
      setData(res.data.data);
    } catch (error) {
      console.log("Gagal Fetching data tahun ajaran ==", error);
    }
  };

  const addYear = async (e: React.FormEvent) => {
    e.preventDefault();

    //tambahkan sementara di UI dengan temporary id
    const tempId = Date.now();
    const tempData = {
      ...newTahun,
      id: tempId,
      createdAt: new Date().toLocaleDateString("id-ID"),
    };
    setData((prev) => [...prev, tempData]);

    try {
      const res = await api.post("/years", newTahun);
      setData((prev) =>
        prev.map((item) => (item.id === tempId ? res.data.data : item)),
      );

      // Reset form jadi kosong (yang kita buat sebelumnya)
      setNewTahun({
        name: "",
        dateStart: "",
        dateEnd: "",
        status: false,
        createdAt: "",
      });

      // === TAMBAHKAN KODE INI UNTUK MEMAKSA BOOTSTRAP MENUTUP FORM ===
      // setShowAddForm(false);
      // if (typeof window !== "undefined" && (window as any).$) {
      //   (window as any).$('#collapseTambahTahunAjaran').collapse('hide');
      // }
    } catch (error) {
      console.log("Gagal menambah data tahun ajaran ==", error);
    }
  };

  const handleEdit = (item: TahunAjaran) => {
    setSelectedEdit({
      ...item,
      dateStart: item.dateStart ? item.dateStart.split("T")[0] : "",
      dateEnd: item.dateEnd ? item.dateEnd.split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEdit || selectedEdit.id === undefined) return;
    try {
      const res = await api.put(`/years/${selectedEdit.id}`, selectedEdit);
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedEdit?.id ? res.data.data : item,
        ),
      );
      setShowEditModal(false);
      setSelectedEdit(null);
    } catch (error) {
      console.log("Gagal menyimpan perubahan tahun ajaran ==", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await api.delete(`/years/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      alert("Data matkul berhasil dihapus!");
    } catch (error: any) {
      //cek error nya apakah karena  forekey constraint
      const errorData = error.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
      if (errorData?.code === "P2003") {
        alert(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
        );
        console.log("Gagal menghapus tahun ajaran ==", errorString);
        console.log("Gagal menghapus tahun ajaran ==", errorData);
      }
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="section">
      <div className="section-header">
        <h1>Master</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Master</div>
          <div className="breadcrumb-item">
            <a href="../master/tahun-ajaran.html">Tahun Ajaran</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Tahun Ajaran</h2>
        <p className="section-lead">
          Menampilkan semua data Tahun Ajaran yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseTambahTahunAjaran"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  Tambah Tahun Ajaran
                </button>

                <div className="collapse" id="collapseTambahTahunAjaran">
                  <div className="card card-body">
                    <form onSubmit={addYear}>
                      <div className="form-group">
                        <label>Nama Tahun Ajaran</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nama Tahun Ajaran"
                          value={newTahun.name}
                          onChange={(e) =>
                            setNewTahun({ ...newTahun, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Tanggal Dimulai</label>
                        <input
                          type="date"
                          className="form-control"
                          name="tanggal_mulai"
                          value={newTahun.dateStart}
                          onChange={(e) =>
                            setNewTahun({
                              ...newTahun,
                              dateStart: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tanggal Berakhir</label>
                        <input
                          type="date"
                          className="form-control"
                          name="tanggal_berakhir"
                          value={newTahun.dateEnd}
                          onChange={(e) =>
                            setNewTahun({
                              ...newTahun,
                              dateEnd: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Apakah Aktif</label>
                        <br />
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="isAktif"
                            name="is_aktif"
                            checked={newTahun.status}
                            onChange={(e) =>
                              setNewTahun({
                                ...newTahun,
                                status: e.target.checked,
                              })
                            }
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="isAktif"
                          >
                            Aktif
                          </label>
                        </div>
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
                        <th>Nama</th>
                        <th>Tanggal Dimulai</th>
                        <th>Tanggal Berakhir</th>
                        <th>Aktif</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={item.id ?? `new-${index}`}>
                          <td>{index + 1}</td>
                          <td>{item.name}</td>
                          <td>
                            {new Date(item.dateStart ?? "").toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            {new Date(item.dateEnd ?? "").toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${item.status ? "badge-success" : "badge-danger"}`}
                            >
                              {item.status ? "Aktif" : "Tidak"}
                            </span>
                          </td>
                          <td>
                            {new Date(item.createdAt ?? "").toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleEdit(item)}
                              className="btn btn-icon btn-primary"
                            >
                              <i className="far fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-icon btn-danger"
                              onClick={() => handleDelete(item.id!)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal Edit */}
                {showEditModal && selectedEdit && (
                  <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <div
                      className="modal-dialog modal-dialog-centered"
                      role="document"
                    >
                      <div className="modal-content">
                        <form onSubmit={saveEdit}>
                          <div className="modal-header">
                            <h5 className="modal-title">Edit Tahun Ajaran</h5>
                            <button
                              type="button"
                              className="close"
                              onClick={() => setShowEditModal(false)}
                            >
                              <span>&times;</span>
                            </button>
                          </div>
                          <div className="modal-body">
                            <div className="form-group">
                              <label>Nama Tahun Ajaran</label>
                              <input
                                type="text"
                                className="form-control"
                                defaultValue={selectedEdit.name}
                                onChange={(e) =>
                                  setSelectedEdit({
                                    ...selectedEdit,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Tanggal Dimulai</label>
                              <input
                                type="date"
                                className="form-control"
                                value={selectedEdit.dateStart}
                                onChange={(e) =>
                                  setSelectedEdit({
                                    ...selectedEdit,
                                    dateStart: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Tanggal Berakhir</label>
                              <input
                                type="date"
                                className="form-control"
                                value={selectedEdit.dateEnd}
                                onChange={(e) =>
                                  setSelectedEdit({
                                    ...selectedEdit,
                                    dateEnd: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Status Aktif</label>
                              <br />
                              <div className="custom-control custom-checkbox">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id="editIsAktif"
                                  defaultChecked={selectedEdit.status}
                                  onChange={(e) =>
                                    setSelectedEdit({
                                      ...selectedEdit,
                                      status: e.target.checked,
                                    })
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="editIsAktif"
                                >
                                  Aktif
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowEditModal(false)}
                            >
                              Batal
                            </button>
                            <button type="submit" className="btn btn-primary">
                              Simpan Perubahan
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
                {/* End Modal */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TahunAjaranPage;
