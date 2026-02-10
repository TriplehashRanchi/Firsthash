'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuNotes from '@/components/icon/menu/icon-menu-notes';
import IconMenuScrumboard from '@/components/icon/menu/icon-menu-scrumboard';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuTables from '@/components/icon/menu/icon-menu-tables';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import IconPlus from '../icon/icon-plus';
import IconMultipleForwardRight from '../icon/icon-multiple-forward-right';
import IconUserPlus from '../icon/icon-user-plus';
import IconUsersGroup from '../icon/icon-users-group';
import IconCpuBolt from '../icon/icon-cpu-bolt';
import IconCalendar from '../icon/icon-calendar';
import IconMessage2 from '../icon/icon-message2';
import IconTrashLines from '../icon/icon-trash-lines';
import IconAward from '../icon/icon-award';
import IconAirplay from '../icon/icon-airplay';
import IconClipboardText from '../icon/icon-clipboard-text';
import IconCashBanknotes from '../icon/icon-cash-banknotes';
import IconCamera from '../icon/icon-camera';
import IconChartSquare from '../icon/icon-chart-square';
import IconTrendingUp from '../icon/icon-trending-up';
import IconSquareRotated from '../icon/icon-square-rotated';
import IconUser from '../icon/icon-user';
import { UserRoundSearch } from 'lucide-react';
import IconPlusCircle from '../icon/icon-plus-circle';
import IconChatDot from '../icon/icon-chat-dot';


const AdminSidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.png" alt="logo" />
                            {/* <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">FIRSTHASH</span> */}
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            

                            <h2 className="-mx-4 mb-1 flex  items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <IconMinus className="hidden h-5 w-4 flex-none" />
                                <span>{t('apps')}</span>
                            </h2>

                            <li className="nav-item">
                                <ul>

                                    <li className="nav-item">
                                        <Link href="/admin/dashboard" className="group">
                                            <div className="flex items-center">
                                                <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Dashboard')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'customer_tab' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('customer_tab')}>
                                            <div className="flex items-center">
                                                <IconPlusCircle className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Enquiry')}</span>
                                            </div>

                                           <div className={currentMenu !== 'automation' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'customer_tab' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                 <li>
                                                    <Link href="/admin/enquiry">{t('Enquiry')}</Link>
                                                </li>

                                                <li>
                                                    <Link href="/admin/leads">{t('All Enquiry')}</Link>
                                                </li>
                                               
                                                {/* <li>
                                                    <Link href="/customers">{t('Clients')}</Link>
                                                </li> */}
                                            </ul>
                                        </AnimateHeight>
                                   </li>

                                     <li className="nav-item">
                                        <Link href="/admin/clients-details" className='group'>
                                            <div className='flex items-center'>
                                                <UserRoundSearch className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Clients')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/admin/roleForm" className="group">
                                            <div className="flex items-center">
                                                <IconUserPlus className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Add Employee')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/admin/team_view" className="group">
                                            <div className="flex items-center">
                                                <IconUsersGroup className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Employee List')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/admin/employee" className="group">
                                            <div className="flex items-center">
                                                <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('New Roles')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/admin/attendance" className="group">
                                            <div className="flex items-center">
                                                <IconCalendar className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Attendance')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/admin/facebook-lead/test" className="group">
                                            <div className="flex items-center">
                                                <IconCaretsDown className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Facebook Lead')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                      <li className="nav-item">
                                        <Link href="/admin/gopo" className="group">
                                            <div className="flex items-center">
                                                <IconPlus className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Create Project')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/admin/project" className="group">
                                            <div className="flex items-center">
                                                <IconCamera className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Projects')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                   
                                    
                                    <li className="nav-item">
                                        <Link href="/admin/task-management" className="group">
                                            <div className="flex items-center">
                                                <IconMessage2 className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Manage Task')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/admin/task-bundles" className="group">
                                            <div className="flex items-center">
                                                <IconClipboardText className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Task Bundles')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/admin/expence" className="group">
                                            <div className="flex items-center">
                                                <IconCashBanknotes className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Manage Salary')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/admin/team-allocation" className="group">
                                            <div className="flex items-center">
                                                <IconSquareRotated className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Team Allocation')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/admin/chat" className="group">
                                            <div className="flex items-center">
                                                <IconChatDot className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:text-gray-200 dark:group-hover:text-white-dark">{t('Chat')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                   
                                </ul>
                            </li>

                          
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default AdminSidebar;
