"use client";
import React, { useState, useEffect, useMemo } from "react";

import api from "@/src/app/lib/axiosInstance";
import {
  ColumnDef,
  getSortedRowModel,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import DataTable from "@/src/app/components/table/DataTable";
import TableToolbar from "@/src/app/components/table/TableToolbar";
import TablePagination from "@/src/app/components/table/TablePagination";
import AddForm from "@/src/app/components/form/AddForm";
import ModalEditForm from "@/src/app/components/form/EditForm";
import { useToast } from "@/src/app/components/context/ToastContext";
import ModalConfirmDelete from "@/src/app/components/modal/ModalConfirmDelete";
import LoadingSpinner from "@/src/app/components/loading/LoadingSpinner";
interface Matkul {
  id: string;
  name: string;
  code: string;
  lectureId: string;
  credits: number;
  createdAt: string;
}


//API service
const getDosen = async () => {
  const response = await api.get("/lecture");
  return response.data.data;
};
const getMatkul = async () => {
  const response = await api.get("/courses");
  return response.data.data;
};
const addMatkul = async (data: {
  name: string;
  code: string;
  lectureId: string;
  credits: number;
}) => {
  const response = await api.post("/courses", data);
  return response.data;
};
const updateMatkul = async (
  id: string,
  data: {
    name: string;
    code: string;
    lectureId: string;
    credits: number;
  },
) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
};
const deleteMatkul = async (id: string) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

//end of API services
const MatkulPage = () => {
  //buat state
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

  const [selectedMatkul, setSelectedMatkul] = useState<Partial<Matkul>>({});

  const [matkulList, setMatkulList] = useState<Matkul[]>([]);
 

  const [newMatkul, setNewMatkul] = useState({
    name: "",
    code: "",
    lectureId: "",
    credits: 0,
  });
  //end of state

  //ambil data awal menggunakan useEffect
  useEffect(() => {
    fetchMatkul();

  }, []);

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

  const handleAddNewMatkul = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      setLoading(true);
    try {
      const res = await addMatkul(newMatkul);
      setMatkulList((prev) => [...prev, res]);
      setNewMatkul({ name: "", code: "", lectureId: "", credits: 0 });
      showToast("successfully", "success");
      fetchMatkul();
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.log("Gagal menambahkan matkul ==", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewMatkul((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedMatkul((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMatkul.id) return;
      setLoading(true);
    try {
      const res = await updateMatkul(selectedMatkul.id, {
        name: selectedMatkul.name ?? "",
        code: selectedMatkul.code ?? "",
        lectureId: selectedMatkul.lectureId ?? "",
        credits: selectedMatkul.credits ?? 0,
      });
      setMatkulList((prev) =>
        prev.map((matkul) => (matkul.id === res.id ? res : matkul)),
      );
       closeEditModal();
      showToast("successfully", "success");
      fetchMatkul();
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.log("Gagal mengupdate matkul ==", error);
    } finally {
      setLoading(false);
    }
  };
  const openEditModal = (matkul: Matkul) => {
    setSelectedMatkul(matkul);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedMatkul({});
    setIsEditModalOpen(false);
  };
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
      setLoading(true);
    try {
      await deleteMatkul(id);
      setMatkulList((prev) => prev.filter((matkul) => matkul.id !== id));
      showToast("successfully", "success");
      fetchMatkul();
    } catch (error: any) {
      //cek error nya apakah karena  forekey constraint
      const errorData = error.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
      if (errorData?.code === "P2003") {
        showToast("data terhubung ke data lain", "error");
        console.log("Gagal menghapus matkul ==", errorString);
        console.log("Gagal menghapus matkul ==", errorData);
      } else {
        showToast("terjadi kesalahan", "error");
        console.log("Gagal menghapus matkul ==", error);
      }
      
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setLoading(false);
    }
  };
  const columns = useMemo<ColumnDef<Matkul>[]>(
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
        header: "Kode Mata Kuliah",
      },
      {
        accessorKey: "credits",
        header: "Total SKS",
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
          const matkul = row.original; // data asli baris ini
          return (
            <>
              <a
                href="#"
                className="btn btn-icon btn-primary m-1"
                onClick={(e) => {
                  e.preventDefault();
                  openEditModal(matkul); // Mengirim objek prodi ke modal edit
                }}
              >
                <i className="far fa-edit"></i>
              </a>
              <a
                href="#"
                className="btn btn-icon btn-danger"
                onClick={(e) => {
                  e.preventDefault();
                  openDeleteModal(matkul.id);
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
    data: matkulList,
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
        <h1>Akademik</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Akademik</div>
          <div className="breadcrumb-item">
            <a href="/admin/akademik/matkul">Mata Kuliah</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Mata Kuliah</h2>
        <p className="section-lead">
          Menampilkan semua data Mata Kuliah yang ada pada universitas ini
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
                  Tambah Mata Kuliah
                </button>
                <div className="collapse" id="collapseEditMatkul">
                  <div className="card card-body">
                     <AddForm
                      onSubmit={handleAddNewMatkul}
                      collapseTargetId="collapseEditMatkul"
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Nama Mata Kuliah",
                          name: "name",
                          type: "text", //Atur type menjadi 'text'
                          value: newMatkul.name,
                          placeholder: "Masukkan Nama Mata Kuliah",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewChange(e),
                        },
                        {
                          label: "Kode Mata Kuliah",
                          name: "code",
                          type: "text",
                          value: newMatkul.code,
                          placeholder: "Masukkan Kode Mata Kuliah",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewChange(e),
                        },
                        {
                          label: "Total SKS",
                          name: "credits",
                          type: "number",
                          value: newMatkul.credits,
                          placeholder: "Masukkan Total SKS",
                          gridClass: "col-md-6",
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
        title="Edit Data Mata Kuliah"
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleSaveEdit}
        fields={[
          {
            label: "Nama",
            name: "name",
            type: "text",
            value: selectedMatkul.name || "",
            placeholder: "Masukkan Nama Mata Kuliah",
            onChange: (e: any) => handleInputChange(e), //panggil fungi untuk deteksi perubahan pada feld form
          },
          {
            label: "Code",
            name: "code",
            type: "text",
            value: selectedMatkul.code || "",
            placeholder: "Masukkan Code Mata Kuliah",
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

export default MatkulPage;
