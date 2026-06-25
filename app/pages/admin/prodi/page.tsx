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

interface Prodi {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  faculty?: Fakultas;
  createdAt: string;
}
interface Fakultas {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updateAt: string;
}

//API services
const getProdis = async () => {
  const response = await api.get("/majors");
  return response.data.data;
};
const getFaculties = async () => {
  const response = await api.get("/faculties");
  return response.data.data;
};
const addProdis = async (data: {
  name: string;
  code: string;
  facultyId: string;
}) => {
  const response = await api.post("/majors", data);
  return response.data;
};

const updateProdis = async (
  id: string,
  data: { name: string; code: string; facultyId: string },
) => {
  const response = await api.put(`/majors/${id}`, data);
  return response.data;
};
const deleteProdis = async (id: string) => {
  const response = await api.delete(`/majors/${id}`);
  return response.data;
};
const ProdiPage = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      const data = await getProdis();
      setProdiList(data);
    } catch (error) {
      console.log("Gagal mengambil data prodi ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const data = await getFaculties();
      setFacultiList(data);
    } catch (error) {
      console.log("Gagal mengambil data fakultas ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  //ambil data awal
  useEffect(() => {
    fetchProdis();
    fetchFaculties();
  }, []);
  const openEditModal = (prodi: Prodi) => {
    setSelectedProdi(prodi);
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProdi({});
  };

  const handleNewProdiChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewProdi((prev) => ({ ...prev, [name]: value }));
  };

  //create prodi
  const handleAddNewProdi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const saved = await addProdis(newProdi);
      setProdiList((prev) => [...prev, saved]);
      setNewProdi({ name: "", code: "", facultyId: "" });
      showToast("successfully", "success");
      fetchProdis();
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.error("Gagal menambahkan prodi ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  //end of create prodi

  //untuk update
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !selectedProdi.id ||
      !selectedProdi.name ||
      !selectedProdi.code ||
      !selectedProdi.facultyId
    )
      return;
    setLoading(true);
    try {
      const updated = await updateProdis(selectedProdi.id, {
        name: selectedProdi.name,
        code: selectedProdi.code,
        facultyId: selectedProdi.facultyId,
      });
      showToast("successfully", "success");
      fetchProdis();
      closeEditModal();
      setProdiList((prev) =>
        prev.map((prodi) => (prodi.id === updated.id ? updated : prodi)),
      );
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.log("Gagal menyimpan perubahan prodi ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  //end of update

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    try {
      await deleteProdis(deleteTargetId);
      showToast("successfully", "success");
      fetchProdis();
    } catch (err: any) {
      console.error("Gagal delete fakultas:", err);

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
    } finally {
      // Tutup modal dan reset ID target setelah selesai diproses
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setLoading(false); // matikan loading spinner
    }
  };

  //untuk deteksi perubahan  di field modal update
  const handleEditProdiChange = (e: any) => {
    // 1. Cek apakah ini berasal dari select (punya e.value) atau teks biasa (e.target.value)
    const val = e?.target ? e.target.value : e?.value;

    // 2. Jika e.target ada, ambil e.target.name. Jika tidak ada (berarti dari select),
    // kita harus mengirimkan nama field-nya secara manual atau mendeteksinya.
    const name = e?.target ? e.target.name : "facultyId";

    setSelectedProdi((prev: any) => ({
      ...prev,
      [name]: val, // Menggunakan computed property name [] untuk mengubah state secara dinamis
    }));
  };
  // end of perubahan modal update

  const columns = useMemo<ColumnDef<Prodi>[]>(
    () => [
      {
        accessorFn: (row, index) => index + 1,
        header: "#",
      },
      {
        //Mengambil data relasi dari objek bersarang (faculty.name)
        accessorFn: (row) => row.faculty?.name || "-",
        id: "facultyName", // WAJIB menambahkan properti 'id' jika menggunakan accessorFn
        header: "Nama Fakultas",
      },
      {
        accessorKey: "name",
        header: "Nama Prodi",
      },
      {
        accessorKey: "code",
        header: "Kode",
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
          const prodi = row.original; // data asli baris ini
          return (
            <>
              <a
                href="#"
                className="btn btn-icon btn-primary m-1"
                onClick={(e) => {
                  e.preventDefault();
                  openEditModal(prodi); // Mengirim objek prodi ke modal edit
                }}
              >
                <i className="far fa-edit"></i>
              </a>
              <a
                href="#"
                className="btn btn-icon btn-danger"
                onClick={(e) => {
                  e.preventDefault();
                  openDeleteModal(prodi.id); // <-- Panggil fungsi pemembuka modal kustom
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
    data: prodiList,
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

  const facultyOptions = facultiList.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  return (
    <section className="section">
      <div className="section-header">
        <h1>Master</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Master</div>
          <div className="breadcrumb-item">
            <a href="/admin/prodi">Program Studi</a>
          </div>
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
                <button
                  className="btn btn-primary btn-sm mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseTambahProdi"
                >
                  Tambah Prodi
                </button>
                <div className="collapse" id="collapseTambahProdi">
                  <div className="card card-body">
                    <AddForm
                      onSubmit={handleAddNewProdi}
                      collapseTargetId="collapseTambahProdi" // Sesuaikan dengan id target collapse di halaman Prodi Anda
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Nama Fakultas",
                          name: "facultyId",
                          type: "select", //Atur type menjadi 'select'
                          value: newProdi.facultyId,
                          placeholder: "-- Pilih Fakultas --",
                          options: facultyOptions, // Masukkan array opsi yang dibuat di atas
                          onChange: (e: any) => {
                            const val = e?.target ? e.target.value : e?.value;
                            handleNewProdiChange({
                              target: { name: "facultyId", value: val },
                            } as any);
                          },
                        },
                        {
                          label: "Nama Prodi",
                          name: "name",
                          type: "text",
                          value: newProdi.name,
                          placeholder: "Masukkan Nama Program Studi",
                          onChange: (e: any) => handleNewProdiChange(e),
                        },
                        {
                          label: "Kode Prodi",
                          name: "code",
                          type: "text",
                          value: newProdi.code,
                          placeholder: "Masukkan Kode Prodi",
                          onChange: (e: any) => handleNewProdiChange(e),
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  {/* LOADING SPINNER REUSABLE DI SINI */}
                  <LoadingSpinner isLoading={loading} />

                  {/* Search and Pagnation */}
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
                    title="Edit Data Prodi"
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={handleSave}
                    fields={[
                      {
                        label: "Nama Fakultas",
                        name: "facultyId",
                        type: "select",
                        value: selectedProdi?.facultyId || "",
                        placeholder: "-- Pilih Fakultas --",
                        options: facultiList.map((f) => ({
                          value: f.id,
                          label: f.name,
                        })),
                        onChange: handleEditProdiChange, //panggil fungi untuk deteksi perubahan pada feld form
                      },
                      {
                        label: "Nama Prodi",
                        name: "name",
                        type: "text",
                        value: selectedProdi?.name || "",
                        placeholder: "Masukkan Nama Prodi",
                        onChange: handleEditProdiChange, 
                      },
                      {
                        label: "Kode Prodi",
                        name: "code",
                        type: "text",
                        value: selectedProdi?.code || "",
                        placeholder: "Masukkan Kode Prodi",
                        onChange: handleEditProdiChange, 
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProdiPage;
