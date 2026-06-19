"use client";
import React, { useState, useEffect } from "react";
// import MyBarChart from '../../../components/myBarChart';
import api from "@/app/lib/axiosInstance";

interface Jadwal {
  id: string;
  name: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  createdAt: string;
  classId: string;
  courseId: string;
  class: Kelas;
  course: Matkul;
}
interface Kelas {
  id: string;
  name: string;
  year: TahunAjaran;
  major: Prodi;
}
interface TahunAjaran {
  id: string;
  name: string;
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
interface Matkul {
  id: string;
  name: string;
  lecture: Dosen;
}
interface Dosen {
  id: string;
  name: string;
}

//API services
const getKelas = async () => {
  const res = await api.get("/class");
  return res.data.data;
};
const getMatkul = async () => {
  const res = await api.get("/courses");
  return res.data.data;
};
const getJadwal = async () => {
  const res = await api.get("/schedule");
  return res.data.data;
};
const addJadwal = async (data: {
  day: string;
  timeStart: string;
  timeEnd: string;
  classId: string;
  courseId: string;
}) => {
  const res = await api.post("/schedule", data);
  return res.data;
};
const updateJadwal = async (
  id: string,
  data: {
    day: string;
    timeStart: string;
    timeEnd: string;
    classId: string;
    courseId: string;
  },
) => {
  const res = await api.put(`/schedule/${id}`, data);
  return res.data;
};
const deleteData = async (id: string) => {
  const res = await api.delete(`/schedule/${id}`);
  return res.data;
};
//end of API services

const JadwalPage = () => {
  //state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedJadwal, setSelectedJadwal] = useState<Partial<Jadwal>>({});

  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);

  const [newJadwal, setNewJadwal] = useState({
    day: "",
    timeStart: "",
    timeEnd: "",
    classId: "",
    courseId: "",
  });
  //end of state

  const handleAddNewJadwal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const playload = {
        ...newJadwal,
        timeStart: new Date(newJadwal.timeStart).toISOString(),
        timeEnd: new Date(newJadwal.timeEnd).toISOString(),
      };
      await addJadwal(playload);
      setNewJadwal({
        day: "",
        timeStart: "",
        timeEnd: "",
        classId: "",
        courseId: "",
      });
      fetchJadwal();
    } catch (error) {
      console.log("Gagal menambahkan jadwal ==", error);
    }
  };

  //ambil data awal menggunakan useEffect
  useEffect(() => {
    fetchJadwal();
    fetchKelas();
    fetchMatkul();
  }, []);

  const fetchJadwal = async () => {
    try {
      const data = await getJadwal();
      setJadwalList(data);
    } catch (error) {
      console.log("Gagal mengambil data jadwal ==", error);
    }
  };
  const fetchKelas = async () => {
    try {
      const data = await getKelas();
      setKelasList(data);
    } catch (error) {
      console.log("Gagal mengambil data kelas ==", error);
    }
  };
  const fetchMatkul = async () => {
    try {
      const data = await getMatkul();
      setMatkulList(data);
    } catch (error) {
      console.log("Gagal mengambil data matkul ==", error);
    }
  };

  const handleNewChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "timeStart") {
      const date = new Date(value);
      const dayName = date.toLocaleString("id-ID", { weekday: "long" });
      setNewJadwal((prev) => ({
        ...prev,
        [name]: value,
        day: dayName, //isi field day otomatis
      }));
    } else {
      setNewJadwal((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteData(id);
      setJadwalList((prev) => prev.filter((jadwal) => jadwal.id !== id));
      alert("Data jadwal berhasil dihapus!");
      fetchJadwal();
    } catch (error) {
      console.log("Gagal menghapus jadwal ==", error);
      alert("Gagal menghapus jadwal");
    }
  };

  const openEditModal = (jadwal: Jadwal) => {
    setSelectedJadwal(jadwal);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedJadwal({});
    setIsEditModalOpen(false);
  };

  //function untuk edit modal(update data)
  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJadwal.id) return;
    try {
      const res = await updateJadwal(selectedJadwal.id, {
        day: selectedJadwal.day ?? "",
        timeStart: toISOStringWithTZ(selectedJadwal.timeStart ?? ""),
        timeEnd: toISOStringWithTZ(selectedJadwal.timeEnd ?? ""),
        classId: selectedJadwal.classId ?? "",
        courseId: selectedJadwal.courseId ?? "",
      });
      setJadwalList((prev) =>
        prev.map((jadwal) => (jadwal.id === res.id ? res : jadwal)),
      );
      closeEditModal();
      fetchJadwal();
    } catch (error) {
      alert("Gagal mengupdate jadwal");
      console.log("Gagal mengupdate jadwal ==", error);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedJadwal((prev) => {
        let update = { ...prev, [name]: value };
        if (name === "timeStart") {
            update.day = getDayFromDate(value);
        }
        return update;
    });
  };

  //function untuk format waktu
  function formatForDateTimeLocal(isoString?: string) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offSet = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offSet * 60000);
    return local.toISOString().slice(0, 16);
  }
  function toISOStringWithTZ(value: string | undefined) {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString();
  }
  function getDayFromDate(value: string | undefined) {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("id-ID", { weekday: "long" });
  }
  //end of function format waktu

  return (
    <section className="section">
      <div className="section-header">
        <h1>Akademik</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Akademik</div>
          <div className="breadcrumb-item">
            <a href="/admin/akademik/jadwal">Jadwal</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Jadwal</h2>
        <p className="section-lead">
          Menampilkan semua data Jadwal yang ada pada universitas ini
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
                  Tambah Jadwal
                </button>
                <div className="collapse" id="collapseEditMatkul">
                  <div className="card card-body">
                    <form onSubmit={handleAddNewJadwal}>
                      <div className="form-group">
                        <label htmlFor="fakultas">Kelas</label>
                        <select
                          className="form-control"
                          name="classId"
                          value={newJadwal.classId}
                          onChange={handleNewChange}
                          required
                        >
                          <option value="">-- Pilih Kelas --</option>
                          {kelasList.map((kelas) => (
                            <option key={kelas.id} value={kelas.id}>
                              {kelas.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="prodi">Mata Kuliah</label>
                        <select
                          className="form-control"
                          id="prodi"
                          name="courseId"
                          value={newJadwal.courseId}
                          onChange={handleNewChange}
                          required
                        >
                          <option value="">-- Pilih Mata Kuliah --</option>
                          {matkulList.map((matkul) => (
                            <option key={matkul.id} value={matkul.id}>
                              {matkul.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tanggal dan Jam Mulai</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="timeStart"
                          value={newJadwal.timeStart}
                          onChange={handleNewChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tanggal dan Jam Berakhir</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="timeEnd"
                          value={newJadwal.timeEnd}
                          onChange={handleNewChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Hari</label>
                        <input
                          type="text"
                          className="form-control"
                          name="day"
                          placeholder="Hari"
                          value={newJadwal.day}
                          onChange={handleNewChange}
                          readOnly
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
                        <th>Mata Kuliah</th>
                        <th>Kelas</th>
                        <th>Dosen</th>
                        <th>Tahun Ajaran</th>
                        <th>Hari</th>
                        <th>Tanggal</th>
                        <th>Waktu Mulai</th>
                        <th>Waktu Berakhir</th>
                        <th>Dibuat Pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jadwalList.map((jadwal, index) => (
                        <tr key={jadwal.id}>
                          <td>{index + 1}</td>
                          <td>{jadwal.class?.major?.faculty?.name}</td>
                          <td>{jadwal.class?.major?.name}</td>
                          <td>{jadwal.course?.name}</td>
                          <td>{jadwal.class?.name}</td>
                          <td>{jadwal.course?.lecture?.name}</td>
                          <td>{jadwal.class?.year?.name}</td>
                          <td>{jadwal.day}</td>
                          <td>
                            {new Date(jadwal.timeStart).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            {new Date(jadwal.timeStart).toLocaleString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              },
                            )}
                          </td>
                          <td>
                            {new Date(jadwal.timeEnd).toLocaleString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </td>

                          <td>
                            {new Date(jadwal.createdAt).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            <a href="#" className="btn btn-icon btn-primary"
                            onClick={(e) => {
                                e.preventDefault();
                                openEditModal(jadwal);
                              }}
                            >
                              <i className="far fa-edit"></i>
                            </a>
                            <a
                              href="#"
                              className="btn btn-icon btn-danger"
                              onClick={() => handleDelete(jadwal.id)}
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
                  <h5 className="modal-title">Edit Jadwal</h5>
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
                    <label htmlFor="prodi">Mata Kuliah</label>
                    <select
                      className="form-control"
                      id="prodi"
                      name="courseId"
                      value={selectedJadwal.courseId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Pilih Mata Kuliah --</option>
                      {matkulList.map((matkul) => (
                        <option key={matkul.id} value={matkul.id}>
                          {matkul.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tanggal dan Jam Mulai</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="timeStart"
                      value={formatForDateTimeLocal(
                        selectedJadwal.timeStart ?? "",
                      )}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tanggal dan Jam Berakhir</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="timeEnd"
                      value={formatForDateTimeLocal(selectedJadwal.timeEnd ?? "")}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                        <label>Hari</label>
                        <input
                          type="text"
                          className="form-control"
                          name="day"
                          placeholder="Hari"
                          value={selectedJadwal.day}
                          onChange={handleInputChange}
                          readOnly
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

export default JadwalPage;
