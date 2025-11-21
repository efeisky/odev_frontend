import { useState, useEffect, type ChangeEvent } from "react";
import type { IUsers } from "../../pages/EditProject";

interface Props {
  users: IUsers[]; // Tüm kullanıcılar
  initialUsers?: IUsers[]; // Başlangıçta seçili kullanıcılar
  error?: string;
  onSave: (selectedUsers: IUsers[]) => Promise<boolean> | boolean;
}

const roleTurkish: Record<string, string> = {
  admin: "Yardımcı Yönetici",
  editor: "Editör",
  viewer: "Görüntüleyici",
};

export default function ProjectEditFormStepUsers({
  users,
  initialUsers = [],
  error,
  onSave,
}: Props) {
  const [selectedUsers, setSelectedUsers] = useState<
    { code: string; full_name: string; role: "admin" | "editor" | "viewer" }[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  const availableRoles = Object.keys(roleTurkish) as ("admin" | "editor" | "viewer")[];

  // Başlangıçta seçili kullanıcıları yükle (manager hariç)
  useEffect(() => {
    if (initialUsers.length > 0) {
      const filtered = initialUsers
        .filter((u) => u.role !== "manager") 
        .map((u) => ({
          code: u.code,
          full_name: u.full_name,
          role: (u.role as "admin" | "editor" | "viewer") ?? "viewer",
        }));
      setSelectedUsers(filtered);
    }
  }, [initialUsers]);

  // Kullanıcı ekleme
  const handleAddUser = (e: ChangeEvent<HTMLSelectElement>) => {
    const userCode = e.target.value;
    if (!userCode) return;

    const user = users.find((u) => u.code === userCode);
    if (!user || user.role === "manager") return;
    if (selectedUsers.some((u) => u.code === user.code)) return;

    setSelectedUsers((prev) => [
      ...prev,
      { code: user.code, full_name: user.full_name, role: "viewer" },
    ]);
    setSaveSuccess(null);
  };

  // Rol değiştirme
  const handleRoleChange = (code: string, newRole: "admin" | "editor" | "viewer") => {
    setSelectedUsers((prev) =>
      prev.map((u) => (u.code === code ? { ...u, role: newRole } : u))
    );
    setSaveSuccess(null);
  };

  // Kullanıcı silme
  const handleRemoveUser = (code: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.code !== code));
    setSaveSuccess(null);
  };

  // Kaydet
  const handleSave = async () => {
    if (selectedUsers.length === 0) return;
    setIsSaving(true);
    setSaveSuccess(null);

    const result = await onSave(selectedUsers);
    setIsSaving(false);
    setSaveSuccess(result === true);
  };

  const getButtonColor = () => {
    if (isSaving) return "bg-gray-400 cursor-not-allowed pointer-events-none select-none";
    if (saveSuccess === true)
      return "bg-green-500 cursor-default pointer-events-none select-none";
    if (saveSuccess === false)
      return "bg-red-500 cursor-default pointer-events-none select-none";
    return "bg-blue-500 hover:bg-blue-700 cursor-pointer select-none";
  };

    const availableUsers = users.filter(
        (u) =>
            u.role !== "manager" &&
            !initialUsers.some((iu) => iu.code === u.code) &&
            !selectedUsers.some((su) => su.code === u.code)
    );

  return (
    <form className="flex flex-col gap-6 mt-4">
      {/* Kullanıcı ekleme */}
      <div className="max-w-sm">
        <label className="block text-sm text-gray-700 mb-1">Üye Ekleyiniz (opsiyonel)</label>
        <select
          name="addUser"
          value=""
          onChange={handleAddUser}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
        >
          <option value="">Kullanıcı Seçiniz</option>
          {availableUsers.map((u) => (
            <option key={u.code} value={u.code}>
              {u.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Seçili kullanıcılar */}
      {selectedUsers.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Ad Soyad</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Rol</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {selectedUsers.map((user, i) => (
                <tr
                  key={user.code}
                  className={`border-t border-gray-100 hover:bg-blue-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">{user.full_name}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.code, e.target.value as "admin" | "editor" | "viewer")
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                    >
                      {availableRoles.map((r) => (
                        <option key={r} value={r}>
                          {roleTurkish[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.code)}
                      className="text-red-500 hover:text-red-600 font-medium transition bg-red-50 hover:bg-red-100 px-4 py-2 rounded-2xl cursor-pointer"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || selectedUsers.length === 0}
              className={`text-white px-5 py-2 rounded-lg transition font-medium shadow-sm ${getButtonColor()}`}
            >
              {isSaving
                ? "Kaydediliyor..."
                : saveSuccess === true
                ? "Kaydedildi"
                : saveSuccess === false
                ? "Kaydedilemedi"
                : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex gap-2 items-center text-red-500">
          <span className="text-xl">⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}
    </form>
  );
}
