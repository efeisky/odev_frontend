import { useState, useEffect } from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { APIConnection } from "../api/connection";
import { useNavigate } from "react-router-dom";

interface UsersResponseData {
  users: User[];
}

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  code: string;
  active: boolean;
}

export default function Users() {
  const connection = APIConnection.getInstance();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showActive, setShowActive] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await connection.get<UsersResponseData>(
          "general/getUsersForAdmin"
        );
        if (res.status && res.data) {
          setUsers(res.data.users);
        } else {
          setError(res.message || "Kullanıcılar alınamadı.");
        }
      } catch (err) {
        console.log(err);
        setError("Sunucu ile bağlantı kurulamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    sessionStorage.setItem("userCache", JSON.stringify(user));
    navigate(`/edituser`);
  };

  const filteredUsers = users.filter((u) => showActive ? u.active : !u.active);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <Page>
        <PageHeader text="ADMIN - Kullanıcılar" />

        {/* Filtre */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setShowActive(true)}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              showActive
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setShowActive(false)}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              !showActive
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Deaktif
          </button>
        </div>

        {loading ? (
          <p className="text-center py-4 text-gray-500">Yükleniyor...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">{error}</p>
        ) : (
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm mt-4 bg-white">
            <thead className="bg-gray-300 text-black">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Ad</th>
                <th className="py-2 px-4 text-left">Soyad</th>
                <th className="py-2 px-4 text-left">E-posta</th>
                <th className="py-2 px-4 text-left">Telefon</th>
                <th className="py-2 px-4 text-left">Durum</th>
                <th className="py-2 px-4 text-left">İşlem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-100 transition-colors">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.surname}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.phone}</td>
                  <td className="py-2 px-4">
                    {user.active ? (
                      <span className="text-green-600 font-medium">Aktif</span>
                    ) : (
                      <span className="text-red-600 font-medium">Deaktif</span>
                    )}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-gray-800 hover:bg-gray-700 text-white py-1 px-3 rounded transition cursor-pointer"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Hiç kullanıcı yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Page>
    </div>
  );
}
