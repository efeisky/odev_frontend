import { useState, type ChangeEvent, useEffect } from "react";
import TextAreaRich from "../RichTextArea";
import type { TaskEditForm } from "../../pages/EditTask";

interface Props {
  task: TaskEditForm;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onDefinitionChange: (value: string) => void;
  apiData: {
    all_status_definitions: string[];
    all_type_definitions: string[];
    all_priority_definitions: string[];
  };
}

export default function TaskFormStepMainEdit({
  task,
  error,
  onChange,
  onDefinitionChange,
  apiData,
}: Props) {
  const maxTitleChars = 50;

  // task gelene kadar formu render etme
  if (!task || !task.startDate) {
    return <p className="text-gray-500 mt-4">Görev yükleniyor...</p>;
  }

  const [description, setDescription] = useState(task.description || "");

  useEffect(() => {
    setDescription(task.description || "");
  }, [task.description]);

  const [statuses, setStatuses] = useState<string[]>(apiData?.all_status_definitions || []);
  const [priorities, setPriorities] = useState<string[]>(apiData?.all_priority_definitions || []);
  const [types, setTypes] = useState<string[]>(apiData?.all_type_definitions || []);

  useEffect(() => {
    if (apiData) {
      setStatuses(apiData.all_status_definitions);
      setPriorities(apiData.all_priority_definitions);
      setTypes(apiData.all_type_definitions);
    }
  }, [apiData]);

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 max-w-4xl">
      {/* Tarihler */}
      <div className="flex flex-col gap-6">
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

        {/* Başlık */}
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

      {/* Seçimler */}
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Öncelik</label>
          <select
            name="priority_definition"
            value={task.priority_definition || ""}
            onChange={onChange}
            className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
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
          >
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
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Açıklama */}
      <div className="md:col-span-2 flex flex-col gap-2 mt-4">
        <label className="block text-sm text-gray-700 mb-1">Görev Açıklaması</label>
        <TextAreaRich
          mode="edit"
          value={description}
          onChange={(val) => {
            setDescription(val);
            onDefinitionChange(val);
          }}
        />
      </div>

      {/* Hata */}
      {error && (
        <div className="md:col-span-2 flex gap-2 items-center text-red-500">
          <span className="text-xl">⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}
    </form>
  );
}
