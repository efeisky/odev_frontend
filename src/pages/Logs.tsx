import { useState, useEffect } from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { APIConnection } from "../api/connection";
import Cookies from 'js-cookie'

interface Log {
  id: number;
  message: string;
  owner_name: string;
  created_at: string;
}

export default function Logs() {
  const connection = APIConnection.getInstance();
  const [logs, setLogs] = useState<Log[]>([]);
  const user_code = Cookies.get("user_code");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await connection.get<{logs: Log[]}>("general/getLogs", { user_code });
        if (response.status) {
          setLogs(response.data!.logs);
        } else {
          setLogs([]);
          console.error("Loglar çekilemedi:", response.message);
        }
      } catch (error) {
        console.error("API hata:", error);
        setLogs([]);
      }
    };

    fetchLogs();
  }, []);

  const displayedLogs = logs.slice(0, 100);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <Page>
        <PageHeader text="Loglar" />

        <div className="mt-4 border border-gray-300 rounded-lg shadow-lg bg-gray-200 overflow-auto max-h-[70vh]">
          <table className="min-w-full ">
            <thead className="bg-gray-300 text-gray-800">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Message</th>
                <th className="py-2 px-4 text-left">Owner</th>
                <th className="py-2 px-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400">
              {displayedLogs.map((log: Log) => (
                <tr key={log.id} className="hover:bg-gray-300 transition-colors text-sm text-black">
                  <td className="py-2 px-4 font-bold font-mono">{log.id}</td>
                  <td className="py-2 px-4">{log.message}</td>
                  <td className="py-2 px-4 font-semibold">{log.owner_name}</td>
                  <td className="py-2 px-4 font-mono">{`${new Date(log.created_at).toLocaleTimeString()} ${new Date(log.created_at).toLocaleDateString()}`}</td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Hiç Log yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {logs.length == 100 && (
            <div className="text-center py-2 text-black border-t border-gray-500">
              Daha fazla veri için admin ile iletişime geçin.
            </div>
          )}
        </div>
      </Page>
    </div>
  );
}
