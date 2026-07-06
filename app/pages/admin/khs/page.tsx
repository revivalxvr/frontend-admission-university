"use client";
import React, { useState, useEffect } from "react";
// import MyBarChart from '../../../components/myBarChart';
import api from "@/app/lib/axiosInstance";

interface Khs {
  id: string;
  studentName: string;
  studentNumber: string;
  studentYearName: string;

  status: string;
  gpa: number;
  createdAt: string;
  courses: Matkul[];
}
interface Matkul {
  id: string;
  courseName: string;
  courseCode: string;
  courseScore: number;
  credits: string;
  lectureName: string;
}

//API services
const getKhs = async () => {
  const res = await api.get("/study-plans");
  return res.data.data;
};
//end of API services

const KHSPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKhs, setSelectedKhs] = useState<Partial<Khs>>({});
  const [khsList, setKhsList] = useState<Khs[]>([]);

  useEffect(() => {
    fetchKhs();
  }, []);

  const fetchKhs = async () => {
    try {
      const data = await getKhs();
      setKhsList(data);
    } catch (error) {
      console.error("Error fetching khs:", error);
    }
  };
  const getGradeLetter = (score?: number) => {
    if (score === undefined || score === null) return "N/A";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  const openDetailModal = (khs: Khs) => {
    setSelectedKhs(khs);
    setIsEditModalOpen(true);
  };
  const closeDetailModal = () => {
    setSelectedKhs({});
    setIsEditModalOpen(false);
  };
  return (
    <section className="section">
      <div className="section-header">
        <h1>Kartu Hasil Studi</h1>
      </div>

      <div className="section-body">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped" id="table-1">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>NIM</th>
                        <th>Tahun Ajaran</th>
                       
                        <th>GPA</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {khsList.map((khs, index) => (
                        <tr key={khs.id}>
                          <td>{index + 1}</td>
                          <td>{khs.studentName}</td>
                          <td>{khs.studentNumber}</td>
                          <td>{khs.studentYearName}</td>
                         
                          <td>{khs.gpa}</td>
                          <td>
                            {new Date(khs.createdAt).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td>
                            <a
                              href="#"
                              className="btn btn-icon btn-primary"
                              id="modal-2"
                              onClick={() => openDetailModal(khs)}
                            >
                              <i className="fa fa-eye"></i>
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
      {isEditModalOpen && selectedKhs && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">Detail Kartu Hasil Studi</h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeDetailModal}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Body */}
              <div className="modal-body">
                <div id="khsContent">
                  <p>
                    <strong>Nama :</strong> {selectedKhs.studentName}
                  </p>
                  <p>
                    <strong>NIM :</strong> {selectedKhs.studentNumber}
                  </p>
                  <p>
                    <strong>Tahun Ajaran :</strong>{" "}
                    {selectedKhs.studentYearName}
                  </p>
                  

                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Kode MK</th>
                          <th>Nama Mata Kuliah</th>
                          <th>SKS</th>
                          <th>Huruf Mutu</th>
                          <th>Bobot</th>
                          <th>Nilai</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedKhs.courses?.map((course, index) => (
                          <tr key={course.id}>
                            <td>{index + 1}</td>
                            <td>{course.courseCode}</td>
                            <td>{course.courseName}</td>
                            <td>{course.credits}</td>
                            <td>{getGradeLetter(course.courseScore)}</td>
                            <td>{course.credits}</td>
                            <td>{course.courseScore ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan={3}>Total SKS</th>
                          <td>
                            {selectedKhs.courses?.reduce(
                              (total, c) => total + Number(c.credits),
                              0,
                            )}
                          </td>
                          <th colSpan={2}>Total Nilai Akhir</th>
                          <td>
                            {selectedKhs.courses &&
                            selectedKhs.courses.length > 0
                              ? (() => {
                                  // 1. Menggunakan struktur .reduce() yang benar
                                  const totalScore = selectedKhs.courses.reduce(
                                    (total, c) =>
                                      total + Number(c.courseScore || 0),
                                    0, // Nilai awal (initial value)
                                  );

                                  const avg =
                                    totalScore / selectedKhs.courses.length;

                                  // 2. Sesuai request: bulatkan jika bulat, tampilkan tanpa desimal jika bulat (.toFixed(0) / Math.round)
                                  // Namun jika Anda ingin 2 desimal untuk angka pecahan:
                                  return avg % 1 === 0
                                    ? avg.toFixed(0)
                                    : avg.toFixed(2);
                                })()
                              : 0}
                          </td>
                        </tr>
                        <tr>
                          <th colSpan={6} className="text-right">
                            IP SEMESTER
                          </th>
                          <td>
                            {
                              selectedKhs.courses &&
                              selectedKhs.courses.length > 0
                                ? (
                                    (selectedKhs.courses.reduce(
                                      (total, c) =>
                                        total + Number(c.courseScore || 0),
                                      0,
                                    ) /
                                      selectedKhs.courses.length /
                                      100) *
                                    4
                                  ).toFixed(2)
                                : "0.00" // Menggunakan string "0.00" agar tampilannya seragam dengan format .toFixed(2)
                            }
                          </td>
                        </tr>
                        <tr>
                          <th colSpan={6} className="text-right">
                            IPK
                          </th>
                          <td>{selectedKhs.gpa ?? "0.00"}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={closeDetailModal}
                >
                  Tutup
                </button>
                <button type="button" className="btn btn-primary">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default KHSPage;
