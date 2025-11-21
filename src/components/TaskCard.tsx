import { useState } from "react"
import { FiChevronUp, FiChevronDown, FiEdit3, FiUpload } from "react-icons/fi"
import type { Task } from "../config/tasks_data"
import TextAreaRich from "./RichTextArea"

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function TaskFilesTable({ files }: { files: { name: string; data: ArrayBuffer }[] }) {
  const handleDownload = (file: { name: string; data: ArrayBuffer }) => {
    const blob = new Blob([file.data], { type: "application/octet-stream" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = file.name
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-2 px-4 border-b font-medium text-left">Dosya Adı</th>
              <th className="py-2 px-4 border-b text-center font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {files && files.length > 0 ? (
              files.map((file, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{file.name}</td>
                  <td className="py-2 px-4 border-b flex justify-center">
                    <button
                      onClick={() => handleDownload(file)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition flex gap-2 items-center cursor-pointer"
                    >
                      <FiUpload/>
                      <span>İndir</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-3 px-4 text-center text-gray-400 italic">
                  Henüz dosya eklenmemiş
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


function SubTaskItem({
  sub,
  open,
  onToggle,
}: {
  sub: any
  open: boolean
  onToggle: () => void
  onStatusChange: (newStatus: "continue" | "finished") => void
}) {

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg transition"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-800">{sub.description}</h3>
        </div>
        {open ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
      </button>

      {open && (
        <div className="px-4 pb-3 pt-1 flex flex-col gap-3">

          <div className="text-xs flex flex-col gap-1">
            <span className="text-gray-600 font-medium">Atanan Kullanıcılar:</span>
            <ul className="pl-4 list-disc text-gray-700">
              {sub.assigned_users && sub.assigned_users.length > 0 ? (
                sub.assigned_users.map((user: string) => (
                  <li key={user}>{user}</li>
                ))
              ) : (
                <li>Atanan kullanıcı yok</li>
              )}
            </ul>
          </div>

          <div className="text-xs text-gray-500 flex justify-between">
            <span>Oluşturan: {sub.created_by}</span>
            <span>
              {new Date(sub.created_time).toLocaleString("tr-TR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

        </div>
      )}
    </div>
  )
}


export default function TaskCard({
  task,
  handleSubtaskStatusChange,
}: {
  task: Task
  handleMainStatusChange: (taskId: number, newStatus: "continue" | "finished") => void
  handleSubtaskStatusChange: (mainTaskId: number, subtaskId: number, newStatus: "continue" | "finished") => void
}) {
  const [openSubtaskId, setOpenSubtaskId] = useState<number | null>(null)

  return (
    <div className="bg-white shadow-md rounded-lg p-5 border border-gray-100 hover:shadow-lg transition">
      {/* Başlık ve Düzenle butonu */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{task.title}</h2>
        <button
          onClick={() => (window.location.href = `/edittask?id=${task.task_id}`)}
          className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition"
        >
          <FiEdit3 />
          Düzenle
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <h3 className="font-semibold text-gray-700">Görev Açıklaması</h3>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <TextAreaRich mode="view" value={task.description} />
        </div>
      </div>

      <div className="files mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Görev Dosyaları</h3>
          {task.status_category !== "finished" && (
            <button
              onClick={() => (window.location.href = `/addattachment?id=${task.task_id}`)}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Dosya Ekle
            </button>
          )}
        </div>

        <TaskFilesTable
          files={(task.attachments || []).map((f) => ({
            name: f.name,
            data: base64ToArrayBuffer(f.data),
          }))}
        />
      </div>

      {/* Görev Bilgileri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 my-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p><strong>📅 Başlangıç:</strong> {task.start_date}</p>
        <p><strong>⏰ Bitiş:</strong> {task.end_date}</p>
        <p><strong>👤 Oluşturan:</strong> {task.created_by}</p>
        <p><strong>👥 Atananlar:</strong> {task.assigned_users.join(", ")}</p>
      </div>

      <div className="flex flex-col gap-2">
        {task.sub_tasks.map((sub) => (
          <SubTaskItem
            key={sub.id}
            sub={sub}
            open={openSubtaskId === sub.id}
            onToggle={() => setOpenSubtaskId(openSubtaskId === sub.id ? null : sub.id)}
            onStatusChange={(newStatus) =>
              handleSubtaskStatusChange(task.task_id, sub.id, newStatus)
            }
          />
        ))}
      </div>
    </div>
  )
}
