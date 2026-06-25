"use client";
import api from "@/app/lib/axiosInstance";
import React, { useState, useEffect, useMemo } from "react";
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

interface Fakultas {
  id: string;
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
  id: string,
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

const deleteFacultas = async (id: string) => {
  const response = await api.delete(`/faculties/${id}`);
  return response.data;
};
const FakultasPage = () => {
  const { showToast } = useToast(); // Ekstrak fungsi showToast

  const [faculties, setFaculties] = useState<Fakultas[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [selectedFaculties, setSelectedFaculties] = useState<Fakultas | null>(
    null,
  );

  //State input/edit
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // State untuk search, sorting, pagination
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  //Generate code otomatis dari nama
  const generateCode = (nameFakultas: string) => {
    if (!nameFakultas) return "";
    return nameFakultas
      .split(" ") //pisa perkata
      .map((kata) => kata[0]?.toUpperCase()) //ambil huruf pertama perkata
      .join(""); //misal 'fakultas teknologi informasi' => 'FTI'
  };

  const handleNameChange = (e: any) => {
    const value = e?.target?.value || "";
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
    setLoading(true);
    await addFacultas({ name: name, code: code });
    setName("");
    setCode("");
    showToast("successfully", "success");
    fetchFakultas();
  };
  //edit
  const openEditModal = (fakultas: Fakultas) => {
    setSelectedFaculties(fakultas);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedFaculties(null);
    setIsEditModalOpen(false);
  };

 const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!selectedFaculties) return;

  // 1. Nyalakan loading spinner sebelum menembak API
  setLoading(true); 

  try {
    // Jalankan fungsi update ke backend
    await updateFacultas(selectedFaculties.id, {
      name: selectedFaculties.name,
      code: selectedFaculties.code,
    });
    
    // 2. Tampilkan pesan sukses lewat Toast kustom
    showToast("successfully", "success");
    
    closeEditModal();
    fetchFakultas();
  } catch (error) {
    // 3. Tampilkan pesan gagal jika ada kendala jaringan/database
    showToast("Gagal memperbarui data fakultas.", "error");
  } finally {
    // 4. Matikan loading spinner di blok finally (baik sukses maupun gagal)
    setLoading(false); 
  }
};
  //hapus
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteFacultas(deleteTargetId);
      showToast("successfully", "success");
      fetchFakultas();
    } catch (err: any) {
      //cek error nya apakah karena  forekey constraint
      const errorData = err.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
          if (errorData?.code === "P2003") {
            showToast(
              "tidak dapat dihapus karena masi terhubung dengan data lain",
              "error",
            );
          } else {
            showToast("terjadi kesalahan saat menghapus data", "error");
          }
    } finally {
      // Tutup modal dan reset ID target setelah selesai diproses
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };
  // Columns untuk TanStack Table
  const columns = useMemo<ColumnDef<Fakultas>[]>(
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
          const fakultas = row.original; // data asli baris ini
          return (
            <>
              <a
                href="#"
                className="btn btn-icon btn-primary m-1"
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
                  openDeleteModal(fakultas.id); // <-- Panggil fungsi pemembuka modal kustom
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
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Inisialisasi table
  const table = useReactTable({
    data: faculties,
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

                {/* IMPLEMENTASI ADD FORM KOMPONEN REUSABLE */}
                <div className="collapse" id="collapseTambahFakultas">
                  <div className="card card-body">
                    <AddForm
                      onSubmit={handleSubmit}
                      collapseTargetId="collapseTambahFakultas"
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Nama Fakultas",
                          name: "name",
                          type: "text",
                          value: name,
                          placeholder: "Masukkan Nama Fakultas",
                          onChange: handleNameChange,
                        },
                        {
                          label: "Kode Fakultas",
                          name: "code",
                          type: "text",
                          value: code,
                          placeholder: "Kode Fakultas Otomatis",
                          disabled: true,
                          onChange: () => {},
                        },
                      ]}
                    />
                  </div>
                </div>

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

                {/* Modal Edit Data Fakultas */}
                <ModalEditForm
                  title="Edit Data Fakultas"
                  isOpen={isEditModalOpen}
                  onClose={closeEditModal}
                  onSubmit={handleEditSubmit}
                  fields={[
                    {
                      label: "Nama Fakultas",
                      name: "name",
                      type: "text",
                      placeholder: "Masukkan Nama Fakultas",
                      value: selectedFaculties?.name || "",
                      onChange: (e: any) =>
                        setSelectedFaculties((prev: any) => ({
                          ...prev,
                          name: e.target.value,
                        })),
                    },
                    {
                      label: "Kode Fakultas",
                      name: "code",
                      type: "text",
                      value: selectedFaculties?.code || "",
                      disabled: true, // Karena kodenya otomatis ter-generate
                      onChange: () => {},
                    },
                  ]}
                />

                <ModalConfirmDelete
                  isOpen={isDeleteModalOpen}
                  onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTargetId(null);
                  }}
                  onConfirm={handleConfirmDelete}
                  title="Delete"
                  message="Apakah anda yakin ingin menghapus data ini?"
                />
                {/* LOADING SPINNER REUSABLE DI SINI */}
                <LoadingSpinner isLoading={loading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FakultasPage;
