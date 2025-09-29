"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { getAuth } from "firebase/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// A simple loading component
const LoadingSpinner = ({ text }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-600">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4">{text}</p>
  </div>
);

const toYYYYMMDD = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function AttendanceViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW STATE FOR FILTERS ---
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // JS month is 0-based
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      const user = getAuth().currentUser;
      if (!user) {
        setError("Admin not logged in.");
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [memberRes, historyRes] = await Promise.all([
          axios.get(`${API_URL}/api/members/${id}`, { headers }),
          axios.get(`${API_URL}/api/members/${id}/attendance`, { headers }),
        ]);

        if (!memberRes.data) {
          throw new Error("Member not found.");
        }
        setMember(memberRes.data);

        const actualRecords = historyRes.data;
        if (actualRecords.length === 0) {
          setHistory([]);
          return;
        }

        const recordsMap = new Map(
          actualRecords.map((rec) => [toYYYYMMDD(rec.a_date), rec])
        );

        const startDate = new Date(
          actualRecords[actualRecords.length - 1].a_date
        );
        const endDate = new Date();

        const fullHistory = [];
        for (
          let day = new Date(endDate);
          day >= startDate;
          day.setDate(day.getDate() - 1)
        ) {
          const dateKey = toYYYYMMDD(day);
          if (recordsMap.has(dateKey)) {
            fullHistory.push(recordsMap.get(dateKey));
          } else {
            fullHistory.push({
              a_id: dateKey,
              a_date: new Date(day).toISOString(),
              a_status: 0,
              in_time: null,
              out_time: null,
            });
          }
        }

        setHistory(fullHistory);
      } catch (err) {
        console.error("Failed to fetch details", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Could not load attendance data for this member."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading History..." />;
  if (error)
    return (
      <div className="text-center mt-10 p-4 bg-red-100 text-red-700 rounded-md max-w-md mx-auto">
        {error}
      </div>
    );

  // --- FILTER LOGIC ---
  const filteredHistory = history.filter((rec) => {
    const d = new Date(rec.a_date);
    return (
      d.getMonth() + 1 === Number(selectedMonth) &&
      d.getFullYear() === Number(selectedYear)
    );
  });

  // For year dropdown (range: from oldest record → today)
  const years = Array.from(
    new Set(history.map((rec) => new Date(rec.a_date).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <main className="min-h-screen p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl dark:text-gray-200 font-bold text-gray-800">
            Attendance History
          </h1>
          {member && (
            <p className="text-lg dark:text-gray-400 text-gray-600">
              For {member.name}
            </p>
          )}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 dark:text-gray-200 text-black text-sm font-medium flex items-center"
        >
          ⬅ Back
        </button>
      </div>

      {/* --- Month & Year Filter --- */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((m, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock In
              </th>
              <th className="px-6 py-3 dark:text-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock Out
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:bg-gray-900">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((rec) => (
                <tr
                  key={rec.a_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 dark:text-gray-200 whitespace-nowrap text-sm text-gray-800">
                    {new Date(rec.a_date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 dark:text-gray-200 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rec.a_status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rec.a_status === 1 ? "Present" : "Absent"}
                    </span>
                  </td>
                  <td className="px-6 dark:text-gray-200 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rec.in_time || "N/A"}
                  </td>
                  <td className="px-6 dark:text-gray-200 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rec.out_time || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-10 text-gray-500 dark:text-gray-400"
                >
                  No records for {selectedMonth}/{selectedYear}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
