// app/components/pages/DosenSidebar.tsx
'use client'; 
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const DosenSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isMatkulActive = () => {
    return (
      pathname.startsWith('/pages/dosen/matkul') ||
      pathname.startsWith('/pages/dosen/pilihkelas') ||
      pathname.startsWith('/pages/dosen/pilihmatkul')
    );
  };
const handleLogout = (e : any) => {
  // 1. Cegah perilaku default dari tag <Link> agar tidak memotong proses JavaScript
  if (e) e.preventDefault();

  // 2. Ambil semua cookie yang ada
  const allCookies = Cookies.get();

  // 3. Hapus semua cookie, pastikan berikan opsi path jika diperlukan
  Object.keys(allCookies).forEach(cookieName => {
    // Hapus standar
    Cookies.remove(cookieName);
    
    // Hapus dengan path root
    Cookies.remove(cookieName, { path: '/' }); 
  });

  // 4. Pindahkan halaman setelah cookie dipastikan bersih
  router.push("/pages/auth/dosen/login");
};

  return (
    <div className="main-sidebar sidebar-style-2">
      <aside id="sidebar-wrapper">
        <div className="sidebar-brand">
          <Link href="/pages/dosen/dashboard">
            Stisla
          </Link>
        </div>
        <ul className="sidebar-menu">
          <li className={isActive('/pages/dosen/dashboard') ? 'active' : ''}>
            <Link className="nav-link" href="/pages/dosen/dashboard">
              <i className="ion-ios-home"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="menu-header">Akademik</li>
           <li className={isMatkulActive() ? 'active' : ''}>
            <Link className="nav-link" href="/pages/dosen/matkul">
                <i className="ion-ios-book"></i>
                <span>Mata Kuliah</span>
            </Link>
            </li>
          <li className={isActive('/pages/dosen/jadwal') ? 'active' : ''}>
            <Link className="nav-link" href="/pages/dosen/jadwal">
              <i className="ion-calendar"></i>
              <span>Jadwal</span>
            </Link>
          </li>
          <li className={isActive('/pages/dosen/krs') ? 'active' : ''}>
            <Link className="nav-link" href="/pages/dosen/krs">
              <i className="ion-ios-list"></i>
              <span>Kartu Rencana Studi</span>
            </Link>
          </li>
          {/* 🔄 TAMBAHAN MENU: PILIH KELAS */}
      {/* <li className={isActive('/pages/dosen/pilihkelas') ? 'active' : ''}>
        <Link className="nav-link" href="/pages/dosen/pilihkelas">
          <i className="ion-ios-grid-view"></i>
          <span>Pilih Kelas</span>
        </Link>
      </li> */}

      {/* 🔄 TAMBAHAN MENU: PILIH MATKUL */}
      <li className={isActive('/pages/dosen/pilihmatkul') ? 'active' : ''}>
        <Link className="nav-link" href="/pages/dosen/pilihmatkul">
          <i className="ion-ios-bookmarks"></i>
          <span>Pilih Matkul</span>
        </Link>
      </li>
          <li className="menu-header">Lainnya</li>
          <li>
  <Link className="nav-link" href="#" onClick={handleLogout}>
    <i className="ion-arrow-return-left"></i>
    <span>Logout</span>
  </Link>
</li>
        </ul>
      </aside>
    </div>
  );
};

export default DosenSidebar;
