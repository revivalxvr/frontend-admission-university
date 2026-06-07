"use client";
import api from "@/app/lib/axiosInstance";
import React, { useState, useEffect } from "react";

interface Fakultas {
  id: number;
  name: string;
  code: string;
  createdAt: string;
}

//API fakultas
const getFacultas = async () => {
  try {
    const response = await api.get("/faculties");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching faculties:", error);
    return [];
  }
};
const addFacultas = async (data: { name: string; code: string }) => {
  try {
    const response = await api.post("/faculties", data);
    return response.data;
  } catch (error) {
    console.error("Error adding faculties:", error);
    return null;
  }
};

const updateFacultas = async (
  id: number,
  data: { name?: string; code?: string },
) => {
  try {
    const response = await api.put(`/faculties/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating faculties:", error);
    throw error;
  }
};

const deleteFacultas = async (id: number) => {
  const response = await api.delete(`/faculties/${id}`);
  return response.data;
};
const FakultasPage = () => {
  const [faculties, setFaculties] = useState<Fakultas[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaculties, setSelectedFaculties] = useState<Fakultas | null>(
    null,
  );

  //State input/edit
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  //State search, sorting, pagination
  // const [globalFilter, setGlobalFilter] = useState('');
  // const [sorting, setSorting] = useState<SortingState>([
  //   {id: 'name', desc: false},
  // ]);
  // const [pagination, setPagination] = useState({
  //   pageIndex: 0,
  //   pageSize: 10
  // })

  //Generate code otomatis dari nama
  const generateCode = (nameFakultas: string) => {
    if (!nameFakultas) return "";
    return nameFakultas
      .split(" ") //pisa perkata
      .map((kata) => kata[0]?.toUpperCase()) //ambil huruf pertama perkata
      .join(""); //misal 'fakultas teknologi informasi' => 'FTI'
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setCode(generateCode(value)); //generate code otomatis dari nama
  };

  const fetchFakultas = async () => {
    setLoading(true);
    const data = await getFacultas();
    setFaculties(data);
    setLoading(false);
  };

  //ambil data awal
  useEffect(() => {
    fetchFakultas();
  }, []);

  //add
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await addFacultas({ name: name, code: code });

    setName("");
    setCode("");
    fetchFakultas();
  };
  //edit
  const openEditModal = (fakultas: Fakultas) => {
    setSelectedFaculties(fakultas);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedFaculties(null);
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFaculties) {
      await updateFacultas(selectedFaculties.id, {
        name: selectedFaculties.name,
        code: selectedFaculties.code,
      });
      closeEditModal();
      fetchFakultas();
    }
  };

  const handleSave = async () => {
    if (selectedFaculties) {
      await updateFacultas(selectedFaculties.id, {
        name: selectedFaculties.name,
        code: selectedFaculties.code,
      });
      closeEditModal();
      fetchFakultas();
    }
  };
  //hapus
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;

    try {
      await deleteFacultas(id);
      setFaculties(faculties.filter((fakultas) => fakultas.id !== id));
      fetchFakultas();
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

      console.error("====Gagal delete fakultas ===", errorString);
      fetchFakultas();
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <h1>Master</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Master</div>
          <div className="breadcrumb-item">
            <a href="#">Fakultas</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Fakultas</h2>
        <p className="section-lead">
          Menampilkan semua data fakultas yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseTambahFakultas"
                >
                  Tambah Fakultas
                </button>
                <div className="collapse" id="collapseTambahFakultas">
                  <div className="card card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label>Nama Fakultas</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nama Fakultas"
                          value={name}
                          onChange={(e) => handleNameChange(e)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Kode Fakultas</label>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Kode Fakultas"
                        value={code}
                        readOnly
                      />
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
                        <th>Nama</th>
                        <th>Kode</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faculties.map((fakultas, index) => (
                        <tr key={fakultas.id}>
                          <td>{index + 1}</td>
                          <td>{fakultas.name}</td>
                          <td>{fakultas.code}</td>
                          <td>
                            {new Date(fakultas.createdAt).toLocaleString(
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
                                openEditModal(fakultas);
                              }}
                            >
                              <i className="far fa-edit"></i>
                            </a>
                            <a
                              href="#"
                              className="btn btn-icon btn-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(fakultas.id);
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
                            <h5 className="modal-title">Edit Fakultas</h5>
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
                              <label>Nama Fakultas</label>
                              <input
                                type="text"
                                className="form-control"
                                name="nama"
                                value={selectedFaculties?.name || ""}
                                onChange={(e) => {
                                  // Cek dulu apakah selectedFaculties ada isinya (tidak null)
                                  if (selectedFaculties) {
                                    setSelectedFaculties({
                                      ...selectedFaculties, // Taruh spread di ATAS
                                      name: e.target.value, // Properti yang diubah di BAWAH
                                    });
                                  }
                                }}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Kode Fakultas</label>
                              <input
                                type="text"
                                className="form-control"
                                name="kode"
                                value={selectedFaculties?.code || ""}
                                onChange={(e) => {
                                  if (selectedFaculties) {
                                    setSelectedFaculties({
                                      ...selectedFaculties,
                                      code: e.target.value,
                                    });
                                  }
                                }}
                                readOnly
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

export default FakultasPage;
