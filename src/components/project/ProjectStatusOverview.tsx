import { Card, CardContent } from "../ProjectDetailComponents";

interface ProjectStatusOverviewProps {
  statusOptions: string[];
  priorityOptions: string[];
  typeOptions: string[];
}

export default function ProjectStatusOverview({
  statusOptions,
  priorityOptions,
  typeOptions,
}: ProjectStatusOverviewProps) {
  const maxLength = Math.max(
    statusOptions.length,
    priorityOptions.length,
    typeOptions.length
  );

  return (
    <Card className="mb-8 border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-800">
          Proje Sabitleri
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="py-3 px-4 font-medium w-1/3">Durumlar</th>
                <th className="py-3 px-4 font-medium w-1/3">Öncelikler</th>
                <th className="py-3 px-4 font-medium w-1/3">Tipler</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxLength }).map((_, i) => {
                const status = statusOptions[i];
                const priority = priorityOptions[i];
                const type = typeOptions[i];

                return (
                  <tr
                    key={`${status || 's'}-${priority || 'p'}-${type || 't'}-${i}`}
                    className={`border-b border-gray-100 transition ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="py-3 px-4 text-gray-800">{status || "-"}</td>
                    <td className="py-3 px-4 text-gray-700">{priority || "-"}</td>
                    <td className="py-3 px-4 text-gray-700">{type || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
