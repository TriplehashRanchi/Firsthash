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
import EmployeeHeader from '@/components/layouts/employeeHeader';
import ManagerSidebar from '@/components/layouts/managerSidebar';
import ManagerHeader from '@/components/layouts/managerHeader';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isManager, isSubscribedUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/register');
      } else if (!isManager) {
        router.push('/login');
      } else if (!isSubscribedUser) {
        router.push('/subscribe');
      }
    }
  }, [loading, currentUser, isManager, isSubscribedUser]);

  if (loading || !currentUser || !isManager || !isSubscribedUser) {
    return <Loading />;
  }

  return (
    <>
      <div className="relative">
        <Overlay />
        <ScrollToTop />
        <Setting />
        <MainContainer>
          <ManagerSidebar />
          <div className="main-content flex min-h-screen flex-col">
            <ManagerHeader />
            <ContentAnimation>{children}</ContentAnimation>
            <Footer />
            <Portals />
          </div>
        </MainContainer>
      </div>
    </>
  );
}
