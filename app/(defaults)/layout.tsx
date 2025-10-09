// 'use client';

// import { useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import Loading from '@/components/layouts/loading';

// import ContentAnimation from '@/components/layouts/content-animation';
// import Footer from '@/components/layouts/footer';
// import Header from '@/components/layouts/header';
// import MainContainer from '@/components/layouts/main-container';
// import Overlay from '@/components/layouts/overlay';
// import ScrollToTop from '@/components/layouts/scroll-to-top';
// import Setting from '@/components/layouts/setting';
// import Portals from '@/components/portals';
// import AdminSidebar from '@/components/layouts/adminSidebar';

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { currentUser, isAdmin, isSubscribedUser, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading) {
//       if (!currentUser) {
//         router.push('/register');
//       } else if (!isAdmin) {
//         router.push('/login');
//        } // else if (!isSubscribedUser) {
//       //   router.push('/subscribe');
//       // }
//     }
//   }, [loading, currentUser, isAdmin, isSubscribedUser]);

//   if (loading || !currentUser || !isAdmin || !isSubscribedUser) {
//     return <Loading />;
//   }

//   return (
//     <>
//       {/* BEGIN MAIN CONTAINER */}
//       <div className="relative">
//         <Overlay />
//         <ScrollToTop />

//         {/* BEGIN APP SETTING LAUNCHER */}
//         <Setting />
//         {/* END APP SETTING LAUNCHER */}

//         <MainContainer>
//           {/* BEGIN SIDEBAR */}
//           <AdminSidebar />
//           {/* END SIDEBAR */}

//           <div className="main-content  flex min-h-screen flex-col">
//             {/* BEGIN TOP NAVBAR */}
//             <Header />
//             {/* END TOP NAVBAR */}

//             {/* BEGIN CONTENT AREA */}
//             <ContentAnimation>{children}</ContentAnimation>
//             {/* END CONTENT AREA */}

//             {/* BEGIN FOOTER */}
//             <Footer />
//             {/* END FOOTER */}

//             <Portals />
//           </div>
//         </MainContainer>
//       </div>
//     </>
//   );
// }


'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

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
import '@/styles/calendar.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin, isSubscribedUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // 1) Not logged in -> go to /register
    if (!currentUser) {
      if (pathname !== '/register') router.replace('/register');
      return;
    }

    // 2) Logged in but not admin -> go to /login
    if (!isAdmin) {
      if (pathname !== '/login') router.replace('/login');
      return;
    }

    // 3) (Optional) Enforce subscription — if you want this ON, also unblock render below.
    // if (!isSubscribedUser) {
    //   if (pathname !== '/subscribe') router.replace('/subscribe');
    //   return;
    // }
  }, [loading, currentUser, isAdmin, isSubscribedUser, pathname, router]);

  // Render guard:
  // Only block while loading or while we’re redirecting due to auth/admin checks.
  // IMPORTANT: Do NOT block on !isSubscribedUser unless you also redirect in the effect.
  if (loading) return <Loading />;
  if (!currentUser || !isAdmin) return <Loading />;

  // If you want to enforce subscription, either:
  // A) uncomment the redirect in the effect AND also block here:
  // if (!isSubscribedUser) return <Loading />;
  // OR
  // B) remove subscription check entirely from both places.

  return (
    <div className="relative">
      <Overlay />
      <ScrollToTop />
      <Setting />
      <MainContainer>
        <AdminSidebar />
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
