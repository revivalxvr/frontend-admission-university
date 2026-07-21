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
//Komponen reusable
import DataTable from "@/src/app/components/table/DataTable";
import TableToolbar from "@/src/app/components/table/TableToolbar";
import TablePagination from "@/src/app/components/table/TablePagination";
import AddForm from "@/src/app/components/form/AddForm";
import ModalEditForm from "@/src/app/components/form/EditForm";
import { useToast } from "@/src/app/components/context/ToastContext";
import ModalConfirmDelete from "@/src/app/components/modal/ModalConfirmDelete";
import LoadingSpinner from "@/src/app/components/loading/LoadingSpinner";
interface Fakultas {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updateAt: string;
}
interface Prodi {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  faculty?: Fakultas;
  createdAt: string;
}
interface Dosen {
  faculty: any;
  id: string;
  name: string;
  email: string;
  lectureNumber: number;
  position: string;
  majorId: string;
  major?: Prodi 
  createdAt: string;
  updateAt: string;
}

//start of API Services
const getDosen = async () => {
  const response = await api.get("/lecture");
  return response.data.data;
};

const getProdis = async () => {
  const response = await api.get("/majors");
  return response.data.data;
};

const addDosen = async (data: {
  name: string;
  email: string;
  lectureNumber: number;
  position: string;
  majorId: string;
}) => {
  const response = await api.post("/lecture", data);
  return response.data;
};

const updateDosen = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    lectureNumber?: number;
    position?: string;
    majorId?: string;
  },
) => {
  const response = await api.put(`/lecture/${id}`, data);
  return response.data;
};

const deleteDosen = async (id: string) => {
  const response = await api.delete(`/lecture/${id}`);
  return response.data;
};
// end of API Services
const DosenPage = () => {
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
  const [selectedDosen, setSelectedDosen] = useState<Partial<Dosen>>({});
  const [newDosen, setNewDosen] = useState({
    name: "",
    email: "",
    lectureNumber: 0,
    position: "",
    majorId: "",
  });
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);

  const fetchDosen = async () => {
    setLoading(true);
    try {
      const data = await getDosen();
      setDosenList(data);
    } catch (error) {
      console.log("Gagal mengambil data dosen ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };

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

  useEffect(() => {
    fetchDosen();
    fetchProdis();
  }, []);

  const openEditModal = (dosen: Dosen) => {
    setSelectedDosen(dosen);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedDosen({});
    setIsEditModalOpen(false);
  };
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleAddNewDosen = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const saved = await addDosen(newDosen);
      setDosenList((prev) => [...prev, saved]);
      setNewDosen({
        name: "",
        email: "",
        lectureNumber: 0,
        position: "",
        majorId: "",
      });
      showToast("successfully", "success");
      fetchDosen();
    } catch (error) {
      showToast("terjadi kesalahan", "error");
      console.error("Gagal menambahkan dosen ==", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };

  const handleNewDosenChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewDosen((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSelectedDosen((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!selectedDosen.id) return;
    setLoading(true);
    try {
      const updated = await updateDosen(selectedDosen.id, {
        name: selectedDosen.name,
        email: selectedDosen.email,
        lectureNumber: selectedDosen.lectureNumber,
        position: selectedDosen.position,
        majorId: selectedDosen.majorId,
      });
      setDosenList((prev) =>
        prev.map((dosen) => (dosen.id === updated.id ? updated : dosen)),
      );
      closeEditModal();
      showToast("successfully", "success");
      fetchDosen();
    } catch (error) {
      console.log ("Gagal menyimpan perubahan dosen ==",error);
      showToast("terjadi kesalahan", "error");
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    try {
      await deleteDosen(deleteTargetId);
      showToast("successfully", "success");
      fetchDosen();
    } catch (error: any) {
      showToast("terjadi kesalahan", "error");
      //cek error nya apakah karena  forekey constraint
      const errorData = error.response?.data;
      //cek apa pesan error apa yang di kirim dari backend contoh {"code": "P2003", "message": "Foreign key violation"}
      const errorString = JSON.stringify(errorData || "").toLowerCase();
      if (errorData?.code === "P2003") {
        showToast("data terhubung ke data lain", "error");
        console.log("Gagal menghapus dosen ==", errorString);
        console.log("Gagal menghapus dosen ==", errorData);
      }
    }finally {
      // Tutup modal dan reset ID target setelah selesai diproses
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setLoading(false); // matikan loading spinner
    }  
  };

  const columns = useMemo<ColumnDef<Dosen>[]>(
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
            accessorFn:(row) => row.major?.faculty?.name || "-",
            id:"facultyName",
            header: "Fakultas",
          },
          {
            accessorFn:(row) => row.major?.name || "-",
            id:"majorName",
            header: "Prodi",
          },
            {
            accessorKey: "lectureNumber",
            header: "NIP",
          },
          {
            accessorKey: "position",
            header: "Jabatan",
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
              const dosen = row.original; // data asli baris ini
              return (
                <>
                  <a
                    href="#"
                    className="btn btn-icon btn-primary m-1"
                    onClick={(e) => {
                      e.preventDefault();
                      openEditModal(dosen); // Mengirim objek prodi ke modal edit
                    }}
                  >
                    <i className="far fa-edit"></i>
                  </a>
                  <a
                    href="#"
                    className="btn btn-icon btn-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      openDeleteModal(dosen.id);
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
        data: dosenList,
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
  const prodiOptions = prodiList.map((prodi) => ({
    value: prodi.id,
    label: `${prodi.name} - ${prodi.faculty?.name}`,
  }))
  return (
    <section className="section">
      <div className="section-header">
        <h1>Pengguna</h1>
        <div className="section-header-breadcrumb">
          <div className="breadcrumb-item">Pengguna</div>
          <div className="breadcrumb-item">
            <a href="../pengguna/dosen.html">Dosen</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Dosen</h2>
        <p className="section-lead">
          Menampilkan semua data Dosen yang ada pada universitas ini
        </p>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseEditDosen"
                >
                  Tambah Dosen
                </button>
                <div className="collapse" id="collapseEditDosen">
                  <div className="card card-body">

                     <AddForm
                      onSubmit= {handleAddNewDosen}
                      collapseTargetId="collapseEditDosen"
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Nama",
                          name: "name",
                          type: "text", //Atur type menjadi 'text'
                          value: newDosen.name,
                          placeholder: "Masukkan Nama Dosen",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewDosenChange(e),
                        },
                        {
                          label: "Email",
                          name: "email",
                          type: "text",
                          value: newDosen.email,
                          placeholder: "Masukkan Nama Email",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewDosenChange(e),
                        },
                        {
                          
                          label: "Program Studi",
                          name: "majorId",
                          type: "select",
                          value: newDosen.majorId,
                          options: prodiOptions,
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewDosenChange(e),
                        },
                         {
                          label: "Jabatan",
                          name: "position",
                          type: "text", 
                          value: newDosen.position,
                          placeholder: "Masukkan Jabatan",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleNewDosenChange(e),
                        },
                         {
                          label: "NIP",
                          name: "lectureNumber",
                          type: "number",
                          value: newDosen.lectureNumber,
                          placeholder: "Masukkan NIP",
                          gridClass: "col-md-3",
                          onChange: (e: any) => handleNewDosenChange(e),
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
            title="Edit Data Dosen"
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={handleSave}
                    fields={[
                      {
                        label: "Nama",
                        name: "name",
                        type: "text",
                        value: selectedDosen.name || "",
                        placeholder: "Masukkan Nama Mahasiswa",
                        onChange: (e: any) => handleInputChange(e), //panggil fungi untuk deteksi perubahan pada feld form
                      },
                      {
                        label: "Email",
                        name: "email",
                        type: "text",
                        value: selectedDosen.email || "",
                        placeholder: "Masukkan Email Mahasiswa",
                        onChange: (e: any) => handleInputChange(e)
                      },
                      {
                        label: "Pilih Program Studi",
                        name: "majorId",
                        type: "select",
                        value: selectedDosen.majorId || "",
                        options: prodiOptions,
                        onChange: (e: any) => handleInputChange(e)
                      },
                       {
                        label: "Jabatan",
                        name: "position",
                        type: "text",
                        value: selectedDosen.position || "",
                        placeholder: "Masukkan Angkatan Mahasiswa",
                        onChange: (e: any) => handleInputChange(e)
                      },
                      {
                        label: "NIP Dosen",
                        name: "lectureNumber",
                        type: "number",
                        value: selectedDosen.lectureNumber || "",
                        placeholder: "Masukkan NIP Dosen",
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

export default DosenPage;
