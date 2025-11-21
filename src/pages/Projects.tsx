import { useState, useEffect } from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { APIConnection } from "../api/connection";
import { statusMap } from "./ProjectDetails";
import Cookies from "js-cookie";

interface Project {
  code: string;
  definition: string;
  status: string;
  date_start: string;
  date_end: string;
  manager_name: string | null;
}


interface ProjectsResponseData {
  projects: Project[];
}

export default function Projects() {
  const connection = APIConnection.getInstance();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const userCode = Cookies.get("user_code");
      const res = await connection.get<ProjectsResponseData>("project/getProjects", {
        user_code: userCode,
      });

      if (res.status && res.data) {
        setProjects(res.data!.projects);
      } else {
        setError(res.message || "Projeler alınamadı.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <Page>
        <PageHeader text="PROJELER - Projelerim" />

        {loading && <p className="text-gray-500 mt-4">Yükleniyor...</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="flex flex-col gap-6 mt-4">
          {projects.map((project) => (
            <div
              key={project.code}
              className="relative w-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  🚀 {project.definition}
                </h3>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-700`}
                >
                  {statusMap[project.status]}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  👤 {project.manager_name || "Atanmamış"}
                </span>
                <span className="flex items-center gap-1">📅 {project.date_start}</span>
                <span className="flex items-center gap-1">🏁 {project.date_end}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() =>
                      (window.location.href = `/projectdetails?id=${project.code}`)
                    }
                    className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                  >
                    📋 Detaylarına Git
                  </button>

                </div>

                <span className="text-xs text-gray-400 font-mono">#{project.code}</span>
              </div>
            </div>
          ))}

          {!loading && projects.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-10">
              Henüz bir projen bulunmuyor.
            </p>
          )}
        </div>
      </Page>

    </div>
  );
}
