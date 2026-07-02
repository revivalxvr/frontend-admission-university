"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axiosInstance";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  //state form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    let currentErrors = { name: "", email: "", password: "" };
    if (!name) currentErrors.name = "Name wajib diisi.";
    if (!email) currentErrors.email = "Email wajib diisi.";
    if (!password) currentErrors.password = "Password wajib diisi.";

    if (currentErrors.email || currentErrors.password) {
      setErrors(currentErrors);
      return;
    }
      setErrors({ name : "", email: "", password: "" });
   try {
      const response = await api.post("/manage-lectures/register", {
        name,
        email,
        password,
        role: "lecture",
      });
      console.log("Register berhasil:", response.data);
      router.push("/pages/auth/dosen/login");
    } catch (error) {
      console.error("Register gagal:", error);
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
                <h4>Register Dosen</h4>
              </div>
              <div className="card-body">
                <form
                  onSubmit={handleRegister}
                  className="needs-validation"
                  noValidate
                >
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      name="name"
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                    />
                    <div className="invalid-feedback">
                      Please fill in your name
                    </div>
                  </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                    />
                    <div className="invalid-feedback">
                      Please fill in your email
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      name="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">
                        Please fill in your password
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-block"
                    >
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
             <div className="mt-5 text-muted text-center">
              Already have an account?{" "}
              <Link href="/pages/auth/dosen/login" className="text-primary">
                Login Here
              </Link>
            </div>
            <div className="simple-footer">Copyright © Stisla 2018</div>
          </div>
        </div>
      </div>
    </section>
  );
}
