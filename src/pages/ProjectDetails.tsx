import Sidebar from "../components/Sidebar";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import { useState, useEffect } from "react";
import ProjectInfoCard from "../components/project/ProjectInfoCard";
import ProjectStatusOverview from "../components/project/ProjectStatusOverview";
import ProjectMembersTable from "../components/project/ProjectMembersTable";
import { FiEdit3 } from "react-icons/fi";
import { MdOutlineSettings } from "react-icons/md";
import { APIConnection } from "../api/connection";

export const statusMap: Record<string, string> = {
  "reseraching": "Araştırma",
  "started": "Başlatıldı",
  "continue": "Devam Ediyor",
  "finished": "Tamamlandı",
  "canceled": "İptal Edildi",
};

const reverseStatusMap: Record<string, string> = Object.fromEntries(
  Object.entries(statusMap).map(([key, value]) => [value, key])
);

// ✅ Response tipi
interface ProjectDetail {
  name: string;
  status: string;
  date_start: string;
  date_end: string;
  manager_name: string;
  task_count: number;
}

interface ProjectMember {
  id: number;
  name: string;
  role: string;
}

interface ProjectMeta {
  priorities: string[];
  statuses: string[];
  types: string[];
}

interface ProjectsResponseData {
  project_detail: ProjectDetail;
  project_members: ProjectMember[];
  project_meta: ProjectMeta;
}

function ProjectDetails() {
  const connection = APIConnection.getInstance();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [project, setProject] = useState({
    name: "",
    status: "",
    startDate: "",
    endDate: "",
    manager: "",
    priority: "",
    taskCount: 0,
    type: "",
  });
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<string[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        const res = await connection.get<ProjectsResponseData>(
          "project/getProjectDetail",
          { project_code: id }
        );

        if (res.status && res.data) {
          const data = res.data;
          const detail = data.project_detail;

          setProject({
            name: detail.name || "",
            status: detail.status || "",
            startDate: detail.date_start || "",
            endDate: detail.date_end || "",
            manager: detail.manager_name || "",
            taskCount: detail.task_count || 0,
            priority: data.project_meta.priorities?.[0] || "",
            type: data.project_meta.types?.[0] || "",
          });

          setMembers(
            (data.project_members || []).map((member, index) => ({
              id: index + 1,
              name: member.name,
              role: member.role,
            }))
          );
          setStatusOptions(data.project_meta.statuses || []);
          setPriorityOptions(data.project_meta.priorities || []);
          setTypeOptions(data.project_meta.types || []);
        } else {
          setError(res.message || "Projeler alınamadı.");
        }
      } catch (err) {
        console.error(err);
        setError("Projeler alınamadı. Sunucu ile bağlantı kurulamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [connection, id]);

  const handleStatusChange = async(status: string) => {
    try{
      const res = await connection.put("project/changeProjectStatus", {
        project_code: id,
        project_status: status,
      });

      if (res.status) {
        alert("✅ Durum Kaydedildi!");
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <PageHeader text="PROJELER - Proje Detayı" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <MdOutlineSettings className="text-gray-500 text-lg" />
              <label
                htmlFor="status"
                className="text-sm text-gray-600 font-medium"
              >
                Durum:
              </label>
              <select
                id="status"
                value={statusMap[project.status] || project.status}
                onChange={(e) => {
                  const englishStatus = reverseStatusMap[e.target.value];
                  setProject((prev) => ({ ...prev, status: englishStatus }));
                  handleStatusChange(englishStatus);
                }}
                className="bg-transparent text-gray-800 text-sm font-medium focus:outline-none focus:ring-0 appearance-none pr-6"
              >
                {Object.values(statusMap).map((statusTr) => (
                  <option key={statusTr} value={statusTr}>
                    {statusTr}
                  </option>
                ))}
              </select>

            </div>

            <button
              onClick={() => (window.location.href = `/editproject?id=${id}`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
            >
              <FiEdit3 className="text-white text-base" />
              <span>Projeyi Düzenle</span>
            </button>
          </div>
        </div>

        {loading && <p>Yükleniyor...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <ProjectInfoCard
          project={{
            endDate: project.endDate,
            manager: project.manager,
            name: project.name,
            status: statusMap[project.status],
            taskCount: project.taskCount,
            startDate: project.startDate,
            usersCount: members.length,
          }}
        />

        <ProjectStatusOverview
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          typeOptions={typeOptions}
        />

        <ProjectMembersTable
          members={members}
          showAllMembers={showAllMembers}
          onToggleShowAll={() => setShowAllMembers(!showAllMembers)}
        />
      </Page>
    </div>
  );
}

export default ProjectDetails;
