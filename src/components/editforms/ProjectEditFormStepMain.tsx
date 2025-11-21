import { type ChangeEvent } from "react";
import type { IManager } from "../../pages/ProjectAdd";
import type { EditProjectForm } from "../../pages/EditProject";

interface Props {
  project: EditProjectForm;
  managers: IManager[];
  maxChars: number;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function EditProjectFormStepMain({
  project,
  managers,
  maxChars,
  error,
  onChange,
}: Props) {
  return (
    <form className="flex flex-col gap-6 max-w mt-4">
      <div className="max-w-2xs">
        <label className="block text-sm text-gray-700 mb-1">Proje Yöneticisi (opsiyonel)</label>
        <select
          name="managerId"
          value={project.managerId}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Yöneticiyi Seçiniz</option>
          {managers.map((m) => (
            <option key={m.code} value={m.code}>{m.full_name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 max-w-2xl">
        <div className="flex-1">
          <label className="block text-sm text-gray-700 mb-1">Başlangıç Tarihi</label>
          <input
            type="date"
            name="startDate"
            value={project.startDate}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-700 mb-1">Bitiş Tarihi</label>
          <input
            type="date"
            name="endDate"
            value={project.endDate}
            onChange={onChange}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col max-w-2xl">
        <label className="block text-sm text-gray-700 mb-1">Proje Tanımı</label>
        <input
          type="text"
          name="definition"
          maxLength={maxChars}
          value={project.definition}
          onChange={(e) => {
            onChange(e);
          }}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Kelime sayısı: {project.definition.length} / {maxChars}
        </p>
      </div>

      {error && (
        <div className="flex gap-2 items-center text-red-500">
          <span className="text-xl">⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}
    </form>
  );
}
