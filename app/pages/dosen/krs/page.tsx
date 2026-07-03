"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/app/lib/axiosInstance";
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
import DataTable from "@/app/components/table/DataTable";
import TableToolbar from "@/app/components/table/TableToolbar";
import TablePagination from "@/app/components/table/TablePagination";
import { DetailModal, renderTableKrs } from "@/app/components/form/DetailForm";

interface ApiCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  lectureName: string;
}

interface ApiStudyPlan {
  id: string;
  name: string;
  studentNumber: string;
  yearName: string;
  status: string;
  createdAt: string;
}

interface ApiKrs {
  studyPlan: ApiStudyPlan;
  courses: ApiCourse[];
}

interface Krs {
  id: string;
  name: string;
  studentNumber: string;
  studentYearName: string;
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

// API Services
const getKrs = async () => {
  const res = await api.get("/manage-lectures/studyplans");
  return res.data.data;
};

const updateStatus = async (
  id: string,
  data: {
    status: string;
  },
) => {
  // Melakukan request PUT ke backend dengan URL dinamis sesuai ID KRS
  const res = await api.put(`/manage-lectures/studyplans/${id}`, data);
  return res.data;
};

const KRSPage = () => {
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [krsList, setKrsList] = useState<Krs[]>([]);
  const [selectedKrs, setSelectedKrs] = useState<Partial<Krs>>({});

  // State untuk search, sorting, pagination
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ambil data awal
  useEffect(() => {
    const fetchAll = async () => {
      try {
        await fetchKrs();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchKrs = async () => {
    try {
      const data = await getKrs();

      // mapping supaya sesuai interface Krs
      const mappedData: Krs[] = data.map((item: ApiKrs) => ({
        id: item.studyPlan.id,
        name: item.studyPlan.name,
        studentNumber: item.studyPlan.studentNumber,
        studentYearName: item.studyPlan.yearName,
        status: item.studyPlan.status,
        createdAt: item.studyPlan.createdAt,
        courses: item.courses.map((c: ApiCourse) => ({
          id: c.id,
          courseName: c.name,
          courseCode: c.code,
          credits: String(c.credits), // interface Matkul pakai string
          lectureName: c.lectureName,
        })),
      }));

      const sortedData = mappedData.sort((a, b) =>
        a.name.localeCompare(b.name, "id", { sensitivity: "base" }),
      );

      setKrsList(sortedData);
    } catch (err) {
      console.error("Gagal fetch krs:", err);
    }
  };

 const handleUpdateStatus = async (id: string, status: string) => {
  try {
    // Kirim id dan objek status langsung ke fungsi API
    await updateStatus(id, { status });
    
    // Refresh data tabel setelah berhasil melakukan update status
    await fetchKrs();
  } catch (err) {
    console.error("Gagal update status:", err);
  }
};

  const openDetailModal = (krs: Krs) => {
    setSelectedKrs(krs);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedKrs({});
  };

  // Columns untuk tabel
const columns = useMemo<ColumnDef<Krs>[]>(
  () => [
    {
      accessorFn: (row, index) => index + 1,
      header: "#",
    },
    { accessorKey: "name", header: "Nama Mahasiswa" },
    { accessorKey: "studentNumber", header: "NIM" },
    { accessorKey: "studentYearName", header: "Tahun Ajaran" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusRaw = row.original?.status ?? "onprocess";
        const effectiveStatus = String(statusRaw).toUpperCase();

        const badgeClassMap: Record<string, string> = {
          APPROVED: "badge-success",
          ONPROCESS: "badge-warning",
          REJECTED: "badge-danger",
        };
        const badgeClass = badgeClassMap[effectiveStatus] ?? "badge-secondary";

        return (
          <span style={{ minWidth: "90px", display: "inline-block" }} className={`badge ${badgeClass} text-center`}>
            {effectiveStatus}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Diajukan Pada",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
    },
    {
      header: "Aksi",
      id: "actions",
      cell: ({ row }) => {
        const krs = row.original;
        const currentStatus = String(krs.status).toUpperCase();

        return (
          <div className="d-flex align-items-center">
            {/* 1. Tombol Detail */}
            <button
              className="btn btn-icon btn-sm btn-primary mr-2"
              title="Lihat Detail KRS"
              onClick={(e) => {
                e.preventDefault();
                openDetailModal(krs);
              }}
            >
              <i className="far fa-eye"></i>
            </button>

            {/* 2. Tombol Setujui - Selalu muncul, disabled jika status sudah APPROVED */}
            <button
              className={`btn btn-icon btn-sm mr-1 ${
                currentStatus === "APPROVED" ? "btn-secondary" : "btn-success"
              }`}
              title={currentStatus === "APPROVED" ? "Sudah Disetujui" : "Setujui KRS"}
              disabled={currentStatus === "APPROVED"}
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStatus(krs.id, "APPROVED");
              }}
            >
              <i className="fas fa-check"></i>
            </button>

            {/* 3. Tombol Tolak - Selalu muncul, disabled jika status sudah REJECTED */}
            <button
              className={`btn btn-icon btn-sm ${
                currentStatus === "REJECTED" ? "btn-secondary" : "btn-danger"
              }`}
              title={currentStatus === "REJECTED" ? "Sudah Ditolak" : "Tolak KRS"}
              disabled={currentStatus === "REJECTED"}
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStatus(krs.id, "REJECTED");
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        );
      },
    },
  ],
  [openDetailModal, handleUpdateStatus],
);

  // Inisialisasi react-table
  const table = useReactTable({
    data: krsList,
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
          <h1>Kartu Rencana Studi</h1>
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
      <DetailModal
        isOpen={isDetailModalOpen && !!selectedKrs}
        title="Detail Kartu Rencana Studi"
        studentName={selectedKrs.name ?? ""}
        contentId="krsContent"
        onClose={closeDetailModal}
      >
        {selectedKrs && renderTableKrs(selectedKrs)}
      </DetailModal>
    </>
  );
};

export default KRSPage;