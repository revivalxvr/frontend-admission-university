"use client";
import React, { useState, useEffect, useMemo } from "react";
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

//Komponen reusable
import DataTable from "@/app/components/table/DataTable";
import TableToolbar from "@/app/components/table/TableToolbar";
import TablePagination from "@/app/components/table/TablePagination";
import AddForm from "@/app/components/form/AddForm";
import ModalEditForm from "@/app/components/form/EditForm";
import { useToast } from "@/app/components/context/ToastContext";
import ModalConfirmDelete from "@/app/components/modal/ModalConfirmDelete";
import LoadingSpinner from "@/app/components/loading/LoadingSpinner";
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
};
const MahasiswaPage = () => {
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
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<
    Partial<Mahasiswa>
  >({});
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
    setLoading(true);
    try {
      const data = await getMahasiswa();
      setMahasiswaList(data);
    } catch (error) {
      console.error("Error fetching mahasiswa:", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  const fetchGolUkt = async () => {
    setLoading(true);
    try {
      const data = await getGolUkt();
      setGolUktList(data);
    } catch (error) {
      console.error("Error fetching gol ukt:", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  const fetchKelas = async () => {
    setLoading(true);
    try {
      const data = await getKelas();
      setKelasList(data);
    } catch (error) {
      console.error("Error fetching kelas:", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  //ambil data awal
  useEffect(() => {
    fetchMahasiswa();
    fetchGolUkt();
    fetchKelas();
  }, []);

  const openEditModal = (mahasiswa: Mahasiswa) => {
    setSelectedMahasiswa(mahasiswa);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedMahasiswa({});
    setIsEditModalOpen(false);
  };
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedMahasiswa((prev) => ({ ...prev, [name]: value }));
  };
  const handleNewMahasiswaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewMahasiswa((prev) => ({ ...prev, [name]: value }));
  };

  //untuk update di modal
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMahasiswa.id) return;
    setLoading(true);
    try {
      const updated = await updateMahasiswa(selectedMahasiswa.id, {
        name: selectedMahasiswa.name ?? "",
        email: selectedMahasiswa.email ?? "",
        semester: selectedMahasiswa.semester ?? 0,
        classOf: selectedMahasiswa.classOf ?? 0,
        tfGroupId: selectedMahasiswa.tfGroupId ?? "",
        classId: selectedMahasiswa.classId ?? "",
      });
      setMahasiswaList((prev) =>
        prev.map((mahasiswa) =>
          mahasiswa.id === updated.id ? updated : mahasiswa,
        ),
      );
      closeEditModal();
      fetchMahasiswa();
    } catch (error) {
      console.log("Gagal menyimpan perubahan mahasiswa ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };

  const handleAddNewMahasiswa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addMahasiswa(newMahasiswa);
      setMahasiswaList((prev) => [...prev, res]);
      setNewMahasiswa({
        name: "",
        email: "",
        semester: 0,
        classOf: 0,
        tfGroupId: "",
        classId: "",
      });
      showToast("successfully", "success");
      fetchMahasiswa();
    } catch (error) {
      console.log("Gagal menyimpan mahasiswa baru ==", error);
      showToast("terjadi kesalahan", "error");
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    try {
      await deleteMahasiswa(deleteTargetId);
      fetchMahasiswa();
      showToast("successfully", "success");
    } catch (err: any) {
      console.error("Gagal delete kelas:", err);
      showToast("terjadi kesalahan", "error");
      const errorData = err.response?.data;
      const errorStatus = err.response?.status; // Mengambil status code (misal: 500)
      const errorString = JSON.stringify(errorData || "").toLowerCase();

      // 1. Cek jika disebabkan oleh Foreign Key Constraint (Prisma P2003)
      if (
        errorData?.code === "P2003" ||
        errorString.includes("foreign key") ||
        errorString.includes("constraint")
      ) {
       showToast("data terhubung ke data lain", "error");
      }
      // 2. Jaring pengaman jika backend crash / Error 500
      else if (errorStatus === 500) {
        showToast("terjadi kesalahan", "error");
      } 
    }finally {
      // Tutup modal dan reset ID target setelah selesai diproses
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setLoading(false); // matikan loading spinner
    }   
  };
    const columns = useMemo<ColumnDef<Mahasiswa>[]>(
      () => [
        {
          accessorFn: (row, index) => index + 1,
          header: "#",
        },
        {
          accessorKey: "name",
          header: "Nama",
        },
        {
          accessorKey: "email",
          header: "Email",
        },
         {
          accessorFn:(row) => row.class?.major?.faculty?.name || "-",
          id:"facultyName",
          header: "Fakultas",
        },
        {
          accessorFn:(row) => row.class?.major?.name || "-",
          id:"majorName",
          header: "Prodi",
        },
          {
          accessorKey: "studentNumber",
          header: "NIM",
        },
        {
          accessorFn:(row) => row.tfGroup?.group || "-",
          id:"golUkt",
          header: "Golongan Ukt",
        },
         {
          accessorFn:(row) => row.class?.name || "-",
          id:"className",
          header: "Kelas",
        },
      
         {
          accessorKey: "semester",
          header: "Semester",
        },
         {
          accessorKey: "classOf",
          header: "Angkatan",
        },
        {
          accessorKey: "createdAt",
          header: "Dibuat pada",
          cell: (info) =>
            new Date(info.getValue() as string).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
        },
        {
          header: "Aksi",
          cell: ({ row }) => {
            const mahasiswa = row.original; // data asli baris ini
            return (
              <>
                <a
                  href="#"
                  className="btn btn-icon btn-primary m-1"
                  onClick={(e) => {
                    e.preventDefault();
                    openEditModal(mahasiswa); // Mengirim objek prodi ke modal edit
                  }}
                >
                  <i className="far fa-edit"></i>
                </a>
                <a
                  href="#"
                  className="btn btn-icon btn-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    openDeleteModal(mahasiswa.id);
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
      data: mahasiswaList,
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
    const golUktOptions = golUktList.map((k) => ({
    value: k.id,
    label: k.group,
    }));
    const majorOptions = kelasList.map((kelas) => ({
      value: kelas.id,
      label: `${kelas.name} (${kelas.major?.name || ""})`,
      }));
  
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
                  data-target="#collapseTambahMahasiswa"
                >
                  Tambah Mahasiswa
                </button>
                <div className="collapse" id="collapseTambahMahasiswa">
                  <div className="card card-body">
                    {/* <form
                      action="#"
                      method="POST"
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
                            value={newMahasiswa.semester}
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
                            value={newMahasiswa.classOf}
                            onChange={handleNewMahasiswaChange}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Kelas</label>
                          <select
                            className="form-control"
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
                    </form> */}
                     <AddForm
                      onSubmit={handleAddNewMahasiswa}
                      collapseTargetId="collapseTambahMahasiswa"
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Nama",
                          name: "name",
                          type: "text", //Atur type menjadi 'text'
                          value: newMahasiswa.name,
                          placeholder: "Masukkan Nama Prodi",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewMahasiswaChange(e),
                        },
                        {
                          label: "Email",
                          name: "email",
                          type: "text",
                          value: newMahasiswa.email,
                          placeholder: "Masukkan Nama Email",
                          gridClass: "col-md-6",
                         onChange: (e: any) => handleNewMahasiswaChange(e),
                        },
                        {
                          
                          label: "Semester",
                          name: "semester",
                          type: "number",
                          value: newMahasiswa.semester,
                          placeholder: "Masukkan Semester",
                          gridClass: "col-md-3",
                          onChange: (e: any) => handleNewMahasiswaChange(e),
                        },
                         {
                          label: "Angkatan",
                          name: "classOf",
                          type: "number",
                          value: newMahasiswa.classOf,
                          placeholder: "Masukkan Angkatan",
                          gridClass: "col-md-3",
                          onChange: (e: any) => handleNewMahasiswaChange(e),
                        },
                         {
                          label: "Pilih Golongan UKT",
                          name: "tfGroupId",
                          type: "select", 
                          value: newMahasiswa.tfGroupId,
                          options: golUktOptions,
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewMahasiswaChange(e),
                        },
                         {
                          label: "Pilih Kelas",
                          name: "classId",
                          type: "select", //Atur type menjadi 'select'
                          value: newMahasiswa.classId,
                          options: majorOptions,
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewMahasiswaChange(e),
                        },
                      ]}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                   <LoadingSpinner isLoading={loading} />
                  {/* Table toolbar */}
                    <TableToolbar
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    pageSize={pagination.pageSize}
                    setPageSize={(size) =>
                      setPagination((old) => ({ ...old, pageSize: size }))
                    }
                  />
                  {/* Table */}
                  <DataTable table={table} />
                  {/* Pagination */}
                  <TablePagination table={table} />
                  
                    <ModalEditForm
                    title="Edit Data Mahasiswa"
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={handleSave}
                    fields={[
                      {
                        label: "Nama",
                        name: "name",
                        type: "text",
                        value: selectedMahasiswa?.name || "",
                        placeholder: "Masukkan Nama Mahasiswa",
                        onChange: (e: any) => handleInputChange(e), //panggil fungi untuk deteksi perubahan pada feld form
                      },
                      {
                        label: "Email",
                        name: "email",
                        type: "text",
                        value: selectedMahasiswa?.email || "",
                        placeholder: "Masukkan Email Mahasiswa",
                        onChange: (e: any) => handleInputChange(e)
                      },
                      {
                        label: "Semester",
                        name: "semester",
                        type: "number",
                        value: selectedMahasiswa?.semester || "",
                        placeholder: "Masukkan Semester Mahasiswa",
                        onChange: (e: any) => handleInputChange(e)
                      },
                       {
                        label: "Angkatan",
                        name: "classOf",
                        type: "number",
                        value: selectedMahasiswa?.classOf || "",
                        placeholder: "Masukkan Angkatan Mahasiswa",
                        onChange: (e: any) => handleInputChange(e)
                      },
                      {
                        label: "Pilih Golongan UKT",
                        name: "tfGroupId",
                        type: "select",
                        value: selectedMahasiswa?.tfGroupId || "",
                        options: golUktOptions,
                        placeholder: "Pilih Fakultas",
                        onChange: (e: any) => handleInputChange(e),
                      },
                      {
                        label: "Pilih Kelas",
                        name: "classId",
                        type: "select",
                        value: selectedMahasiswa?.classId || "",
                        options: majorOptions,
                        onChange: (e: any) => handleInputChange(e),
                      }
                    
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </section>
  );
};

export default MahasiswaPage;
