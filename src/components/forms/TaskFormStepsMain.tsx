import { useState, type ChangeEvent } from "react";
import type { TaskForm } from "../../pages/TaskAdd";
import TextAreaRich from "../RichTextArea";
import { APIConnection } from "../../api/connection";

interface ProjectOption {
  code: string;
  definition: string;
}

interface Props {
  task: TaskForm;
  projects: ProjectOption[];
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onDefinitionChange: (value: string) => void;
  onProjectChange?: (projectId: string) => void; // <-- Yeni callback
}

export default function TaskFormStepMain({
  task,
  projects,
  error,
  onChange,
  onDefinitionChange,
  onProjectChange,
}: Props) {
  const connection = APIConnection.getInstance();
  const maxTitleChars = 50;

  const [statuses, setStatuses] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loadingProjectData, setLoadingProjectData] = useState(false);
  const [projectSelected, setProjectSelected] = useState(false);

  const handleProjectChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e);

    const projectId = e.target.value;
    setProjectSelected(!!projectId);

    // Parent component'e bildir
    if (onProjectChange) onProjectChange(projectId);

    if (!projectId) {
      setStatuses([]);
      setPriorities([]);
      setTypes([]);
      return;
    }

    setLoadingProjectData(true);

    try {
      const res = await connection.get<{ statuses: string[]; priorities: string[]; types: string[] }>(
        "project/getProjectConstants",
        { project_code: projectId }
      );

      if (res.status && res.data) {
        setStatuses(res.data.statuses);
        setPriorities(res.data.priorities);
        setTypes(res.data.types);
      } else {
        setStatuses([]);
        setPriorities([]);
        setTypes([]);
      }
    } catch (err) {
      console.error("Proje sabitleri alınamadı:", err);
      setStatuses([]);
      setPriorities([]);
      setTypes([]);
    } finally {
      setLoadingProjectData(false);
    }
  };

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Proje</label>
          <select
            name="projectId"
            value={task.projectId}
            onChange={handleProjectChange}
            className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Projeyi Seçiniz</option>
            {projects.map((p) => (
              <option key={p.code} value={p.code}>
                {p.definition}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              name="startDate"
              value={task.startDate}
              onChange={onChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              name="endDate"
              value={task.endDate}
              onChange={onChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Görev Başlığı</label>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={onChange}
            maxLength={maxTitleChars}
            className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <span className="text-xs text-right text-gray-500 block">
            {task.title?.length || 0}/{maxTitleChars} karakter
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {projectSelected && (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Öncelik</label>
              <select
                name="priority_definition"
                value={task.priority_definition || ""}
                onChange={onChange}
                className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingProjectData || priorities.length === 0}
              >
                <option value="">Öncelik Seçiniz</option>
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Durum</label>
              <select
                name="status_definition"
                value={task.status_definition || ""}
                onChange={onChange}
                className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingProjectData || statuses.length === 0}
              >
                <option value="">Durum Seçiniz</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Görev Tipi</label>
              <select
                name="type_definition"
                value={task.type_definition || ""}
                onChange={onChange}
                className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingProjectData || types.length === 0}
              >
                <option value="">Tip Seçiniz</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="md:col-span-2 flex flex-col gap-2 mt-4">
        <label className="block text-sm text-gray-700 mb-1">Görev Açıklaması</label>
        <TextAreaRich
          mode="edit"
          value={task.description || ""}
          onChange={onDefinitionChange}
        />
      </div>

      {error && (
        <div className="md:col-span-2 flex gap-2 items-center text-red-500">
          <span className="text-xl">⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}
    </form>
  );
}
