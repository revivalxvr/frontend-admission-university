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
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row, index) => index + 1,
        header: "#",
      },
      {
        id: "courseName",
        header: "Mata Kuliah",
        accessorFn: (row) => row.course?.name || "-",
      },
      {
        id: "className",
        header: "Kelas",
        accessorFn: (row) => row.class?.name || "-",
      },
      {
        id: "majorName",
        header: "Program Studi",
        accessorFn: (row) => row.class?.major?.name || "-",
      },
      {
        accessorKey: "day",
        header: "Hari",
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
        id: "facultyName",
        header: "Fakultas",
        accessorFn: (row) => row.class?.major?.faculty?.name || "-",
      },
      {
        id: "lectureName",
        header: "Dosen",
        accessorFn: (row) => row.course?.lecture?.name || "-",
      },
      {
        id: "yearName",
        header: "Tahun Ajaran",
        accessorFn: (row) => row.class?.year?.name || "-",
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
  const kelasOptions = kelasList.map((kelas) => ({
    value: String(kelas.id),
    label: kelas.name,
  }));

  const matkulOptions = matkulList.map((matkul) => ({
    value: String(matkul.id),
    label: matkul.name,
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
                      collapseTargetId="collapseEditMatkul" // Sesuaikan dengan ID target collapse halaman Jadwal Anda
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Kelas",
                          name: "classId",
                          type: "select",
                          gridClass: "col-md-6", // Berdampingan dengan Mata Kuliah
                          value: newJadwal.classId || "",
                          placeholder: "-- Pilih Kelas --",
                          options: kelasOptions,
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
                          gridClass: "col-md-6", // Berdampingan dengan Kelas
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
                          label: "Tanggal dan Jam Mulai",
                          name: "timeStart",
                          type: "datetime-local", // Tipe datetime HTML5 bawaan Anda
                          gridClass: "col-md-6", // Berdampingan dengan Jam Berakhir
                          value: newJadwal.timeStart || "",
                          onChange: (e: any) => handleNewChange(e),
                          onClick: (e: any) => {
                            e.currentTarget.showPicker();
                          },
                        },
                        {
                          label: "Tanggal dan Jam Berakhir",
                          name: "timeEnd",
                          type: "datetime-local",
                          gridClass: "col-md-6", // Berdampingan dengan Jam Mulai
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
                          gridClass: "col-md-6", 
                          value: newJadwal.day || "",
                          placeholder: "Hari otomatis terisi",
                          disabled: true, // readonly karena diisi otomatis
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
            name: "name",
            type: "select",
            value: selectedJadwal.courseId|| "",
            options: matkulOptions,
            onChange: (e: any) => handleInputChange(e), //panggil fungi untuk deteksi perubahan pada feld form
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
