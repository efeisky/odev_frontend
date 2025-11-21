import { useState, type FormEvent, type ChangeEvent } from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { FiAlertCircle } from "react-icons/fi";
import { APIConnection } from "../api/connection";

interface UserForm {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
}

export default function UserAdd() {
  const connection = APIConnection.getInstance();
  const [user, setUser] = useState<UserForm>({
    name: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await connection.post("auth/createUser", {
        email: user.email,
        phone: user.phone === "" ? null : user.phone,
        name: user.name,
        surname: user.surname,
        password: user.password,
      });

      if (res.status) {
        alert("✅ Kullanıcı başarıyla eklendi!");
        setUser({ name: "", surname: "", email: "", password: "", phone: "" });
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

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <Page>
        <PageHeader text="ADMIN - Kullanıcı Ekle" />

        <div className="max-w-md mx-auto mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 transition hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Yeni Kullanıcı Oluştur
            </h2>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {[
                { name: "name", placeholder: "İsim", type: "text", required: true },
                { name: "surname", placeholder: "Soyisim", type: "text", required: true },
                { name: "email", placeholder: "E-posta", type: "email", required: true },
                { name: "password", placeholder: "Şifre", type: "password", required: true },
                { name: "phone", placeholder: "Telefon Numarası", type: "tel", required: false },
              ].map((field) => (
                <input
                  key={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={user[field.name as keyof UserForm]}
                  onChange={handleChange}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  required={field.required}
                />
              ))}

              {error && (
                <div className="flex gap-2 items-center bg-red-50 border border-red-200 p-2 rounded-lg">
                  <FiAlertCircle className="text-red-500" />
                  <p className="text-red-500 font-medium text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition font-medium"
              >
                {loading ? "Kullanıcı Ekleniyor..." : "Kullanıcı Ekle"}
              </button>
            </form>
          </div>
        </div>
      </Page>
    </div>
  );
}
