import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { FiAlertCircle } from "react-icons/fi";
import { APIConnection } from "../api/connection";

interface UserForm {
  id?: string;
  name: string;
  surname: string;
  email: string;
  password?: string;
  phone: string;
  isActive: boolean;
  code: string;
}

export default function UserEdit() {
  const connection = APIConnection.getInstance();

  const [user, setUser] = useState<UserForm>({
    id: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
    isActive: true,
    code: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedUser = sessionStorage.getItem("userCache");
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      setUser((prev) => ({
        ...prev,
        id: parsed.id || "",
        name: parsed.name || "",
        surname: parsed.surname || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        isActive: parsed.isActive ?? parsed.active ?? false,
        code: parsed.code
      }));
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData: Record<string, any> = {
        code: user.code,
        name: user.name,
        surname: user.surname,
        email: user.email,
      };

      if (user.phone.trim() !== "") {
        updateData.phone = user.phone.trim();
      } else {
        updateData.phone = null;
      }

      if (user.password && user.password.trim() !== "") {
        updateData.password = user.password.trim();
      } else {
        updateData.password = null;
      }
      const res = await connection.put("general/updateUser", updateData);

      if (res.status) {
        alert("✅ Kullanıcı bilgileri güncellendi!");
        sessionStorage.setItem("userCache", JSON.stringify(user));
      } else {
        setError(res.message || "Güncelleme başarısız oldu.");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Sunucu ile bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const newStatus = !user.isActive;
      const res = await connection.put("general/setActivationForUser", {
        code: user.code,
      });

      if (res.status) {
        setUser((prev) => ({ ...prev, isActive: newStatus }));
        alert(
          newStatus
            ? "✅ Kullanıcı aktifleştirildi."
            : "🚫 Kullanıcı pasifleştirildi."
        );

        sessionStorage.setItem(
          "userCache",
          JSON.stringify({ ...user, isActive: newStatus })
        );
      } else {
        setError(res.message || "Durum güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      setError("Durum güncellenemedi.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <Page>
        <PageHeader text="ADMIN - Kullanıcı Düzenle" />

        <form
          className="flex flex-col gap-4 max-w-md bg-white shadow-md rounded-2xl p-8"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Kullanıcı Bilgileri
          </h2>

          {[
            { name: "name", placeholder: "İsim", type: "text" },
            { name: "surname", placeholder: "Soyisim", type: "text" },
            { name: "email", placeholder: "E-posta", type: "email" },
            {
              name: "password",
              placeholder: "Yeni Şifre (opsiyonel)",
              type: "password",
            },
            { name: "phone", placeholder: "Telefon Numarası", type: "tel" },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={user[field.name as keyof UserForm] as string}
              onChange={handleChange}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          ))}

          {error && (
            <div className="flex gap-2 items-center bg-red-50 border border-red-200 p-2 rounded-lg">
              <FiAlertCircle className="text-red-500" />
              <p className="font-medium text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* ✅ Durum gösterimi + değiştir butonu */}
          <div className="flex items-center gap-3 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.isActive ? "Aktif" : "Pasif"}
            </span>

            <button
              type="button"
              onClick={handleToggleActive}
              className="px-3 py-1 rounded-xl bg-gray-800 text-white text-sm hover:bg-gray-700 transition"
            >
              Değiştir
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gray-800 text-white py-2.5 rounded-xl hover:bg-gray-700 transition"
          >
            {loading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
          </button>
        </form>
      </Page>
    </div>
  );
}
