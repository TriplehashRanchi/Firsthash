'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { User } from 'firebase/auth';
import { getAuth } from "firebase/auth";


const auth = getAuth();
import { IRootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';
import Dropdown from '@/components/dropdown';
import IconMenu from '@/components/icon/icon-menu';
import IconUser from '@/components/icon/icon-user';
import IconLogout from '@/components/icon/icon-logout';
import { useAuth } from '@/context/AuthContext';

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  className?: string;
}

/**
 * Avatar component:
 * - shows image when photoURL is available and loads correctly
 * - otherwise shows the first letter of name (fallback to email; then "U")
 * - no DOM hacks; purely React state
 */
const Avatar: React.FC<AvatarProps> = ({ name, email, photoURL, className = '' }) => {
  const [errored, setErrored] = useState(false);

  const firstLetter = useMemo(() => {
    const base = (name?.trim() || email || 'U').trim();
    return base.charAt(0).toUpperCase() || 'U';
  }, [name, email]);

  if (photoURL && !errored) {
    return (
      <img
        className={className}
        src={photoURL}
        alt={name || email || 'User'}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <div
      className={`${className} grid place-content-center bg-primary text-white font-bold select-none`}
      title={name || email || 'User'}
    >
      <span>{firstLetter}</span>
    </div>
  );
};

const EmployeeHeader: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { logout, loading, currentUser } = useAuth() as {
    logout: () => void;
    loading: boolean;
    currentUser: User | null;
  };

  console.log("User", currentUser);
  const displayName = currentUser?.displayName || null;
  const email = currentUser?.email || null;
  const photoURL = currentUser?.photoURL || null;



  useEffect(() => {
    // highlight active link in horizontal menu (client-only)
    const selector = document.querySelector(
      'ul.horizontal-menu a[href="' + window.location.pathname + '"]'
    );
    if (selector) {
      const all = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
      all.forEach((el) => el.classList.remove('active'));
      selector.classList.add('active');
      const ul = selector.closest('ul.sub-menu');
      if (ul) {
        const ele = ul.closest('li.menu')?.querySelector('.nav-link');
        if (ele) {
          setTimeout(() => ele.classList.add('active'));
        }
      }
    }
  }, [pathname]);

  const themeConfig = useSelector((state: IRootState) => state.themeConfig);

  const AuthPlaceholder: React.FC = () => (
    <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
  );

  return (
    <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
      <div className="shadow-sm">
        <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
          <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
            <Link href="/" className="main-logo flex shrink-0 items-center">
              <img className="inline w-38 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.png" alt="logo" />
              <span className="hidden align-middle text-2xl font-semibold transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">
                IPCStudios
              </span>
            </Link>
            <button
              type="button"
              className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 ltr:ml-auto rtl:mr-auto rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 ltr:sm:ml-0 sm:rtl:mr-0 lg:space-x-2">
            <div className="flex justify-end space-x-1.5 rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 lg:space-x-2 ml-auto">
              {loading ? (
                <AuthPlaceholder />
              ) : (
                <div className="dropdown flex shrink-0">
                  <div className="flex justify-end w-full">
                    <Dropdown
                      offset={[0, 8]}
                      placement="bottom-end"
                      btnClassName="relative group block"
                      button={
                        <Avatar
                          name={displayName}
                          email={email}
                          photoURL={photoURL}
                          className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100"
                        />
                      }
                    >
                      <ul className="w-[200px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                        <li>
                          <div className="flex items-center px-4 py-4">
                            <Avatar
                              name={displayName}
                              email={email}
                              photoURL={photoURL}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div className="truncate ltr:pl-4 rtl:pr-4">
                              <h4 className="text-base">{displayName || email || 'Employee'}</h4>
                            </div>
                          </div>
                        </li>

                        <li className="border-t border-white-light dark:border-white-light/10 cursor-pointer">
                          <Link href="/employee/profile" className="flex items-center !py-3 px-4">
                            <IconUser className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                            My Profile
                          </Link>
                        </li>

                        <li className="border-t border-white-light dark:border-white-light/10 cursor-pointer">
                          <button onClick={logout} className="flex items-center !py-3 px-4 text-danger w-full text-left">
                            <IconLogout className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                            Sign Out
                          </button>
                        </li>
                      </ul>
                    </Dropdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
