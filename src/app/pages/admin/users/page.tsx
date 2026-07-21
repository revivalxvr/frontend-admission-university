"use client";
import React, { useState, useEffect, useMemo } from "react";
import api from "@/src/app/lib/axiosInstance";
import Cookies from "js-cookie";
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
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

//API services
const getUsers = async () => {
  const res = await api.get("/users");
  return res.data.data;
};
const addUsers = async (data: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}) => {
  const res = await api.post("/users", data);
  return res.data;
};
const updateUsers = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
  },
) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};
const deleteUsers = async (id: string) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
//end of API services

const UsersPage = () => {
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
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Partial<User>>({});
  const [newUsers, setNewUsers] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  // State cadangan murni untuk frontend input
  const [confirmPassword, setConfirmPassword] = useState("");
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsersList(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };

  const handleAddNewUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newUsers.password !== confirmPassword) {
      showToast("password konfirmasi tidak cocok", "error");
      return;
    }
    setLoading(true);
    try {
      const saved = await addUsers(newUsers);
      setUsersList((prev) => [...prev, saved]);
      setNewUsers({ name: "", email: "", password: "", role: "" });
      showToast("successfully", "success");
      fetchUsers();
    } catch (error: any) {
      showToast("terjadi kesalahan", "error");
      console.log(
        "Gagal menambahkan user ==",
        error.response?.data?.message || error.message,
      );
    } finally {
      setLoading(false); // matikan loading spinner
    }
  };
  const handleSaveUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUsers.id) return;

    // 1. Cari data asli user ini di dalam list sebelum dia diedit
    const originalUser = usersList.find((u) => u.id === selectedUsers.id);

    // 2. Buat objek payload kosong
    const payload: any = {};

    // 3. Bandingkan data baru dengan data asli: Hanya masukkan ke payload jika nilai BARU berbeda dengan nilai ASLI
    if (originalUser) {
      if (
        selectedUsers.name !== originalUser.name &&
        selectedUsers.name?.trim() !== ""
      ) {
        payload.name = selectedUsers.name;
      }
      if (
        selectedUsers.email !== originalUser.email &&
        selectedUsers.email?.trim() !== ""
      ) {
        payload.email = selectedUsers.email;
      }
      if (
        selectedUsers.role !== originalUser.role &&
        selectedUsers.role?.trim() !== ""
      ) {
        payload.role = selectedUsers.role;
      }
    }

    // 4. Jika payload kosong (artinya tidak ada satu pun field yang diubah oleh user)
    if (Object.keys(payload).length === 0) {
      showToast("Anda tidak melakukan perubahan data apa pun.", "info");
      closeEditModal(); // Langsung tutup modal tanpa tembak API
      return;
    }

    try {
      // 5. Kirim hanya data yang berubah ke backend
      const updated = await updateUsers(selectedUsers.id, payload);

      setUsersList((prev) =>
        prev.map((users) => (users.id === updated.id ? updated : users)),
      );
      closeEditModal();
      showToast("successfully", "success");
      fetchUsers();
    } catch (error: any) {
      showToast("terjadi kesalahan", "error");
      console.log(
        "Gagal menyimpan perubahan user ==",
        error.response?.data?.message || error.message,
      );
    }
  };
  const handleDelete = async () => {
    if (!deleteTargetId) return;

    const id = deleteTargetId;
    // 1. Ambil ID user yang sedang login dari Cookies
    const currentUserId = Cookies.get("userId") || null;

    // liat ID ini di console browser saat tombol diklik
    console.log("ID Target yang mau dihapus:", id, "Tipe:", typeof id);
    console.log(
      "ID Anda yang sedang login :",
      currentUserId,
      "Tipe:",
      typeof currentUserId,
    );

    // 2. Validasi ketat: Paksa keduanya menjadi String agar tipe datanya seragam
    if (currentUserId && String(id).trim() === String(currentUserId).trim()) {
      showToast("tidak dapat menghapus diri sendiri", "error");
      return;
    }
    setLoading(true);
    try {
      await deleteUsers(id);
      setUsersList((prev) => prev.filter((users) => users.id !== id));
      showToast("successfully", "success");
      fetchUsers();
    } catch (err: any) {
      showToast("terjadi kesalahan", "error");
      console.log(
        "Gagal menghapus user ==",
        err.response?.data?.message || err.message,
      );
      const errorData = err.response?.data;
      const errorString = JSON.stringify(errorData || "").toLowerCase();

      // Cek jika disebabkan oleh Foreign Key Constraint (Prisma P2003)
      if (
        errorData?.code === "P2003" ||
        errorString.includes("foreign key") ||
        errorString.includes("constraint")
      ) {
        showToast(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
          "error",
        );
      }
    } finally {
      // Tutup modal dan reset ID target setelah selesai diproses
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setLoading(false); // matikan loading spinner
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewUsers((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setSelectedUsers((prev) => ({ ...prev, [name]: value }));
  };
  const openEditModal = (users: User) => {
    setSelectedUsers(users);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedUsers({});
    setIsEditModalOpen(false);
  };
  const openDeleteModal = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };
  const columns = useMemo<ColumnDef<User>[]>(
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
        accessorKey: "role",
        header: "Role",
        cell: (info) => {
          const roleText = info.getValue() as string;

          if (!roleText) return "-";

          switch (roleText.toLowerCase()) {
            case "admin":
              return roleText.toUpperCase();
            case "student":
              return "Mahasiswa"; 
            case "lecture":
              return "Dosen";
            default:
              return roleText;
          }
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
          const user = row.original; // data asli baris ini
          return (
            <>
              <a
                href="#"
                className="btn btn-icon btn-primary m-1"
                onClick={(e) => {
                  e.preventDefault();
                  openEditModal(user); // Mengirim objek prodi ke modal edit
                }}
              >
                <i className="far fa-edit"></i>
              </a>
              <a
                href="#"
                className="btn btn-icon btn-danger"
                onClick={(e) => {
                  e.preventDefault();
                  openDeleteModal(user.id);
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
    data: usersList,
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
            <a href="../master/users.html">Users</a>
          </div>
        </div>
      </div>

      <div className="section-body">
        <h2 className="section-title">Users</h2>
        <p className="section-lead">
          Menampilkan semua data Users yang ada pada universitas ini
        </p>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary btn-sm footer-left mb-2"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseUsers"
                >
                  Tambah User
                </button>
                <div className="collapse" id="collapseUsers">
                  <div className="card card-body">
                    <AddForm
                      onSubmit={handleAddNewUser}
                      collapseTargetId="collapseUsers"
                      submitText="Simpan"
                      cancelText="Batal"
                      fields={[
                        {
                          label: "Nama",
                          name: "name",
                          type: "text", //Atur type menjadi 'text'
                          value: newUsers.name,
                          placeholder: "Masukkan Nama User",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleInputChange(e),
                        },
                        {
                          label: "Email",
                          name: "email",
                          type: "text",
                          value: newUsers.email,
                          placeholder: "Masukkan Nama Email",
                          gridClass: "col-md-6",
                          onChange: (e: any) => handleInputChange(e),
                        },
                        {
                          label: "Password",
                          name: "password",
                          type: "text",
                          placeholder: "Masukkan Password",
                          value: newUsers.password,
                          gridClass: "col-md-3",
                          onChange: (e: any) => handleInputChange(e),
                        },
                        {
                          label: "Konfirmasi Password",
                          name: "password_confirmation",
                          type: "text",
                          gridClass: "col-md-3",
                          value: confirmPassword, // Menggunakan state terpisah
                          placeholder: "Masukkan Ulang Password",
                          onChange: (e: any) =>
                            setConfirmPassword(e.target.value),
                        },
                        {
                          label: "Role",
                          name: "role",
                          type: "select",
                          value: newUsers.role,
                          options: [
                            { value: "admin", label: "Admin" },
                            { value: "student", label: "Mahasiswa" },
                            { value: "lecture", label: "Dosen" },
                          ],
                          gridClass: "col-md-3",
                          onChange: (e: any) => handleInputChange(e),
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
        title="Edit Data User"
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleSaveUpdate}
        fields={[
          {
            label: "Nama",
            name: "name",
            type: "text",
            value: selectedUsers.name || "",
            placeholder: "Masukkan Nama User",
            onChange: (e: any) => handleEditInputChange(e), //panggil fungi untuk deteksi perubahan pada feld form
          },
          {
            label: "Email",
            name: "email",
            type: "text",
            value: selectedUsers.email || "",
            placeholder: "Masukkan Email User",
            onChange: (e: any) => handleEditInputChange(e),
          },
          {
            label: "Pilih Role",
            name: "role",
            type: "select",
            value: selectedUsers.role || "",
            options: [
              { value: "admin", label: "Admin" },
              { value: "student", label: "Mahasiswa" },
              { value: "lecture", label: "Dosen" },
            ],
            onChange: (e: any) => handleEditInputChange(e),
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

export default UsersPage;
