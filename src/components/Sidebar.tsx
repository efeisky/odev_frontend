import { FiCalendar, FiLogOut } from "react-icons/fi";
import SidebarSection from "./SidebarSection";
import { getNavByRole } from "../config/nav_routes";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { UserRoles } from "../api/auth";
import { APIConnection } from "../api/connection";

interface AuthResponse {
  auth: string | null,
}

export default function Sidebar() {
  const connection = APIConnection.getInstance();
  const [role, setRole] = useState<UserRoles | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    const confirmed = window.confirm("Sistemden çıkış yapmak istediğine emin misin?");
    if (!confirmed) return;

    Cookies.remove("user_code");
    Cookies.remove("user_role");

    localStorage.removeItem("sess_key");

    window.location.href = "/login";
  };

  useEffect(() => {
    const checkRole = async () => {
      const userCode = Cookies.get("user_code");
      const sessRole = Cookies.get("user_role");

      if (userCode && sessRole && Object.values(UserRoles).includes(sessRole as UserRoles)) {
        setRole(sessRole as UserRoles);
        setLoading(false);
        return;
      }

      const sessKey = localStorage.getItem("sess_key");
      if (!sessKey) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await connection.auth<AuthResponse>("auth/check", { key: sessKey });
        if (!response.status) {
          localStorage.removeItem("sess_key");
          if (sessionStorage.getItem("userCache")) {
            sessionStorage.removeItem("userCache");
          }
          window.location.href = "/login";
        } else {
          const userCode = Cookies.get("user_code");
          const sessRole = Cookies.get("user_role");

          if (userCode && sessRole && Object.values(UserRoles).includes(sessRole as UserRoles)) {
            setRole(sessRole as UserRoles);
            setLoading(false);
          } else {
            alert("Problem oluştu.");
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
        localStorage.removeItem("sess_key");
        window.location.href = "/login";
      }
    };

    checkRole();
  }, [connection]);


  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!role) return null;


  return (
    <nav className="bg-white shadow-sm w-60 min-h-screen px-4 py-8 flex flex-col gap-6 fixed">
      <span className="flex items-center text-xl text-blue-600 font-semibold mb-8 cursor-pointer" onClick={()=>{window.location.href = "/dashboard"}}>
        <FiCalendar className="mr-2" /> Proje Sistemi
      </span>

      {getNavByRole(role).map((section, index) => (
        <SidebarSection key={index} section={section} />
      ))}

      <div className="auth-area mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full bg-red-100 text-red-700 hover:bg-red-200 transition rounded-xl py-2 px-3 font-medium"
        >
          <FiLogOut className="text-lg" />
          Güvenli Çıkış
        </button>
      </div>
    </nav>
  );
}
