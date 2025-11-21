import { Card, CardContent, Button } from "../ProjectDetailComponents";

export interface ProjectMember {
  id: number;
  name: string;
  role: string;
}

interface ProjectMembersTableProps {
  members: ProjectMember[];
  showAllMembers: boolean;
  onToggleShowAll: () => void;
}

const roleMap: Record<string, string> = {
  manager: "Proje Yöneticisi",
  admin: "Admin",
  editor: "Düzenleyici",
  viewer: "Görüntüleyici",
};

export default function ProjectMembersTable({
  members,
  showAllMembers,
  onToggleShowAll,
}: ProjectMembersTableProps) {
  const displayedMembers = showAllMembers ? members : members.slice(0, 10);

  return (
    <>
      <div className="flex justify-between items-center mb-3">
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-800">Proje Üyeleri</h2>
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600 text-sm">
                  <th className="py-3 px-4 font-medium w-1/2">İsim</th>
                  <th className="py-3 px-4 font-medium w-1/2">Rol</th>
                </tr>
              </thead>
              <tbody>
                {displayedMembers.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="py-3 px-4 text-gray-800">{m.name}</td>
                    <td className="py-3 px-4 text-gray-700">{roleMap[m.role] || m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {members.length > 10 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={onToggleShowAll}
                className="text-sm px-4 py-2 border border-gray-300 hover:bg-gray-100"
              >
                {showAllMembers ? "Kapat" : "Tümünü Göster"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
