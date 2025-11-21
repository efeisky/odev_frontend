import { Card, CardContent } from "../ProjectDetailComponents";

interface ProjectInfo {
  name: string;
  startDate: string;
  endDate: string;
  manager: string;
  usersCount: number;
  taskCount: number;
  status: string;
}

interface Props {
  project: ProjectInfo;
}

export default function ProjectInfoCard({ project }: Props) {
  return (
    <Card className="mb-8 shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          Proje Bilgileri
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">Proje Adı</p>
            <p className="text-base font-medium text-gray-800">
              {project.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Durum</p>
            <p className="text-base font-medium text-gray-800">
              {project.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Görev Sayısı</p>
            <p className="text-base font-medium text-gray-800">
              {project.taskCount}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500 mb-1">Üye Sayısı</p>
            <p className="text-base font-medium text-gray-800">
              {project.usersCount}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Başlangıç Tarihi</p>
            <p className="text-base font-medium text-gray-800">
              {project.startDate}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Bitiş Tarihi</p>
            <p className="text-base font-medium text-gray-800">
              {project.endDate}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Proje Yöneticisi</p>
            <p className="text-base font-medium text-gray-800">
              {project.manager}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
