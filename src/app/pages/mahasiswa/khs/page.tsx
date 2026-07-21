"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/src/lib/axiosInstance";

import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { BarLoader } from "react-spinners";

// Komponen reusable
import DataTable from "@/src/app/components/table/DataTable";
import TableToolbar from "@/src/app/components/table/TableToolbar";
import TablePagination from "@/src/app/components/table/TablePagination";

// FIXED: Ambil juga interface khusus KhsForm dan KhsCourse dari file DetailForm agar type-safe
import { 
  DetailModal, 
  renderTableKhs, 
  Khs as DetailKhs, 
  KhsCourse 
} from "@/src/app/components/form/DetailForm";

// Interface untuk data utama tabel (Response API)
interface Khs {
  id: string;
  status: string;
  gpa: number;
  studentId: string;
  studentName: string;
  studentNumber: string;
  semester: string | null;
  year: string;
  createdAt: string;
  updatedAt: string;
  courses: Course[];
}

interface Course {
  id: string;
  courseId: string;
  name: string;
  code: string;
  credits: number;
  score: number;
  lectureId: string;
  lectureName: string;
  lectureNumber: number;
}

// API services
const getKhs = async () => {
  const res = await api.get("/manage-students/studyplan");
  return res.data.data;
};

const KHSPage = () => {
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [KhsList, setKhsList] = useState<Khs[]>([]);
  
  // FIXED: Gunakan tipe DetailKhs dari file DetailForm untuk state modal agar sinkron
  const [selectedKhs, setSelectedKhs] = useState<DetailKhs | null>(null);

  // State untuk search, sorting, pagination
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "studentName", desc: false },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Ambil data awal
  useEffect(() => {
    const fetchAll = async () => {
      try {
        await fetchKhs();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchKhs = async () => {
    try {
      const data = await getKhs();
      const sortedData = data.sort((a: Khs, b: Khs) =>
        a.studentName.localeCompare(b.studentName, "id", {
          sensitivity: "base",
        }),
      );
      setKhsList(sortedData);
    } catch (err) {
      console.error("Gagal fetch KHS:", err);
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

  // FIXED: Mapping disesuaikan penuh dengan struktur yang diminta oleh renderTableKhs milik DetailForm
  const mapApiToKhs = (apiData: Khs): DetailKhs => ({
    studentName: apiData.studentName,
    studentNumber: apiData.studentNumber,
    studentYearName: apiData.year, // Sesuai renderTableKhs: khs.studentYearName
    gpa: apiData.gpa,
    courses: (apiData.courses ?? []).map((c: Course): KhsCourse => ({
      id: c.id,
      courseCode: c.code, // Sesuai renderTableKhs: course.courseCode
      courseName: c.name, // Sesuai renderTableKhs: course.courseName
      credits: c.credits, // Sesuai renderTableKhs: course.credits
      courseScore: c.score, // Sesuai renderTableKhs: course.courseScore
    })),
  });

  const openDetailModal = useCallback((apiData: Khs) => {
    setSelectedKhs(mapApiToKhs(apiData));
    setIsDetailModalOpen(true);
  }, []);

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedKhs(null); // Diubah ke null agar pembersihan objek lebih bersih
  };

  // Columns untuk tabel
  const columns = useMemo<ColumnDef<Khs>[]>(
    () => [
      {
        accessorFn: (row, index) => index + 1,
        header: "#",
      },
      { accessorKey: "studentName", header: "Name" },
      { accessorKey: "studentNumber", header: "NIM" },
      { accessorKey: "year", header: "Tahun Ajaran" },
      { accessorKey: "gpa", header: "GPA" },
      {
        accessorKey: "createdAt",
        header: "Dibuat pada",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";
          return new Date(val as string).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        },
      },
      {
        header: "Aksi",
        cell: ({ row }) => {
          const khsData = row.original;
          return (
            <>
              <a
                href="#"
                className="btn btn-icon btn-primary m-1"
                onClick={(e) => {
                  e.preventDefault();
                  openDetailModal(khsData);
                }}
              >
                <i className="far fa-eye"></i>
              </a>
            </>
          );
        },
      },
    ],
    [openDetailModal],
  );

  // Inisialisasi react-table
  const table = useReactTable({
    data: KhsList,
    columns,
    state: { pagination, globalFilter, sorting },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <section className="section">
        <div className="section-header">
          <h1>Kartu Hasil Studi</h1>
        </div>

        <div className="section-body">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {loading ? (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ minHeight: "300px" }}
                    >
                      <BarLoader color="#6777ef" />
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIXED: Properti modal diselaraskan, menambahkan lecturerName agar tidak error */}
      <DetailModal
        isOpen={isDetailModalOpen && !!selectedKhs}
        studentName={selectedKhs?.studentName ?? ""}
        title="Detail Kartu Hasil Studi"
        contentId="khsContent"
        onClose={closeDetailModal}
        lecturerName="Dosen Pengampu" // FIXED: Properti wajib dari DetailModalProps disuplai di sini
      >
        {/* FIXED: Pemanggilan renderTableKhs sekarang aman tanpa error Type Mismatch */}
        {selectedKhs && renderTableKhs(selectedKhs, getGradeLetter)}
      </DetailModal>
    </>
  );
};

export default KHSPage;