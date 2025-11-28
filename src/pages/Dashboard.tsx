import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Page from "../components/Page";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { FiChevronRight, FiClock } from "react-icons/fi";
import { APIConnection } from "../api/connection";
import Cookies from 'js-cookie'

export interface DashboardResponseData {
  full_name: string;
  logs: string[];
  tasks_counts: {
    all_count: number;
    finished_count: number;
    nearly_count: number;
    ongoing_count: number;
  };
  tasks_by_date: Record<string, string[]>;
}

const Dashboard: React.FC = () => {
  const [connectionReady, setConnectionReady] = useState(false);
  const [connection, setConnection] = useState<APIConnection | null>(null);

  const [data, setData] = useState<DashboardResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [error, setError] = useState<string>("");
  const [summaryData, setSummaryData] = useState<{ name: string; value: number; color: string }[]>([]);

  // Sidebar hazır olduğunda çağrılacak
  const handleConnectionReady = (conn: APIConnection) => {
    setConnection(conn);
    setConnectionReady(true);
  };

  // Dashboard verilerini fetch et
  useEffect(() => {
    if (!connectionReady || !connection) return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
          const user_code = Cookies.get('user_code')
          const res = await connection.get<DashboardResponseData>('general/dashboard', { "user_code": user_code });
          if (res.status && res.data) {
            setData(res.data);
            setSummaryData([
              { name: "Yaklaşan Görevler", value: res.data.tasks_counts.nearly_count, color: "#F59E0B" },
              { name: "Devam Eden Görevler", value: res.data.tasks_counts.ongoing_count, color: "#22C55E" },
              { name: "Tamamlanan Görevler", value: res.data.tasks_counts.finished_count, color: "#3B82F6" },
            ]);
          } else {
            setError(res.message);
          }
      } catch (err) {
        console.log(err);
        setError("Sunucu ile bağlantı kurulamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [connectionReady, connection]);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg animate-pulse">
          {error || "Yükleniyor..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onConnectionReady={handleConnectionReady} />
      <Page>
        {data ? (<div className="p-6 grid grid-cols-1 gap-6">

          {/* Hoşgeldin Card */}
          <div className="relative bg-linear-to-r from-indigo-900 to-indigo-800 text-white p-8 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-between">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">Hoş geldin, {data.full_name}!</h1>
              <p className="text-white/80 text-lg">
                {new Date().toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="relative z-10">
              <button
                className="px-6 py-3 inline-flex gap-2 items-center whitespace-nowrap text-white bg-white/20 hover:bg-white/30 transition rounded-xl font-semibold shadow-lg cursor-pointer"
                onClick={() => { window.location.href = "/tasks"; }}
              >
                Görevlere Git
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* 3’lü Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="/tasks?type=all"
              className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-start border-l-4 border-indigo-500 cursor-pointer"
            >
              <h3 className="text-gray-700 font-semibold text-lg mb-2">Toplam Görevler</h3>
              <p className="text-3xl font-bold text-gray-800">{data.tasks_counts.all_count}</p>
            </a>

            <a 
              href="/tasks?type=completed"
              className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-start border-l-4 border-green-500 cursor-pointer"
            >
              <h3 className="text-gray-700 font-semibold text-lg mb-2">Tamamlanan Görevler</h3>
              <p className="text-3xl font-bold text-green-600">{data.tasks_counts.finished_count}</p>
            </a>

            <a 
              href="/tasks?type=upcoming"
              className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-start border-l-4 border-amber-500 cursor-pointer"
            >
              <h3 className="text-gray-700 font-semibold text-lg mb-2">Yaklaşan Görevler</h3>
              <p className="text-3xl font-bold text-amber-600">{data.tasks_counts.nearly_count}</p>
            </a>
          </div>

          {/* Alt Alan: Sol geniş, Sağ dar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sol sütun (2/3) */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Görev Özeti (PieChart) */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="font-semibold text-gray-700 mb-4">Görev Özeti</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={summaryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                    >
                      {summaryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} Görev`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Son 5 Log */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="font-semibold text-gray-700 mb-4">Son 5 Log</h2>
                <ul className="text-sm text-gray-600 space-y-2">
                  {data.logs.slice(-5).map((log, idx) => (
                    <li key={idx} className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                      <FiClock className="text-gray-400" />
                      <span>{log}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Sağ sütun (1/3) */}
            <div className="lg:col-span-1 flex flex-col gap-6">

              {/* Takvim Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4">
                <h2 className="font-semibold text-gray-700 mb-4">Takvim</h2>

                <Calendar
                  onChange={(value) => { if (value instanceof Date) setDate(value); }}
                  value={date}
                  tileContent={({ date: d, view }) => {
                    if (view === "month") {
                      const key = formatDate(d); // artık yerel tarih
                      const hasTask = data.tasks_by_date[key]?.length > 0;
                      return hasTask ? (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full"></div>
                      ) : null;
                    }
                    return null;
                  }}
                  tileClassName={"relative"}
                  next2Label={null}
                  prev2Label={null}
                />

                <div className="mt-4 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
                  <h3 className="text-gray-700 font-semibold mb-4 text-lg">
                    {date.toLocaleDateString()} Aktiviteleri
                  </h3>
                  {data.tasks_by_date[formatDate(date)] ? (
                    <ul className="space-y-3">
                      {data.tasks_by_date[formatDate(date)].map((task, idx) => (
                        <li key={idx} className="bg-white p-3 rounded-lg shadow flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></span>
                          <span className="text-gray-700">{task}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">Bu gün için aktivite bulunmuyor.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>) : (<></>)}
        
      </Page>
    </div>
  );
};

export default Dashboard;
