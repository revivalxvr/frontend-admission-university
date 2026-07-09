'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Menggunakan Link bawaan Next.js agar navigasi lebih cepat
import api from '@/app/lib/axiosInstance';

// Interface untuk detail item Jadwal Kuliah (Schedules)
export interface ScheduleDetail {
  id: string;
  classId: string;
  className: string;
  majorName: string;
  day: string;
  room: string;
  capacity: number;
  timeStart: string; 
  timeEnd: string;   
}

// 2. Interface untuk objek Mata Kuliah (Courses)
export interface CourseSchedule {
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  schedules: ScheduleDetail[];
}

// 3. Interface untuk kontainer pembungkus data utama (Data)
export interface LectureScheduleData {
  courses: CourseSchedule[];
}

// API services
const getJadwal = async (): Promise<LectureScheduleData> => {
  const res = await api.get("/manage-lectures/schedule");
  return res.data.data;
};

const PilihMatkulDashboard = () => {
  const [courses, setCourses] = useState<CourseSchedule[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load data jadwal mengajar dosen saat pertama kali halaman dibuka
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getJadwal();
        if (data && data.courses) {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error("Gagal memuat jadwal mengajar:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  if (loading) {
    return (
      <section className="section">
        <div className="section-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Memuat data...</span>
          </div>
          <p className="mt-2">Memuat jadwal mengajar dosen...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h1>Akademik</h1>
      </div>

      <div className="section-body">
        <h2 className="section-title">Pilih Kelas</h2>
        <p className="section-lead">
          Semua kelas dan mata kuliah yang sedang Anda ampu semester ini
        </p>

        {/* Input Pencarian */}
        <div className="position-relative mb-4">
          <i className="fas fa-search position-absolute" style={{ top: "50%", left: 15, transform: "translateY(-50%)", color: "#aaa" }} />
          <input
            type="text"
            id="searchInput"
            className="form-control pl-5"
            placeholder="Cari mata kuliah atau kelas..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="row">
          {courses.map((course) => {
            // Melakukan filter schedule (kelas) berdasarkan query pencarian di input text
            const filteredSchedules = course.schedules.filter(sch => 
              course.courseName.toLowerCase().includes(searchQuery) ||
              sch.className.toLowerCase().includes(searchQuery) ||
              sch.majorName.toLowerCase().includes(searchQuery)
            );

            // Jika matkul atau kelasnya tidak cocok dengan pencarian, tidak perlu dirender
            if (filteredSchedules.length === 0) return null;

            return filteredSchedules.map((sch) => (
              <div className="col-12 col-md-4 card-item" key={sch.id}>
                {/*  Mengirim courseId dan classId via URL Query String ke halaman penilaian */}
                <Link 
                  href={`/pages/dosen/pilihkelas?courseId=${course.courseId}&classId=${sch.classId}`} 
                  className="text-decoration-none text-dark"
                >
                  <div className="card card-statistic-1 shadow-sm" style={{ cursor: "pointer" }}>
                    <div className="card-icon bg-primary d-flex align-items-center justify-content-center">
                      <i className="fa fa-chalkboard-teacher text-white" style={{ fontSize: 20 }}></i>
                    </div>
                    <div className="card-wrap">
                      <div className="card-header pt-3">
                        <span className="badge badge-secondary mb-1">{course.courseCode} - {course.credits} SKS</span>
                        <h4 className="text-primary font-weight-bold" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                          {course.courseName}
                        </h4>
                      </div>
                      <div className="card-body pt-0 pb-3 text-muted" style={{ fontSize: '16px' }}>
                        Kelas {sch.className}
                        <div className="text-small text-muted font-weight-normal mt-1" style={{ fontSize: '11px' }}>
                          <i className="fas fa-graduation-cap mr-1"></i> {sch.majorName} <br />
                          <i className="fas fa-door-open mr-1"></i> {sch.room} ({sch.day})
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ));
          })}
        </div>

        {/* State penanda jika hasil pencarian kosong */}
        {courses.length > 0 && document.querySelectorAll('.card-item').length === 0 && searchQuery && (
          <div className="text-center text-muted py-4">
            Mata kuliah atau kelas "{searchQuery}" tidak ditemukan.
          </div>
        )}
      </div>
    </section>
  );
};

export default PilihMatkulDashboard;