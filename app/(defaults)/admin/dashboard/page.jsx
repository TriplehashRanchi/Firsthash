'use client';

import Dropdown from '@/components/dropdown';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconCashBanknotes from '@/components/icon/icon-cash-banknotes';
import IconCreditCard from '@/components/icon/icon-credit-card';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconUser from '@/components/icon/icon-user';
import { IRootState } from '@/store';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import IconTag from '@/components/icon/icon-tag';
import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { IndianRupee } from 'lucide-react';
import dynamic from 'next/dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// --- API Client with Firebase token ---
const api = {
  get: async (url) => {
    try {
      const auth = getAuth();

      // ensure we have a user (wait once if needed)
      const user =
        auth.currentUser ||
        (await new Promise((resolve) => {
          const unsub = onAuthStateChanged(auth, (u) => {
            unsub();
            resolve(u || null);
          });
        }));

      if (!user) {
        // not logged in
        throw new Error('UNAUTHENTICATED');
      }

      // try with current token
      let idToken = await user.getIdToken(false);
      let res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      // if 401, force refresh token once and retry
      if (res.status === 401) {
        idToken = await user.getIdToken(true);
        res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      if (!res.ok) {
        throw new Error(`API call to ${url} failed with status: ${res.status}`);
      }

      return res.json();
    } catch (error) {
      console.error(`Fetching data from ${url} failed:`, error);
      // prevent UI crash
      return [];
    }
  },
};

const AdminDashboard = () => {
  const isDark = useSelector(
    (state) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode
  );
  const isRtl = useSelector((state) => state.themeConfig.rtlClass) === 'rtl';

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

  // All data states initialized
  const [summaryData, setSummaryData] = useState({
    revenue: 0,
    profit: 0,
    totalProjects: 0,
    ongoingProjects: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState({ series: [] });
  const [projectsByStatusData, setProjectsByStatusData] = useState({ series: [] });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [financialOverview, setFinancialOverview] = useState({ recentTransactions: [] });

  const didRun = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (didRun.current) return; // avoid double run in React 18 Strict Mode
    didRun.current = true;

    const fetchDashboardData = async () => {
      setLoading(true);

      const auth = getAuth();
      // redirect if not logged in
      const user =
        auth.currentUser ||
        (await new Promise((resolve) => {
          const unsub = onAuthStateChanged(auth, (u) => {
            unsub();
            resolve(u || null);
          });
        }));

      if (!user) {
        router.replace('/login');
        return setLoading(false);
      }

      try {
        const [projects, salaries, members] = await Promise.all([
          api.get(`${API_URL}/api/projects?status=all`),
          api.get(`${API_URL}/api/members/salaries`),
          api.get(`${API_URL}/api/members`),
        ]);

        console.log('Dashboard data initialized:', projects, salaries, members);

        processSummaryData(projects, salaries);
        processRevenueChart(projects, salaries);
        processProjectsByStatus(projects);
        processRecentProjects(projects);
        processRecentActivities(projects, members);
        processFinancialOverview(projects, salaries);
      } catch (error) {
        console.error('Dashboard data initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    setIsMounted(true);
    fetchDashboardData();
  }, [router]);

  // --- DATA PROCESSING FUNCTIONS ---

  const processSummaryData = (projects = [], salaries = []) => {
    const totalRevenue = projects.reduce(
      (acc, p) =>
        acc +
        (parseFloat(p?.packageCost ?? 0) + parseFloat(p?.additionalCost ?? 0)),
      0
    );
    const totalExpenses = salaries.reduce(
      (acc, s) => acc + parseFloat(s?.amount_due ?? 0),
      0
    );
    const ongoingProjects = projects.filter((p) => p?.status === 'ongoing').length;

    setSummaryData({
      revenue: totalRevenue,
      profit: totalRevenue - totalExpenses,
      totalProjects: projects.length,
      ongoingProjects,
    });
  };

  const processRevenueChart = (projects = [], salaries = []) => {
    const incomeByMonth = Array(12).fill(0);
    const expensesByMonth = Array(12).fill(0);

    projects.forEach((p) => {
      const date = new Date(p?.minDate || p?.created_at);
      if (date && !isNaN(date.getTime())) {
        const month = date.getMonth();
        incomeByMonth[month] +=
          parseFloat(p?.packageCost ?? 0) + parseFloat(p?.additionalCost ?? 0);
      }
    });

    salaries.forEach((s) => {
      const m = Number(s?.period_month);
      if (m >= 1 && m <= 12) {
        expensesByMonth[m - 1] += parseFloat(s?.amount_due ?? 0);
      }
    });

    setRevenueChartData({
      series: [
        { name: 'Income', data: incomeByMonth },
        { name: 'Expenses', data: expensesByMonth },
      ],
    });
  };

  const processProjectsByStatus = (projects = []) => {
    const statusCounts = projects.reduce(
      (acc, p) => {
        const status = p?.status;
        if (status === 'completed') acc.completed += 1;
        else if (status === 'ongoing') acc.ongoing += 1;
        else if (status === 'rejected') acc.rejected += 1;
        return acc;
      },
      { completed: 0, ongoing: 0, rejected: 0 }
    );

    setProjectsByStatusData({
      series: [statusCounts.completed, statusCounts.ongoing, statusCounts.rejected],
    });
  };

  const processRecentProjects = (projects = []) => {
    const sorted = [...projects].sort(
      (a, b) => new Date(b?.created_at) - new Date(a?.created_at)
    );
    setRecentProjects(sorted.slice(0, 5));
  };

  const processRecentActivities = (projects = [], members = []) => {
    const projectActivities = (projects.slice(0, 4) || []).map((p) => ({
      time: new Date(p?.created_at),
      text: `New Project: ${p?.name?.slice(0, 20) || 'Unnamed'}...`,
      color: 'primary',
      status: 'Pending',
    }));
    const memberActivities = (members.slice(0, 4) || []).map((m) => ({
      time: new Date(m?.created_at),
      text: `New Member: ${m?.name || 'Unnamed'}`,
      color: 'success',
      status: 'Joined',
    }));

    const activities = [...projectActivities, ...memberActivities].sort(
      (a, b) => b.time - a.time
    );
    setRecentActivities(activities.slice(0, 8));
  };

  const processFinancialOverview = (projects = [], salaries = []) => {
    const incomeTransactions = projects
      .filter((p) => p?.status === 'completed')
      .slice(0, 3)
      .map((p) => ({
        type: 'income',
        icon: <IconUser className="h-6 w-6" />,
        name: `Project: ${p?.clientName || 'N/A'}`,
        date: new Date(p?.maxDate || p?.created_at).toLocaleDateString(),
        amount:
          parseFloat(p?.packageCost ?? 0) + parseFloat(p?.additionalCost ?? 0),
      }));

    const expenseTransactions = salaries
      .filter((s) => s?.status === 'complete')
      .slice(0, 3)
      .map((s) => ({
        type: 'expense',
        icon: <IconCashBanknotes />,
        name: `Salary: ${s?.employee_name || 'N/A'}`,
        date: `Paid for ${s?.period_month}/${s?.period_year}`,
        amount: -parseFloat(s?.amount_paid ?? 0),
      }));

    setFinancialOverview({
      recentTransactions: [...incomeTransactions, ...expenseTransactions].slice(
        0,
        5
      ),
    });
  };

  // --- ApexChart Options ---
  const getRevenueChartOptions = () => ({
    chart: {
      type: 'area',
      height: 325,
      fontFamily: 'Nunito, sans-serif',
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: [isDark ? '#2196F3' : '#1B55E2', isDark ? '#E7515A' : '#E7515A'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: isDark ? '#191E3A' : '#E0E6ED' },
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
    yaxis: {
      labels: { formatter: (value) => `${Math.round(value / 1000)}K` },
    },
    tooltip: {
      y: { formatter: (value) => `$${value ? value.toFixed(2) : '0.00'}` },
    },
  });

  const getProjectsByStatusOptions = () => ({
  chart: {
    type: 'donut',
    height: 460,
    fontFamily: 'Nunito, sans-serif',
    toolbar: { show: false },
    foreColor: isDark ? '#cbd5e1' : '#475569', // readable label/legend color
  },
  labels: ['Completed', 'Ongoing', 'Rejected'],
  colors: ['#00ab55', '#e2a03f', '#e7515a'],
  stroke: { show: true, width: 6, colors: [isDark ? '#0e1726' : '#fff'] }, // thinner ring = more room
  legend: {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    itemMargin: { horizontal: 12, vertical: 6 },
    markers: { width: 10, height: 10, radius: 12 },
    formatter: (seriesName, opts) => {
      const val = opts.w.globals.series[opts.seriesIndex] ?? 0;
      return `${seriesName}: ${val}`;
    },
  },
  dataLabels: {
    enabled: true, // enabled on large screens; disabled via responsive below
    formatter: (val) => `${Math.round(val)}%`,
    style: { fontSize: '12px', fontWeight: 600 },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: { show: true, fontSize: '14px' },
          value: {
            show: true,
            fontSize: '16px',
            formatter: (val) => `${val}`, // center value on hover
          },
          total: {
            show: true,
            label: 'Total Projects',
            fontSize: '18px',
            color: '#888ea8',
            formatter: (w) => {
              const sum = w.globals.seriesTotals.reduce((a, b) => a + (b || 0), 0);
              return `${sum}`;
            },
          },
        },
      },
      // only show slice labels when the angle is big enough (reduces overlap)
      minAngleToShowLabel: 12,
      expandOnClick: false,
    },
  },
  // Responsive rules to prevent overlap on smaller screens
  responsive: [
    {
      breakpoint: 1280, // xl
      options: {
        chart: { height: 420 },
        dataLabels: { style: { fontSize: '11px' } },
        plotOptions: { pie: { donut: { size: '72%' } } },
        legend: { fontSize: '12px', itemMargin: { vertical: 4 } },
      },
    },
    {
      breakpoint: 1024, // lg
      options: {
        chart: { height: 380 },
        dataLabels: { enabled: false }, // hide slice labels; rely on legend + center total
        plotOptions: { pie: { donut: { size: '74%' } } },
        legend: { fontSize: '12px' },
      },
    },
    {
      breakpoint: 640, // sm
      options: {
        chart: { height: 320 },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '76%' } } },
        legend: { fontSize: '11px', itemMargin: { vertical: 2 } },
      },
    },
  ],
});

  if (!isMounted || loading) {
    return (
      <div className="grid min-h-[calc(100vh-160px)] place-content-center">
        <span className="inline-flex h-20 w-20 animate-spin rounded-full border-4 border-primary !border-l-transparent"></span>
      </div>
    );
  }

  // Stat Card Component for KPIs
  const StatCard = ({ icon, value, title, colorClass }) => (
    <div className="panel flex items-center overflow-hidden p-4">
      <div className={`grid h-14 w-14 shrink-0 place-content-center rounded-md ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 ltr:ml-4 rtl:mr-4">
        <p className="text-lg font-semibold">{value}</p>
        <h5 className="text-sm text-white-dark">{title}</h5>
      </div>
    </div>
  );

  return (
    <div>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="/" className="text-primary hover:underline">
            Dashboard
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Sales</span>
        </li>
      </ul>

      <div className="pt-5">
        {/* Row 1: KPI Stat Cards */}
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<IndianRupee className="h-7 w-7" />}
            value={`₹${summaryData.revenue.toFixed(2)}`}
            title="Total Revenue"
            colorClass="bg-primary/20 text-primary"
          />
          <StatCard
            icon={<IconTag className="h-7 w-7" />}
            value={`₹${summaryData.profit.toFixed(2)}`}
            title="Net Profit"
            colorClass="bg-success-light text-success"
          />
          <StatCard
            icon={<IconShoppingCart className="h-7 w-7" />}
            value={summaryData.totalProjects}
            title="Total Projects"
            colorClass="bg-warning-light text-warning"
          />
          <StatCard
            icon={<IconCreditCard className="h-7 w-7" />}
            value={summaryData.ongoingProjects}
            title="Ongoing Projects"
            colorClass="bg-info-light text-info"
          />
        </div>

        {/* Row 2: Charts */}
        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="panel h-full xl:col-span-2">
            <h5 className="mb-5 text-lg font-semibold">Revenue Overview</h5>
            <div className="relative">
              <ReactApexChart
                series={revenueChartData.series}
                options={getRevenueChartOptions()}
                type="area"
                height={325}
              />
            </div>
          </div>
          <div className="panel h-full">
            <h5 className="mb-5 text-lg font-semibold">Projects by Status</h5>
            <ReactApexChart
              series={projectsByStatusData.series}
              options={getProjectsByStatusOptions()}
              type="donut"
              height={460}
            />
          </div>
        </div>

        {/* Row 3: Lists and Tables */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="panel h-full w-full">
            <h5 className="mb-5 text-lg font-semibold">Recent Projects</h5>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="group text-white-dark hover:text-black dark:hover:text-white-light/90"
                    >
                      <td className="min-w-[150px] text-black dark:text-white">
                        <div className="flex items-center">
                          {/* <img
                            className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3"
                            src={`/assets/images/profile-6.jpeg`}
                            alt="avatar"
                          /> */}
                          <span className="whitespace-nowrap">
                            {project.clientName}
                          </span>
                        </div>
                      </td>
                      <td>
                        {project.name?.substring(0, 25)}
                        {project.name?.length > 25 ? '...' : ''}
                      </td>
                      <td>
                        ₹
                        {(
                          parseFloat(project?.packageCost ?? 0) +
                          parseFloat(project?.additionalCost ?? 0)
                        ).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`badge shadow-md ${
                            project.status === 'completed'
                              ? 'bg-success'
                              : 'bg-secondary'
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel h-full w-full">
            <h5 className="mb-5 text-lg font-semibold">Financial Overview</h5>
            <div className="space-y-6">
              {financialOverview.recentTransactions.map((item, index) => (
                <div className="flex" key={index}>
                  <span
                    className={`grid h-9 w-9 shrink-0 place-content-center rounded-md text-base bg-${
                      item.type === 'income' ? 'success' : 'danger'
                    }-light text-${item.type === 'income' ? 'success' : 'danger'}`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 px-3">
                    <div>{item.name}</div>
                    <div className="text-xs text-white-dark">{item.date}</div>
                  </div>
                  <span
                    className={`whitespace-pre px-1 text-base font-semibold text-${
                      item.type === 'income' ? 'success' : 'danger'
                    } ltr:ml-auto rtl:mr-auto`}
                  >
                    {item.amount >= 0
                      ? `+₹${item.amount.toFixed(2)}`
                      : `-₹${Math.abs(item.amount).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
