"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/lib/axiosInstance";
import Cookies from "js-cookie";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // State objek untuk menampung pesan error per field (Clean & Praktis)
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. Validasi awal di frontend sebelum nembak API
    let currentErrors = { email: "", password: "" };
    if (!email) currentErrors.email = "Email wajib diisi.";
    if (!password) currentErrors.password = "Password wajib diisi.";

    if (currentErrors.email || currentErrors.password) {
      setErrors(currentErrors);
      return;
    }

    // Reset error jika validasi frontend lolos
    setErrors({ email: "", password: "" });

    try {
      const response = await api.post("manage-students/login", {
        email,
        password,
      });
      Cookies.set("token", response.data.data.token, { expires: 1 });
      Cookies.set("email", response.data.data.email, { expires: 1 });
      Cookies.set("userId", response.data.data.id, { expires: 1 });
      router.push("/pages/mahasiswa/dashboard");
    } catch (error: any) {
      // 2. Set error dari API jika salah email/password
      setErrors({
        email: "Periksa kembali alamat email Anda.",
        password: "Password yang Anda masukkan salah.",
      });
      console.log(
        "Gagal login user ==",
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <section className="section">
      <div className="container mt-5">
        <div className="row">
          <div className="col-12 col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4">
            <div className="login-brand">
              <img
                src="/assets/img/stisla-fill.svg"
                alt="logo"
                width={100}
                className="shadow-light rounded-circle"
              />
            </div>
            <div className="card card-primary">
              <div className="card-header">
                <h4>Login Mahasiswa</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleLogin} noValidate>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      // Jika string errors.email terisi, otomatis tambah class is-invalid (kotak jadi merah)
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      autoFocus
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" })); // Bersihkan merah saat mengetik
                      }}
                    />
                    {/* Tampilkan teks kecil merah murni dikontrol oleh React state */}
                    {errors.email && (
                      <div className="invalid-feedback d-block">{errors.email}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <div className="d-block">
                      <label htmlFor="password" className="control-label">
                        Password
                      </label>
                      <div className="float-right">
                        <a href="auth-forgot-password.html" className="text-small">
                          Forgot Password?
                        </a>
                      </div>
                    </div>
                    <input
                      id="password"
                      type="password"
                      // Jika string errors.password terisi, otomatis tambah class is-invalid (kotak jadi merah)
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      name="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: "" })); // Bersihkan merah saat mengetik
                      }}
                    />
                    {/* Tampilkan teks kecil merah murni dikontrol oleh React state */}
                    {errors.password && (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        name="remember"
                        className="custom-control-input"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(!rememberMe)}
                        id="remember-me"
                      />
                      <label className="custom-control-label" htmlFor="remember-me">
                        Remember Me
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-lg btn-block">
                      Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="mt-5 text-muted text-center">
              Don't have an account?{" "}
              <Link href="/pages/auth/dosen/register" className="text-primary">
                Create One
              </Link>
            </div>
            <div className="simple-footer">Copyright © Stisla 2018</div>
          </div>
        </div>
      </div>
    </section>
  );
}