"use client";
import React, { useState, useEffect, useMemo } from "react";
// import MyBarChart from '../../../components/myBarChart';
import api from "@/app/lib/axiosInstance";
import {
  ColumnDef,
  getSortedRowModel,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import DataTable from "@/app/components/table/DataTable";
import TableToolbar from "@/app/components/table/TableToolbar";
import TablePagination from "@/app/components/table/TablePagination";
import AddForm from "@/app/components/form/AddForm";
import ModalEditForm from "@/app/components/form/EditForm";
import { useToast } from "@/app/components/context/ToastContext";
import ModalConfirmDelete from "@/app/components/modal/ModalConfirmDelete";
import LoadingSpinner from "@/app/components/loading/LoadingSpinner";
interface Jadwal {
  id: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  capacity: number;
  classId: string;
  courseId: string;
  lectureId: string;
  class?: Kelas;
  course?: Matkul;
  lecture?: Dosen;
}
interface Kelas {
  id: string;
  name: string;
  semester?: number;
  year?: TahunAjaran;
  major?: Prodi;
}
interface TahunAjaran {
  id: string;
  name: string;
}
interface Prodi {
  id: string;
  name: string; // Misal: "Teknologi Informasi"
  faculty?: Fakultas;
}
interface Fakultas {
  id: string;
  name: string;
}
interface Matkul {
  id: string;
  code: string; // Kode Matkul, misal: "INF-202"
  name: string; // Nama Matkul, misal: "Fundamental Web Development"
  credits: number; // Bobot SKS, misal: 3 atau 4
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
const getDosen = async () => {
  const res = await api.get("/lecture");
  return res.data.data;
};
const addJadwal = async (data: {
  day: string;
  timeStart: string;
  timeEnd: string;
  classId: string;
  courseId: string;
  room: string;
  capacity: number;
  lectureId: string;
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
    room: string;
    capacity: number;
    lectureId: string;
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
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  //state untuk delete data
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  //end of state untuk delete

  // State untuk search, sorting, pagination
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [selectedJadwal, setSelectedJadwal] = useState<Partial<Jadwal>>({});

  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);

  const [newJadwal, setNewJadwal] = useState({
    day: "",
    timeStart: "",
    timeEnd: "",
    classId: "",
    courseId: "",
    room: "",
    capacity: 0,
    lectureId: "",
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
        room: "",
        capacity: 0,
        lectureId: "",
      });
      showToast("successfully", "success");
      fetchJadwal();
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.log("Gagal menambahkan jadwal ==", error);
    }
  };

  //ambil data awal menggunakan useEffect
  useEffect(() => {
    fetchJadwal();
    fetchKelas();
    fetchMatkul();
    fetchDosen();
  }, []);

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const data = await getJadwal();
      setJadwalList(data);
    } catch (error) {
      console.log("Gagal mengambil data jadwal ==", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchKelas = async () => {
    setLoading(true);
    try {
      const data = await getKelas();
      setKelasList(data);
    } catch (error) {
      console.log("Gagal mengambil data kelas ==", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchMatkul = async () => {
    setLoading(true);
    try {
      const data = await getMatkul();
      setMatkulList(data);
    } catch (error) {
      console.log("Gagal mengambil data matkul ==", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDosen = async () => {
    setLoading(true);
    try {
      const data = await getDosen();
      setDosenList(data);
    } catch (error) {
      console.log("Gagal mengambil data dosen ==", error);
    } finally {
      setLoading(false);
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
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    try {
      await deleteData(id);
      setJadwalList((prev) => prev.filter((jadwal) => jadwal.id !== id));
      showToast("successfully", "success");
      fetchJadwal();
    } catch (error) {
      console.log("Gagal menghapus jadwal ==", error);
      showToast("terjadi kesalahan", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
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
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  //function untuk edit modal(update data)
  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJadwal.id) return;
    // Cari data asli/awal dari list jadwal sebelum diedit oleh Admin
    const originalJadwal = jadwalList.find((j) => j.id === selectedJadwal.id);

    if (originalJadwal) {
      // FORMAT TANGGAL: Sesuaikan format string datetime agar sebanding saat dicek
      const formTimeStart = toISOStringWithTZ(selectedJadwal.timeStart ?? "");
      const formTimeEnd = toISOStringWithTZ(selectedJadwal.timeEnd ?? "");

      // Bandingkan semua field form dengan data asli di state list
      const isUnchanged =
        selectedJadwal.day === originalJadwal.day &&
        formTimeStart === originalJadwal.timeStart &&
        formTimeEnd === originalJadwal.timeEnd &&
        selectedJadwal.classId === originalJadwal.classId &&
        selectedJadwal.courseId === originalJadwal.courseId &&
        selectedJadwal.room === originalJadwal.room &&
        Number(selectedJadwal.capacity) === Number(originalJadwal.capacity) &&
        selectedJadwal.lectureId === originalJadwal.lectureId;

      // Jika Tidak ada perubahan, kunci pengiriman API
      if (isUnchanged) {
        closeEditModal(); // Tutup modal secara langsung
        showToast("Tidak ada perubahan data yang disimpan", "info"); // Berikan info teks ringan
        return; //Program berhenti di sini, API update tidak akan ditembak
      }
    }
    try {
      const res = await updateJadwal(selectedJadwal.id, {
        day: selectedJadwal.day ?? "",
        timeStart: toISOStringWithTZ(selectedJadwal.timeStart ?? ""),
        timeEnd: toISOStringWithTZ(selectedJadwal.timeEnd ?? ""),
        classId: selectedJadwal.classId ?? "",
        courseId: selectedJadwal.courseId ?? "",
        room: selectedJadwal.room ?? "",
        capacity: selectedJadwal.capacity ?? 0,
        lectureId: selectedJadwal.lectureId ?? "",
      });
      setJadwalList((prev) =>
        prev.map((jadwal) => (jadwal.id === res.id ? res : jadwal)),
      );
      closeEditModal();
      showToast("successfully", "success");
      fetchJadwal();
    } catch (error) {
      showToast("terjadi kesalahan", "error");
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
  const columns = useMemo<ColumnDef<Jadwal>[]>(
    () => [
      {
        accessorFn: (row, index) => index + 1,
        header: "#",
      },
      {
        id: "majorName",
        header: "Program Studi",
        accessorFn: (row) => row.class?.major?.name || "-",
      },
      {
        id: "className",
        header: "Kelas",
        accessorFn: (row) => row.class?.name || "-",
      },
      {
        id: "courseName",
        header: "Mata Kuliah",
        accessorFn: (row) => row.course?.name || "-",
      },
      {
        accessorKey: "day",
        header: "Hari",
      },
      {
        accessorKey: "room",
        header: "Ruangan",
        accessorFn: (row) => row.room || "-",
      },
      {
        accessorKey: "timeStart",
        header: "Tanggal",
        cell: (info) => {
          const val = info.getValue() as string;
          return val
            ? new Date(val).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "-";
        },
      },
      {
        id: "waktuMulai",
        accessorKey: "timeStart",
        header: "Waktu Mulai",
        cell: (info) => {
          const val = info.getValue() as string;
          return val
            ? new Date(val).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "-";
        },
      },
      {
        accessorKey: "timeEnd",
        header: "Waktu Berakhir",
        cell: (info) => {
          const val = info.getValue() as string;
          return val
            ? new Date(val).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "-";
        },
      },

      {
        id: "lectureName",
        header: "Dosen",
        accessorFn: (row) => row.lecture?.name || "-",
      },
      {
        id: "yearName",
        header: "Tahun Ajaran",
        accessorFn: (row) => row.class?.year?.name || "-",
      },
      {
        id: "capacity",
        header: "Kapasitas",
        accessorFn: (row) => row.capacity || "-",
      },

      {
        accessorKey: "createdAt",
        header: "Dibuat Pada",
        cell: (info) => {
          const val = info.getValue() as string;
          return val
            ? new Date(val).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "-";
        },
      },
      {
        header: "Aksi",
        cell: ({ row }) => {
          const jadwal = row.original; // Mengambil objek asli per baris
          return (
            <>
              <a
                href="#"
                className="btn btn-icon btn-primary m-1"
                onClick={(e) => {
                  e.preventDefault();
                  openEditModal(jadwal); // Membuka modal edit
                }}
              >
                <i className="far fa-edit"></i>
              </a>
              <a
                href="#"
                className="btn btn-icon btn-danger"
                onClick={(e) => {
                  e.preventDefault();
                  openDeleteModal(jadwal.id); // Direkomendasikan panggil pembungkus modal konfirmasi Anda
                }}
              >
                <i className="fa fa-trash"></i>
              </a>
            </>
          );
        },
      },
    ],
    [],
  );
  const table = useReactTable({
    data: jadwalList,
    columns,
    state: {
      pagination,
      globalFilter,
      sorting,
    },
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });
  const kelasOptions = kelasList.map((kelas) => {
    // Ambil nama jurusan jika ada, jika tidak ada kosongkan saja
    const namaJurusan = kelas.major?.name ? ` - ${kelas.major.name}` : "";

    return {
      value: String(kelas.id),
      // Menghasilkan format: "Reguler Pagi - Teknologi Informasi"
      label: `${kelas.name}${namaJurusan}`,
    };
  });

  const matkulOptions = matkulList.map((matkul) => ({
    value: String(matkul.id),
    label: matkul.name,
  }));
  const dosenOptions = dosenList.map((dosen) => ({
    value: String(dosen.id),
    label: dosen.name,
  }));
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
                    <AddForm
                      onSubmit={handleAddNewJadwal}
                      collapseTargetId="collapseEditMatkul"
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Kelas",
                          name: "classId",
                          type: "select",
                          gridClass: "col-md-6",
                          value: newJadwal.classId || "",
                          placeholder: "-- Pilih Kelas --",
                          options: kelasOptions, // Pastikan state kelasOptions sudah di-fetch dari backend
                          onChange: (e: any) => {
                            const val = e?.target ? e.target.value : e?.value;
                            handleNewChange({
                              target: { name: "classId", value: val },
                            } as any);
                          },
                        },
                        {
                          label: "Mata Kuliah",
                          name: "courseId",
                          type: "select",
                          gridClass: "col-md-6",
                          value: newJadwal.courseId || "",
                          placeholder: "-- Pilih Mata Kuliah --",
                          options: matkulOptions,
                          onChange: (e: any) => {
                            const val = e?.target ? e.target.value : e?.value;
                            handleNewChange({
                              target: { name: "courseId", value: val },
                            } as any);
                          },
                        },
                        {
                          label: "Dosen Pengajar",
                          name: "lectureId",
                          type: "select",
                          gridClass: "col-md-12", // 🚀 TAMBAHAN: Dosen pengajar dipindahkan ke tingkat Jadwal
                          value: newJadwal.lectureId || "",
                          placeholder: "-- Pilih Dosen Pengajar --",
                          options: dosenOptions, // Pastikan Anda sudah menyiapkan state dosenOptions di parent component
                          onChange: (e: any) => {
                            const val = e?.target ? e.target.value : e?.value;
                            handleNewChange({
                              target: { name: "lectureId", value: val },
                            } as any);
                          },
                        },
                        {
                          label: "Ruangan Kuliah",
                          name: "room",
                          type: "text", // 🚀 TAMBAHAN: Mengisi lokasi kelas
                          gridClass: "col-md-6",
                          value: newJadwal.room || "",
                          placeholder: "Contoh: Gedung A.3.1",
                          onChange: (e: any) => handleNewChange(e),
                        },
                        {
                          label: "Kapasitas Maksimal (Mahasiswa)",
                          name: "capacity",
                          type: "number", // 🚀 TAMBAHAN: Kuota kelas pembatas KRS
                          gridClass: "col-md-6",
                          value: newJadwal.capacity || "",
                          placeholder: "Contoh: 35",
                          onChange: (e: any) => handleNewChange(e),
                        },
                        {
                          label: "Tanggal dan Jam Mulai",
                          name: "timeStart",
                          type: "datetime-local",
                          gridClass: "col-md-6",
                          value: newJadwal.timeStart || "",
                          onChange: (e: any) => {
                            handleNewChange(e);
                            // 💡 TIPS BONUS: Mengisi nama Hari otomatis dari inputan tanggal
                            const dateVal = e.target.value;
                            if (dateVal) {
                              const dayName = new Date(
                                dateVal,
                              ).toLocaleDateString("id-ID", {
                                weekday: "long",
                              });
                              handleNewChange({
                                target: { name: "day", value: dayName },
                              } as any);
                            }
                          },
                          onClick: (e: any) => {
                            e.currentTarget.showPicker();
                          },
                        },
                        {
                          label: "Tanggal dan Jam Berakhir",
                          name: "timeEnd",
                          type: "datetime-local",
                          gridClass: "col-md-6",
                          value: newJadwal.timeEnd || "",
                          onChange: (e: any) => handleNewChange(e),
                          onClick: (e: any) => {
                            e.currentTarget.showPicker();
                          },
                        },
                        {
                          label: "Hari",
                          name: "day",
                          type: "text",
                          gridClass: "col-md-12", // Dilebarkan ke bawah agar rapi
                          value: newJadwal.day || "",
                          placeholder:
                            "Hari otomatis terisi saat memilih tanggal",
                          disabled: true,
                          onChange: (e: any) => handleNewChange(e),
                        },
                      ]}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <LoadingSpinner isLoading={loading} />
                  <TableToolbar
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    pageSize={pagination.pageSize}
                    setPageSize={(size) =>
                      setPagination((old) => ({ ...old, pageSize: size }))
                    }
                  />
                  <DataTable table={table} />
                  <TablePagination table={table} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalEditForm
        title="Edit Data Jadwal Kuliah"
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleSaveEdit}
        fields={[
          {
            label: "Nama Mata Kuliah",
            name: "courseId",
            type: "select",
            value: selectedJadwal.courseId || "",
            options: matkulOptions,
            onChange: (e: any) => handleInputChange(e),
          },
          {
            label: "Ruangan Kuliah",
            name: "room",
            type: "text",
            value: selectedJadwal.room || "",
            onChange: (e: any) => handleInputChange(e),
          },

          {
            label: "Dosen Pengajar",
            name: "lectureId",
            type: "select",
            value: selectedJadwal.lectureId || "",
            options: dosenOptions,
            onChange: (e: any) => handleInputChange(e),
          },

          {
            label: "Tanggal dan Jam Mulai",
            name: "timeStart",
            type: "datetime-local",
            value: formatForDateTimeLocal(selectedJadwal.timeStart ?? ""),
            onChange: (e: any) => handleInputChange(e),
          },
          {
            label: "Tanggal dan Jam Berakhir",
            name: "timeEnd",
            type: "datetime-local",
            value: formatForDateTimeLocal(selectedJadwal.timeEnd ?? ""),
            onChange: (e: any) => handleInputChange(e),
          },
          {
            label: "Hari",
            name: "day",
            type: "text",
            value: selectedJadwal.day || "",
            placeholder: "Hari otomatis terisi",
            disabled: true, // readonly karena diisi otomatis
            onChange: (e: any) => handleInputChange(e),
          },
        ]}
      />
      <ModalConfirmDelete
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleDelete}
        title="Delete"
        message="Apakah anda yakin ingin menghapus data ini?"
      />
    </section>
  );
};

export default JadwalPage;
