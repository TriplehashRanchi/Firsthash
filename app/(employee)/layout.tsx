'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/layouts/loading';

import ContentAnimation from '@/components/layouts/content-animation';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';
import MainContainer from '@/components/layouts/main-container';
import Overlay from '@/components/layouts/overlay';
import ScrollToTop from '@/components/layouts/scroll-to-top';
import Setting from '@/components/layouts/setting';
import Sidebar from '@/components/layouts/sidebar';
import Portals from '@/components/portals';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isEmployee, isSubscribedUser, loading } = useAuth();
  const router = useRouter();

  console.log("Employee", isEmployee)

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/register');
      } else if (!isEmployee) {
        router.push('/unauthorized');
      } else if (!isSubscribedUser) {
        router.push('/subscribe');
      }
    }
  }, [loading, currentUser, isEmployee, isSubscribedUser]);

  if (loading || !currentUser || !isEmployee || !isSubscribedUser) {
    return <Loading />;
  }

  return (
    <>
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
    </>
  );
}
