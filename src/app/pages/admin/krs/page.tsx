"use client";
import React, { useState, useEffect } from "react";
// import MyBarChart from '../../../components/myBarChart';
import api from "@/src/app/lib/axiosInstance";

interface Krs {
  id: string;
  studentName: string;
  studentNumber: string;
  studentYearName: string;
  studentSemester: number;
  status: string;
  createdAt: string;
  courses: Matkul[];
}

interface Matkul {
  id: string;
  courseName: string;
  courseCode: string;
  credits: string;
  lectureName: string;
}

//API services
const getKrs = async () => {
  const res = await api.get("/study-plans");
  return res.data.data;
};
//end of API services
const KRSPage = () => {
  //buat state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKrs, setSelectedKrs] = useState<Partial<Krs>>({});

  const [krsList, setKrsList] = useState<Krs[]>([]);
  //end of state

  //ambil data awal menggunaang useEffect
  useEffect(() => {
    fetchKrs();
  }, []);
  // end off useEffect
  const fetchKrs = async () => {
    try {
      const data = await getKrs();
      setKrsList(data);
    } catch (error) {
      console.error("Error fetching krs:", error);
    }
  };
const openDetailModal = (krs: Krs) => {
  setSelectedKrs(krs);
  setIsEditModalOpen(true);
}
const closeDetailModal = () => {
  setSelectedKrs({});
  setIsEditModalOpen(false);
}

  return (
    <section className="section">
      <div className="section-header">
        <h1>Kartu Rencana Studi</h1>
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
                        <th>Status</th>
                        <th>Dibuat pada</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {krsList.map((krs, index) => (
                        <tr key={krs.id}>
                          <td>{index + 1}</td>
                          <td>{krs.studentName}</td>
                          <td>{krs.studentNumber}</td>
                          <td>{krs.studentYearName}</td>
                          <td>
                            <span
                              className={`badge badge-${
                                krs.status.toUpperCase() === "APPROVED"
                                  ? "success"
                                  : krs.status.toUpperCase() === "REJECED"
                                    ? "danger"
                                    : krs.status.toUpperCase() === "PENDING"
                                      ? "warning"
                                      : "secondary" // <-- Warna cadangan (abu-abu) jika status tidak cocok dengan ketiganya
                              }`}
                            >
                              {krs.status}
                            </span>
                          </td>
                          <td>
                             {new Date(krs.createdAt).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                openDetailModal(krs);
                              }}
                              className="btn btn-icon btn-primary"
                              id="modal-1"
                            >
                              <i className="fa fa-eye"></i>
                            </button>
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

      {isEditModalOpen && selectedKrs && (
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
                    <strong>Nama :</strong> {selectedKrs.studentName}
                  </p>
                  <p>
                    <strong>NIM :</strong> {selectedKrs.studentNumber}
                  </p>
                  <p>
                    <strong>Tahun Ajaran :</strong>{" "}
                    {selectedKrs.studentYearName}
                  </p>
                  {/* <p>
                    <strong>Semester :</strong> {selectedKrs.studentSemester}
                  </p> */}

                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Kode MK</th>
                          <th>Nama Mata Kuliah</th>
                          <th>SKS</th>
                          <th>Dosen Pengampu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedKrs.courses?.map((course, index) => (
                          <tr key={course.id}>
                            <td>{index + 1}</td>
                            <td>{course.courseCode}</td>
                            <td>{course.courseName}</td>
                            <td>{course.credits}</td>
                            <td>{course.lectureName}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan={2}>Total SKS</th>
                          <th colSpan={2}>
                            {selectedKrs.courses?.reduce(
                              (total, c) => total + Number(c.credits),
                              0,
                            )}
                          </th>
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
                <button
                  type="button"
                  className="btn btn-primary"
                >
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

export default KRSPage;
