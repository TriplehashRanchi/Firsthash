'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';

import ContentAnimation from '@/components/layouts/content-animation';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';
import MainContainer from '@/components/layouts/main-container';
import Overlay from '@/components/layouts/overlay';
import ScrollToTop from '@/components/layouts/scroll-to-top';
import Setting from '@/components/layouts/setting';
import Sidebar from '@/components/layouts/sidebar';
import Portals from '@/components/portals';
import Loading from '@/components/layouts/loading';

interface JwtPayload {
  email: string;
  role: string;
  exp: number;
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('superadmin_token');
    if (!token) {
      router.push('/super-admin/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (decoded.role !== 'superadmin' || isExpired) {
        localStorage.removeItem('superadmin_token');
        router.push('/super-admin/login');
      } else {
        setIsVerified(true);
      }
    } catch (err) {
      console.error('Invalid token', err);
      localStorage.removeItem('superadmin_token');
      router.push('/super-admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || !isVerified) {
    return <Loading />;
  }

  return (
    <div className="relative">
      <Overlay />
      <ScrollToTop />
      <Setting />

      <MainContainer>
        <Sidebar />
        <div className="main-content flex min-h-screen flex-col">
          <Header />
          <ContentAnimation>{children}</ContentAnimation>
          <Footer />
          <Portals />
        </div>
      </MainContainer>
    </div>
  );
}
