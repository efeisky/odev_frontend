import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import TaskCard from "../components/TaskCard";
import { type Task } from "../config/tasks_data";
import { APIConnection } from "../api/connection";
import { FiFilter } from "react-icons/fi";
import Cookies from "js-cookie";
import { useSearchParams } from "react-router-dom";

interface TasksResponseData {
  tasks: Task[];
}

interface ProjectsResponseData {
  projects: {
    code: string;
    definition: string;
  }[];
}

export default function Tasks() {
  const connection = APIConnection.getInstance();
  const userCode = Cookies.get("user_code");

  const [searchParams] = useSearchParams(); // 🔹 URL Query için

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectsResponseData["projects"]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<
    "all" | "completed" | "upcoming"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 URL Query Parametresi: type = completed | upcoming | all
  useEffect(() => {
    const type = searchParams.get("type");

    if (type === "completed") {
      setSelectedTimeFilter("completed");
    } else if (type === "upcoming") {
      setSelectedTimeFilter("upcoming");
    } else {
      setSelectedTimeFilter("all"); // 🔹 type yoksa, geçersizse → all
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectRes, taskRes] = await Promise.all([
          connection.get<ProjectsResponseData>("tasks/getProjectsForTask", {
            user_code: userCode,
          }),
          connection.get<TasksResponseData>("tasks/getTasks", { user_code: userCode }),
        ]);

        if (projectRes.status && projectRes.data) setProjects(projectRes.data.projects);
        if (taskRes.status && taskRes.data?.tasks) setTasks(taskRes.data.tasks);
      } catch (err) {
        console.error(err);
        setError("Veriler alınamadı. Sunucu bağlantısı başarısız.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [connection, userCode]);

  const createdByUsers = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.created_by).filter(Boolean))),
    [tasks]
  );

  const assignedUsers = useMemo(
    () => Array.from(new Set(tasks.flatMap((t) => t.assigned_users || []).filter(Boolean))),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    return tasks.filter((task) => {
      const startDate = task.start_date ? new Date(task.start_date) : null;
      const endDate = task.end_date ? new Date(task.end_date) : null;

      // 🔹 Zaman filtresi
      const timeMatch =
        selectedTimeFilter === "all"
          ? true
          : selectedTimeFilter === "completed"
          ? endDate && endDate < now
          : selectedTimeFilter === "upcoming"
          ? startDate && startDate > now && startDate <= sevenDaysLater
          : true;

      const projectMatch = selectedProject ? task.project_code === selectedProject : true;
      const creatorMatch = selectedCreator ? task.created_by === selectedCreator : true;
      const assigneeMatch = selectedAssignee
        ? (task.assigned_users || []).includes(selectedAssignee)
        : true;

      return timeMatch && projectMatch && creatorMatch && assigneeMatch;
    });
  }, [tasks, selectedProject, selectedCreator, selectedAssignee, selectedTimeFilter]);

  const resetFilters = () => {
    setSelectedProject("");
    setSelectedCreator("");
    setSelectedAssignee("");
    setSelectedTimeFilter("all");
  };

  const handleMainStatusChange = async (taskId: number, newStatus: "continue" | "finished") => {
    const res = await connection.put("tasks/setMainTaskStatus", {
      task_id: taskId,
      new_status: newStatus,
    });

    if (res.status)
      setTasks((prev) =>
        prev.map((t) =>
          t.task_id === taskId ? { ...t, status_category: newStatus } : t
        )
      );
  };

  const handleSubtaskStatusChange = async (
    taskId: number,
    subtaskId: number,
    newStatus: "continue" | "finished"
  ) => {
    setLoading(true);
    try {
      const res = await connection.put("tasks/setSubTaskStatus", {
        task_id: taskId,
        sub_id: subtaskId,
        new_status: newStatus,
      });

      if (res.status) {
        setTasks((prev) =>
          prev.map((t) =>
            t.task_id === taskId
              ? {
                  ...t,
                  sub_tasks: t.sub_tasks.map((sub) =>
                    sub.id === subtaskId ? { ...sub, status: newStatus } : sub
                  ),
                }
              : t
          )
        );
      } else setError(res.message || "Kaydedilemedi.");
    } catch {
      setError("Alt görev durumu güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilter =
    selectedProject || selectedCreator || selectedAssignee || selectedTimeFilter !== "all";

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <Page>
        <PageHeader text="GÖREVLER - Görevlerim" />

        <div className="flex flex-col bg-white p-4 rounded-xl shadow-md mt-4 gap-4 border border-gray-200">

          {/* 🔹 Zaman Filtreleri */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedTimeFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                selectedTimeFilter === "all"
                  ? "bg-blue-100 text-blue-800 border-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              Hepsi
            </button>

            <button
              onClick={() => setSelectedTimeFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                selectedTimeFilter === "completed"
                  ? "bg-blue-100 text-blue-800 border-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              Tamamlanan
            </button>

            <button
              onClick={() => setSelectedTimeFilter("upcoming")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                selectedTimeFilter === "upcoming"
                  ? "bg-blue-100 text-blue-800 border-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              Yaklaşan (7 gün)
            </button>
          </div>

          {/* 🔹 Diğer Filtreler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Proje</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="">Tüm Projeler</option>
                {projects.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.definition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Oluşturan</label>
              <select
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="">Tümü</option>
                {createdByUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Atanan</label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="">Tümü</option>
                {assignedUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔹 Filtreyi Temizle */}
          <div className="flex justify-between items-center border-t pt-3 mt-2 border-t-gray-200">
            <button
              onClick={resetFilters}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border shadow-sm transition-all duration-200 cursor-pointer
                ${
                  hasActiveFilter
                    ? "bg-red-50 text-red-600 border-red-400 hover:bg-red-100"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
            >
              <FiFilter className={`text-base ${hasActiveFilter ? "text-red-500" : "text-gray-500"}`} />
              Filtreyi Temizle
            </button>

            <div className="text-sm text-gray-600">
              Görev Sayısı: <b>{filteredTasks.length}</b> / {tasks.length}
            </div>
          </div>
        </div>

        {loading && <p className="mt-6 text-gray-500 text-center">Yükleniyor...</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

        <div className="flex flex-col gap-6 mt-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              handleMainStatusChange={handleMainStatusChange}
              handleSubtaskStatusChange={handleSubtaskStatusChange}
            />
          ))}

          {!loading && filteredTasks.length === 0 && (
            <p className="text-gray-500 text-center mt-6">
              Bu filtreye uygun görev bulunamadı.
            </p>
          )}
        </div>
      </Page>
    </div>
  );
}
