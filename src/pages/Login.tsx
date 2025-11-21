import { useEffect, useState, type FormEvent } from "react";
import { FiAlertCircle } from "react-icons/fi";
import {APIConnection} from "../api/connection";

interface LoginResponseData { key: string }

export default function Login() {
  const connection = APIConnection.getInstance()
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const sessKey = localStorage.getItem("sess_key")
    if (sessKey) {
      window.location.href = "/dashboard"
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!error) {
        setError(null);
    }

    try {
      const res = await connection.post<LoginResponseData>('auth/login', {email, password})
      if (res.status) {
        localStorage.setItem("sess_key", res.data!.key);
        window.location.href = "/dashboard"
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.log(err)
      setError("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Giriş Sayfası</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
            {
                error && 
                <div className="flex gap-1 items-center ">
                    <FiAlertCircle className="text-red-500"/>
                    <p className="font-medium text-red-400">{error}</p>
                </div>
            }
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors cursor-pointer"
            disabled={loading}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
