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
import Portals from '@/components/portals';
import AdminSidebar from '@/components/layouts/adminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin, isSubscribedUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/register');
      } else if (!isAdmin) {
        router.push('/unauthorized');
      } else if (!isSubscribedUser) {
        router.push('/subscribe');
      }
    }
  }, [loading, currentUser, isAdmin, isSubscribedUser]);

  if (loading || !currentUser || !isAdmin || !isSubscribedUser) {
    return <Loading />;
  }

  return (
    <>
      {/* BEGIN MAIN CONTAINER */}
      <div className="relative">
        <Overlay />
        <ScrollToTop />

        {/* BEGIN APP SETTING LAUNCHER */}
        <Setting />
        {/* END APP SETTING LAUNCHER */}

        <MainContainer>
          {/* BEGIN SIDEBAR */}
          <AdminSidebar />
          {/* END SIDEBAR */}

          <div className="main-content  bg-white flex min-h-screen flex-col">
            {/* BEGIN TOP NAVBAR */}
            <Header />
            {/* END TOP NAVBAR */}

            {/* BEGIN CONTENT AREA */}
            <ContentAnimation>{children}</ContentAnimation>
            {/* END CONTENT AREA */}

            {/* BEGIN FOOTER */}
            <Footer />
            {/* END FOOTER */}

            <Portals />
          </div>
        </MainContainer>
      </div>
    </>
  );
}
