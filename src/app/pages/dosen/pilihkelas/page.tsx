"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/src/lib/axiosInstance";

interface Mahasiswa {
  studentId: string;
  studentName: string;
  studentNumber: string;
  studyPlanCourseId: string;
  currentScore: number | null;
  uts: number | null;
  uas: number | null;
  attendance: (string | null)[]; // Array isi 16 status absensi
  assignments: (number | null)[]; // Array isi 5 nilai tugas (task1 - task5)
}

const getMahasiswa = async (
  courseId: string,
  classId: string,
): Promise<Mahasiswa[]> => {
  const res = await api.get(
    `/manage-lectures/courses/${courseId}/class/${classId}`,
  );
  return res.data.data;
};

// 1. API untuk update komponen akademik (Absen, Tugas, UTS, UAS)
const updateAkademikMahasiswa = async (
  studyPlanCourseId: string,
  payload: object,
) => {
  const res = await api.put(
    `/manage-lectures/courses/studyplans/${studyPlanCourseId}`,
    payload,
  );
  return res.data;
};

// 2. API internal kamu untuk menyimpan Nilai Akhir (Score) Utama
const updateScoreMahasiswa = async (
  studyPlanCourseId: string,
  score: number,
) => {
  const res = await api.put(
    `/manage-lectures/studyplans/score/${studyPlanCourseId}`,
    { score: score },
  );
  return res.data;
};

// 🚀 FUNGSI HITUNG NILAI GABUNGAN (Mengadopsi logika GitHub + Huruf Mutu)
const hitungNilaiDanGrade = (mahasiswa: Mahasiswa) => {
  // 1. Absensi (Mendukung case-insensitive "hadir" atau "Hadir")
  const totalHadir = mahasiswa.attendance.filter(
    (status) => status?.toLowerCase() === "hadir",
  ).length;
  const nilaiAbsensi = (totalHadir / 16) * 100;

  // 2. Rata-rata Tugas (Menghitung secara dinamis tugas yang ada)
  const tugasValid = mahasiswa.assignments.filter(
    (t): t is number => t !== null,
  );
  const nilaiTugas =
    tugasValid.length > 0
      ? tugasValid.reduce((a, b) => a + b, 0) / tugasValid.length
      : 0;

  const uts = mahasiswa.uts || 0;
  const uas = mahasiswa.uas || 0;

  // 3. Bobot Nilai dari GitHub (Absen 10%, Tugas 30%, UTS 30%, UAS 30%)
  const totalNilai =
    nilaiAbsensi * 0.1 + nilaiTugas * 0.3 + uts * 0.3 + uas * 0.3;
  const finalScore = Math.round(totalNilai);

  // 4. Konversi Huruf Mutu dari GitHub
  let grade = "E";
  if (finalScore >= 86) grade = "A";
  else if (finalScore >= 78) grade = "A-";
  else if (finalScore >= 70) grade = "B";
  else if (finalScore >= 62) grade = "B-";
  else if (finalScore >= 54) grade = "C";
  else if (finalScore >= 40) grade = "D";

  return { finalScore, grade };
};

const PilihKelasDashboard = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const classId = searchParams.get("classId") || "";

  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [btnLoading, setBtnLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (courseId && classId) {
      const loadMahasiswa = async () => {
        try {
          const data = await getMahasiswa(courseId, classId);
          // Mempertahankan score asli DB jika sudah ada, jika kosong baru hitung default
          const dataWithInitialScore = data.map((m) => ({
            ...m,
            currentScore:
              m.currentScore !== null
                ? m.currentScore
                : hitungNilaiDanGrade(m).finalScore,
          }));
          setMahasiswaList(dataWithInitialScore);
        } catch (error) {
          console.error("Gagal memuat mahasiswa kelas:", error);
        } finally {
          setLoading(false);
        }
      };
      loadMahasiswa();
    }
  }, [courseId, classId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Handler Perubahan Absen Lokal
  const handleAbsenChange = (
    studentId: string,
    pertemuanKe: number,
    isChecked: boolean,
  ) => {
    const statusAbsen = isChecked ? "hadir" : "absen";

    setMahasiswaList((prevList) =>
      prevList.map((m) => {
        if (m.studentId === studentId) {
          const newAttendance = [...m.attendance];
          newAttendance[pertemuanKe - 1] = statusAbsen;
          const updatedMao = { ...m, attendance: newAttendance };
          updatedMao.currentScore = hitungNilaiDanGrade(updatedMao).finalScore;
          return updatedMao;
        }
        return m;
      }),
    );
  };

  // Handler Perubahan Tugas Lokal (ditambah proteksi batas nilai 0 - 100 dari GitHub)
  const handleTugasChange = (
    studentId: string,
    tugasKe: number,
    nilai: string,
  ) => {
    let parsedNilai = nilai === "" ? null : parseInt(nilai, 10);
    if (parsedNilai !== null) {
      parsedNilai = Math.min(100, Math.max(0, parsedNilai)); // Batasi 0 - 100
    }

    setMahasiswaList((prevList) =>
      prevList.map((m) => {
        if (m.studentId === studentId) {
          const newAssignments = [...m.assignments];
          newAssignments[tugasKe - 1] = parsedNilai;
          const updatedMao = { ...m, assignments: newAssignments };
          updatedMao.currentScore = hitungNilaiDanGrade(updatedMao).finalScore;
          return updatedMao;
        }
        return m;
      }),
    );
  };

  // Handler Perubahan Ujian Lokal (ditambah proteksi batas nilai 0 - 100)
  const handleUjianChange = (
    studentId: string,
    fieldName: "uts" | "uas",
    nilai: string,
  ) => {
    let parsedNilai = nilai === "" ? null : parseInt(nilai, 10);
    if (parsedNilai !== null) {
      parsedNilai = Math.min(100, Math.max(0, parsedNilai)); // Batasi 0 - 100
    }

    setMahasiswaList((prevList) =>
      prevList.map((m) => {
        if (m.studentId === studentId) {
          const updatedMao = { ...m, [fieldName]: parsedNilai };
          updatedMao.currentScore = hitungNilaiDanGrade(updatedMao).finalScore;
          return updatedMao;
        }
        return m;
      }),
    );
  };

  // 🚀 ACTION SIMPAN: Menyimpan data akademik dan score otomatis ke database
  const handleSimpanData = async (mahasiswa: Mahasiswa) => {
    setBtnLoading((prev) => ({ ...prev, [mahasiswa.studentId]: true }));

    try {
      const akademikPayload: any = {
        uts: mahasiswa.uts,
        uas: mahasiswa.uas,
      };

      // Map array ke database kolom individual
      mahasiswa.attendance.forEach((status, index) => {
        akademikPayload[`attendance${index + 1}`] = status || "absen";
      });

      mahasiswa.assignments.forEach((nilai, index) => {
        akademikPayload[`task${index + 1}`] = nilai;
      });

      // Menembak kedua API kamu secara pararel
      await Promise.all([
        updateAkademikMahasiswa(mahasiswa.studyPlanCourseId, akademikPayload),
        updateScoreMahasiswa(
          mahasiswa.studyPlanCourseId,
          mahasiswa.currentScore || 0,
        ),
      ]);

      alert(
        `Data & Nilai Akhir ${mahasiswa.studentName} berhasil diamankan ke database! ✅`,
      );
    } catch (error) {
      console.error(error);
      alert("Gagal mengamankan data ke server. ❌");
    } finally {
      setBtnLoading((prev) => ({ ...prev, [mahasiswa.studentId]: false }));
    }
  };

  const filteredMahasiswa = mahasiswaList.filter(
    (m) =>
      m.studentName.toLowerCase().includes(searchQuery) ||
      m.studentNumber.toLowerCase().includes(searchQuery),
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Memuat daftar mahasiswa kelas...</p>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h1>Akademik</h1>
      </div>

      <div className="section-body">
        <h2 className="section-title">Lembar Nilai & Absensi Mahasiswa</h2>
        <p className="section-lead">
          Bobot Nilai: Absen (10%), Tugas (30%), UTS (30%), UAS (30%). Klik
          tombol <strong>Simpan</strong> pada baris mahasiswa untuk memperbarui
          database.
        </p>

        {/* Input Search */}
        <div className="position-relative mb-4">
          <i
            className="fas fa-search position-absolute"
            style={{
              top: "50%",
              left: 15,
              transform: "translateY(-50%)",
              color: "#aaa",
            }}
          />
          <input
            type="text"
            className="form-control pl-5"
            placeholder="Cari nama atau NIM mahasiswa..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th rowSpan={2}>NIM</th>
                <th rowSpan={2}>Nama Mahasiswa</th>
                <th colSpan={16}>Absensi</th>
                <th colSpan={5}>Tugas</th>
                <th rowSpan={2}>UTS</th>
                <th rowSpan={2}>UAS</th>
                <th rowSpan={2}>Nilai Akhir</th>
                <th rowSpan={2}>Huruf Mutu</th> {/* 🚀 Kolom Tambahan */}
                <th rowSpan={2}>Aksi</th>
              </tr>
              <tr>
                {[...Array(16)].map((_, i) => (
                  <th key={`absen${i}`}>{i + 1}</th>
                ))}
                {[...Array(5)].map((_, i) => (
                  <th key={`tugas${i}`}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMahasiswa.length === 0 ? (
                <tr>
                  <td colSpan={28} className="text-center text-muted py-4">
                    Tidak ada mahasiswa terdaftar di kelas mata kuliah ini.
                  </td>
                </tr>
              ) : (
                filteredMahasiswa.map((m) => {
                  // Hitung grade huruf mutu secara live untuk dirender ke UI
                  const { grade } = hitungNilaiDanGrade(m);

                  return (
                    <tr key={m.studentId}>
                      <td className="text-muted">{m.studentNumber}</td>
                      <td className="text-left font-weight-bold">
                        {m.studentName}
                      </td>

                      {/* Loop Absen */}
                      {[...Array(16)].map((_, i) => {
                        const currentStatus = m.attendance[i];
                        const isHadir =
                          currentStatus?.toLowerCase() === "hadir";
                        const isAbsen =
                          currentStatus?.toLowerCase() === "absen";

                        return (
                          <td
                            key={`absen-${m.studentId}-${i}`}
                            className="align-middle"
                          >
                            <input
                              type="checkbox"
                              checked={isHadir}
                              onChange={(e) =>
                                handleAbsenChange(
                                  m.studentId,
                                  i + 1,
                                  e.target.checked,
                                )
                              }
                            />
                            {isAbsen && (
                              <div
                                className="text-danger font-weight-bold"
                                style={{ fontSize: "11px", marginTop: "-3px" }}
                              >
                                X
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Loop Tugas (1-5) */}
                      {[...Array(5)].map((_, i) => (
                        <td key={`tugas-${m.studentId}-${i}`}>
                          <input
                            type="number"
                            className="form-control mx-auto text-center" // Tambah text-center agar rapi di tengah
                            min={0}
                            max={100}
                            style={{ width: 70 }} // 🚀 Diperlebar dari 55 ke 70 agar muat angka 100
                            value={
                              m.assignments[i] !== null
                                ? String(m.assignments[i])
                                : ""
                            }
                            onChange={(e) =>
                              handleTugasChange(
                                m.studentId,
                                i + 1,
                                e.target.value,
                              )
                            }
                          />
                        </td>
                      ))}

                      {/* UTS */}
                      <td>
                        <input
                          type="number"
                          className="form-control mx-auto"
                          min={0}
                          max={100}
                          style={{ width: 65 }}
                          value={m.uts !== null ? String(m.uts) : ""}
                          onChange={(e) =>
                            handleUjianChange(
                              m.studentId,
                              "uts",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* UAS */}
                      <td>
                        <input
                          type="number"
                          className="form-control mx-auto"
                          min={0}
                          max={100}
                          style={{ width: 65 }}
                          value={m.uas !== null ? String(m.uas) : ""}
                          onChange={(e) =>
                            handleUjianChange(
                              m.studentId,
                              "uas",
                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* Nilai Akhir Angka */}
                      <td
                        className="font-weight-bold text-primary"
                        style={{ fontSize: "16px" }}
                      >
                        {m.currentScore !== null ? m.currentScore : "-"}
                      </td>

                      {/* Huruf Mutu (Grade) */}
                      <td
                        className="font-weight-bold text-dark"
                        style={{ fontSize: "16px" }}
                      >
                        {grade}
                      </td>

                      {/* Tombol Simpan Baris */}
                      <td>
                        <button
                          className="btn btn-success btn-sm px-3"
                          disabled={btnLoading[m.studentId]}
                          onClick={() => handleSimpanData(m)}
                        >
                          {btnLoading[m.studentId] ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            "Simpan"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PilihKelasDashboard;
