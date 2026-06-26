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

interface TahunAjaran {
  id: string; //bisa undifined saat pertama kali di tambahkan jadi "?"
  name: string;
  dateStart: string;
  dateEnd: string;
  status: boolean;
  createdAt: string;
}

const TahunAjaranPage = () => {
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
  const [data, setData] = useState<TahunAjaran[]>([]);

  const [newTahun, setNewTahun] = useState({
    name: "",
    dateStart: "",
    dateEnd: "",
    status: false,
    createdAt: "",
  });
  const [selectedEdit, setSelectedEdit] = useState<Partial<TahunAjaran>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  //API services CRUD
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/years");
      setData(res.data.data);
    } catch (error) {
      console.log("Gagal Fetching data tahun ajaran ==", error);
    }finally {
      setLoading(false); // matikan loading spinner
    }
  };

  const addYear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/years", newTahun);
      setData((prev) => [...prev, res.data.data]);
      setNewTahun({
        name: "",
        dateStart: "",
        dateEnd: "",
        status: false,
        createdAt: "",
      });
      showToast("successfully", "success");
      fetchData();
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.log("Gagal menambahkan tahun ajaran ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };

 

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!selectedEdit || selectedEdit.id === undefined) return;
    try {
      const res = await api.put(`/years/${selectedEdit.id}`, selectedEdit);
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedEdit?.id ? res.data.data : item,
        ),
      );
      setSelectedEdit({});
      setIsEditModalOpen(false);
      showToast("successfully", "success");
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.log("Gagal menyimpan perubahan tahun ajaran ==", error);
    }
    finally {
      setLoading(false); // matikan loading spinner
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    try {
      await api.delete(`/years/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      setIsDeleteModalOpen(false);
      showToast("successfully", "success");
    } catch (error: any) {
      //cek error nya apakah karena  forekey constraint
      const errorData = error.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
      if (errorData?.code === "P2003") {
       showToast(
         "data terhubung dengan data lain",
         "error",
       )
        console.log("Gagal menghapus tahun ajaran ==", errorString);
        console.log("Gagal menghapus tahun ajaran ==", errorData);
      }
      showToast("terjadi kesalahan", "error");
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const openEditModal = (tahunAjaran: TahunAjaran) => {
    setSelectedEdit(tahunAjaran);
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEdit({});
  };
  const columns = useMemo<ColumnDef<TahunAjaran>[]>(
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
        accessorKey: "dateStart",
        header: "Tanggal Mulai",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
      },
      {
        accessorKey: "dateEnd",
        header: "Tanggal Berakhir",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
      },
      {
        accessorKey: "status",
        header: "Status",
        //Mengubah boolean menjadi Badge berwarna
        cell: (info) => {
          const isStatusActive = info.getValue() as boolean;
          return isStatusActive ? (
            <span className="badge badge-success">Aktif</span>
          ) : (
            <span className="badge badge-danger">Tidak Aktif</span>
          );
        },
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
          const tahunAjaran = row.original; // data asli baris ini
          return (
            <>
              <a
                href="#"
                className="btn btn-icon btn-primary m-1"
                onClick={(e) => {
                  e.preventDefault();
                  openEditModal(tahunAjaran); // Mengirim objek prodi ke modal edit
                }}
              >
                <i className="far fa-edit"></i>
              </a>
              <a
                href="#"
                className="btn btn-icon btn-danger"
                onClick={(e) => {
                  e.preventDefault();
                  openDeleteModal(tahunAjaran.id);
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
    data: data,
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
  // Mengubah format tanggal menjadi YYYY-MM-DD
  const formatDateToInput = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  // Mengambil 10 karakter pertama (YYYY-MM-DD) jika formatnya ISO atau standard datetime
  return dateString.substring(0, 10);
  };
  //end of format date

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
                    <AddForm
                      onSubmit={addYear}
                      collapseTargetId="collapseTambahTahunAjaran" // Sesuaikan dengan id target collapse di halaman Tahun Ajaran Anda
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Nama Tahun Ajaran",
                          name: "name",
                          type: "text",
                          value: newTahun.name,
                          placeholder: "Contoh: 2025/2026 Ganjil",
                          onChange: (e: any) =>
                            setNewTahun({ ...newTahun, name: e.target.value }),
                        },
                        {
                          label: "Tanggal Dimulai",
                          name: "dateStart",
                          type: "date", // Menggunakan tipe HTML5 date picker
                          value: newTahun.dateStart,
                          placeholder: "",
                          onChange: (e: any) =>
                            setNewTahun({
                              ...newTahun,
                              dateStart: e.target.value,
                            }),
                        },
                        {
                          label: "Tanggal Berakhir",
                          name: "dateEnd",
                          type: "date", // Menggunakan tipe HTML5 date picker
                          value: newTahun.dateEnd,
                          placeholder: "",
                          onChange: (e: any) =>
                            setNewTahun({
                              ...newTahun,
                              dateEnd: e.target.value,
                            }),
                        },
                        {
                          label: "Apakah Aktif",
                          name: "status",
                          type: "checkbox", // Menggunakan tipe checkbox
                          value: newTahun.status,
                          placeholder: "Aktif",
                          onChange: (e: any) =>
                            setNewTahun({
                              ...newTahun,
                              status: e.target.checked,
                            }),
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="table-responsive">
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
                </div>

                {/* Modal Edit */}
                    <ModalEditForm
                    title="Edit Data Tahun Ajaran"
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={saveEdit}
                    fields={[
                      {
                        label: "Nama",
                        name: "name",
                        type: "text",
                        value: selectedEdit?.name || "",
                        placeholder: "Masukkan Nama Tahun Ajaran",
                        onChange: (e: any) => {
                          setSelectedEdit({
                            ...selectedEdit,
                            name: e.target.value,
                          })
                        },
                      },
                      {
                        label: "Tanggal Dimulai",
                        name: "dateStart",
                        type: "date",
                        value: formatDateToInput(selectedEdit?.dateStart), //panggil function format date
                        placeholder: "Masukkan Tanggal Dimulai",
                        onChange: (e: any) => {
                          setSelectedEdit({
                            ...selectedEdit,
                            dateStart: e.target.value,
                          })
                        },
                      },
                      {
                        label: "Tanggal Berakhir",
                        name: "dateEnd",
                        type: "date",
                        value: formatDateToInput(selectedEdit?.dateEnd), //panggil function format date
                        placeholder: "Masukkan Tanggal Berakhir",
                        onChange: (e: any) => {
                          setSelectedEdit({
                            ...selectedEdit,
                            dateEnd: e.target.value,
                          })
                        },
                      },
                      {
                        label: "Apakah Aktif",
                        name: "status",
                        type: "checkbox",
                        value: selectedEdit?.status || false,
                        placeholder: "Apakah Aktif",
                        onChange: (e: any) => {
                          setSelectedEdit({
                            ...selectedEdit,
                            status: e.target.checked,
                          })
                        },
                      },
                    ]}
                  />
                {/* End Modal */}

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
    </section>
  );
};

export default TahunAjaranPage;
