import { useMemo, useState } from "react";

interface User {
  id: string; // UUID
  name: string;
}

export interface SubtaskForm {
  id: number;
  title: string;
  assignedUserIds: string[]; // UUID array
}

interface Props {
  users: User[];               // Tüm proje kullanıcıları
  selectedUsers: User[];       // Seçili kullanıcılar (task.users)
  subtasks: SubtaskForm[];     // Alt görevler (task.subtasks)
  onChange: (users: User[], subtasks: SubtaskForm[]) => void;
  loading?: boolean;
}

export default function TaskFormStepsAssignment({
  users,
  selectedUsers,
  subtasks,
  onChange,
  loading = false,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 2) return [];
    return users.filter(
      (u) =>
        !selectedUsers.some((s) => s.id === u.id) &&
        u.name.toLowerCase().includes(term)
    );
  }, [searchTerm, users, selectedUsers]);

  const handleSelectUser = (user: User) => {
    const updatedUsers = [...selectedUsers, user];
    onChange(updatedUsers, subtasks);
    setSearchTerm("");
  };

  const handleRemoveUser = (id: string) => {
    const updatedUsers = selectedUsers.filter((u) => u.id !== id);
    const updatedSubtasks = subtasks.map((s) => ({
      ...s,
      assignedUserIds: s.assignedUserIds.filter((uid) => uid !== id),
    }));
    onChange(updatedUsers, updatedSubtasks);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const updatedSubtasks = [
      ...subtasks,
      { id: Date.now(), title: newSubtaskTitle.trim(), assignedUserIds: [] },
    ];
    onChange(selectedUsers, updatedSubtasks);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (id: number) => {
    const updatedSubtasks = subtasks.filter((s) => s.id !== id);
    onChange(selectedUsers, updatedSubtasks);
  };

  const handleAssignUser = (subtaskId: number, userId: string) => {
    const updatedSubtasks = subtasks.map((s) =>
      s.id === subtaskId
        ? {
            ...s,
            assignedUserIds: s.assignedUserIds.includes(userId)
              ? s.assignedUserIds.filter((uid) => uid !== userId)
              : [...s.assignedUserIds, userId],
          }
        : s
    );
    onChange(selectedUsers, updatedSubtasks);
  };

  return (
    <div className="flex flex-col gap-10 mt-6 max-w-4xl mx-auto">
      {/* Kullanıcı seçimi */}
      <div className="rounded-2xl shadow-md p-8 transition hover:shadow-lg">
        <h2 className="text-xl font-semibold mb-6">
          Göreve Atanacak Kullanıcılar
        </h2>

        {loading ? (
          <p className="text-gray-400 italic">Kullanıcılar yükleniyor...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400 italic">
            Önce bir proje seçiniz, ardından kullanıcılar yüklenecek.
          </p>
        ) : (
          <>
            <div className="relative mb-6 max-w-md">
              <input
                type="text"
                placeholder="Kullanıcı ara... (en az 2 harf)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl px-4 py-3 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              {searchTerm && filteredUsers.length > 0 && (
                <ul className="absolute rounded-xl shadow-xl mt-2 w-full max-h-48 overflow-y-auto z-10 bg-white">
                  {filteredUsers.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="px-4 py-2 text-sm cursor-pointer transition hover:bg-gray-100"
                    >
                      {user.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 transition"
                  >
                    <span className="text-sm font-medium">{user.name}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-gray-400 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Alt görevler */}
      <div className="rounded-2xl shadow-md p-8 transition hover:shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Alt Görevler</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Alt görev başlığı yazınız"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="rounded-xl px-5 py-3 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 min-w-[300px]"
            />
            <button
              onClick={handleAddSubtask}
              className="rounded-xl px-5 py-3 bg-gray-50 text-black text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
            >
              + Ekle
            </button>
          </div>
        </div>

        {subtasks.length === 0 && (
          <p className="text-gray-400 italic text-sm">
            Henüz bir alt görev oluşturulmadı.
          </p>
        )}

        {subtasks.map((sub) => (
          <div
            key={sub.id}
            className="rounded-2xl p-5 transition hover:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">{sub.title}</h3>
              <button
                onClick={() => handleRemoveSubtask(sub.id)}
                className="text-gray-400 hover:text-red-400 text-sm transition"
              >
                Sil
              </button>
            </div>

            {selectedUsers.length === 0 ? (
              <p className="text-gray-400 text-sm italic">
                Önce görev kullanıcılarını ekleyin.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    const userId = e.target.value;
                    if (userId) handleAssignUser(sub.id, userId);
                    e.target.value = "";
                  }}
                  className="w-48 border-0 bg-gray-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">Kullanıcı ata...</option>
                  {selectedUsers
                    .filter((u) => !sub.assignedUserIds.includes(u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>

                <div className="flex flex-wrap gap-2 mt-2">
                  {sub.assignedUserIds.length > 0 ? (
                    sub.assignedUserIds.map((uid) => {
                      const user = selectedUsers.find((u) => u.id === uid);
                      return (
                        <span
                          key={uid}
                          onClick={() => handleAssignUser(sub.id, uid)}
                          className="bg-gray-100 text-black text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-200 transition"
                          title="Kaldır"
                        >
                          {user?.name} ✕
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Henüz kullanıcı atanmadı
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
