"use client";
import React, { useState, useEffect } from "react";
import api from "@/app/lib/axiosInstance";
import Cookies from "js-cookie";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Partial<User>>({});
  const [newUsers, setNewUsers] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const users = await getUsers();
    setUsersList(users);
  };

  const handleAddNewUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const saved = await addUsers(newUsers);
      setUsersList((prev) => [...prev, saved]);
      setNewUsers({ name: "", email: "", password: "", role: "" });
      fetchUsers();
    } catch (error: any) {
      console.log(
        "Gagal menambahkan user ==",
        error.response?.data?.message || error.message,
      );
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

    // Intip hasilnya di console
    console.log("DATA YANG BENAR-BENAR BERUBAH:", payload);

    // 4. Jika payload kosong (artinya tidak ada satu pun field yang diubah oleh user)
    if (Object.keys(payload).length === 0) {
      alert("Anda tidak melakukan perubahan data apa pun.");
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
      fetchUsers();
      alert("Perubahan user berhasil disimpan!");
    } catch (error: any) {
      console.log(
        "Gagal menyimpan perubahan user ==",
        error.response?.data?.message || error.message,
      );
    }
  };
  const handleDelete = async (id: string) => {
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
      alert(
        "Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan untuk login!",
      );
      return;
    }

    // 3. Konfirmasi hapus standar jika lolos validasi di atas
    if (!confirm("Apakah anda yakin ingin menghapus data ini?")) return;

    try {
      await deleteUsers(id);
      setUsersList((prev) => prev.filter((users) => users.id !== id));
      fetchUsers();
    } catch (err: any) {
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
        alert(
          "Tidak dapat menghapus data karena masih terhubung dengan data lain",
        );
      }
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
                  data-target="#collapseEditUsers"
                >
                  Tambah User
                </button>
                <div className="collapse" id="collapseEditUsers">
                  <div className="card card-body">
                    <form onSubmit={handleAddNewUser}>
                      <div className="form-group">
                        <label>Nama</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nama"
                          name="name"
                          value={newUsers.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Email"
                          name="email"
                          value={newUsers.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Password"
                          name="password"
                          value={newUsers.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Role <span className="text-danger">*</span>
                        </label>{" "}
                        <select
                          className="form-control"
                          name="role"
                          value={newUsers.role}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="" key="choose">
                            --Pilih Role--
                          </option>
                          <option value="admin" key="admin">
                            Admin
                          </option>
                          <option value="student" key="student">
                            Mahasiswa
                          </option>
                          <option value="lecture" key="lecture">
                            Dosen
                          </option>
                        </select>
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((users, index) => (
                        <tr key={users.id}>
                          <td>{index + 1}</td>
                          <td>{users.name}</td>
                          <td>{users.email}</td>
                          <td>{users.role}</td>
                          <td>
                            {new Date(users.createdAt).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td>
                            <button
                              onClick={() => openEditModal(users)}
                              className="btn btn-icon btn-primary mx-1"
                            >
                              <i className="far fa-edit"></i>
                            </button>
                            <a
                              href="#"
                              className="btn btn-icon btn-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(users.id);
                              }}
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

      {/* Modal Edit Users */}
      {isEditModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editModalLabel">
                  Edit Users
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={closeEditModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveUpdate}>
                  <div className="form-group">
                    <label>Nama</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={selectedUsers.name || ""} // <-- Tambahkan || ""
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={selectedUsers.email || ""} // <-- Tambahkan || ""
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <select
                      className="form-control"
                      name="role"
                      value={selectedUsers.role || ""} // <-- Tambahkan || ""
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">--Pilih Role--</option>
                      <option value="admin">Admin</option>
                      <option value="student">Mahasiswa</option>
                      <option value="lecture">Dosen</option>
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                      onClick={closeEditModal}
                    >
                      Tutup
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End Modal Edit */}
    </section>
  );
};

export default UsersPage;
