import { useState, useEffect, type ChangeEvent, useMemo } from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { APIConnection } from "../api/connection";
import StepProgressTabs from "../components/StepProgressTabs";
import ProjectFormStepMain from "../components/forms/ProjectFormStepsMain";
import ProjectFormStepUsers from "../components/forms/ProjectFormStepsUsers";
import ProjectFormStepConstants, { type Item } from "../components/forms/ProjectFormStepsConstants";

export interface ProjectForm {
  managerId?: string;
  startDate: string;
  endDate: string;
  definition: string;
  extraUsers: IUsers[];
  statuses: Item[];
  priorities: Item[];
  types: Item[];
}

export interface IManager {
  code: string;
  full_name: string;
}

export interface IUsers {
  code: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer' | null;
}

export default function ProjectAdd() {
  const connection = APIConnection.getInstance();
  const maxChars = 50;

  const [project, setProject] = useState<ProjectForm>({
    managerId: "",
    startDate: "",
    endDate: "",
    definition: "",
    extraUsers: [],
    statuses: [],
    priorities: [],
    types: []
  });

  const [managers, setManagers] = useState<IManager[]>([]);
  const [allUsers, setAllUsers] = useState<IUsers[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await connection.get<{ users: IManager[] }>("general/getUsersForProject");
        if (res?.status && res.data?.users) {
          const fetched: IUsers[] = res.data.users.map(u => ({
            code: u.code,
            full_name: u.full_name,
            role: null
          }));
          setManagers(res.data.users);
          setAllUsers(fetched);
          setError("");
        } else {
          setError("Kullanıcı verisi alınamadı.");
        }
      } catch (err) {
        console.error("User fetch error:", err);
        setError((err as Error)?.message ?? "Kullanıcı verisi alınırken hata oluştu.");
      }
    };
    fetchUsers();
  }, [connection]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const key = name as keyof ProjectForm;

    setProject((prev) => {
      if (key === "managerId") {
        const newManagerId = value;
        const filteredExtraUsers = prev.extraUsers.filter(u => u.code !== newManagerId);
        return { ...prev, managerId: newManagerId, extraUsers: filteredExtraUsers };
      }

      return { ...prev, [key]: value } as ProjectForm;
    });
    setError("");
  };

  const handleFinish = async() => {
    if (!project.definition.trim()) {
      setError("Proje tanımı boş olamaz.");
      return;
    }
    if (!project.managerId) {
      setError("Lütfen bir yönetici seçin.");
      return;
    }
    setError("");
    try {
        const payload = {
          manager_code: project.managerId,
          date_start: project.startDate,
          date_end: project.endDate,
          definition: project.definition,
          extra_users: project.extraUsers.map(u => ({
            code: u.code,
            role: u.role
          })),
          statuses: project.statuses.map(s => ({
            code: s.id ?? null,
            name: s.name
          })),
          priorities: project.priorities.map(p => ({
            code: p.id ?? null,
            name: p.name
          })),
          types: project.types.map(t => ({
            code: t.id ?? null,
            name: t.name
          }))
        };
        console.log(payload)
        const res = await connection.post("project/setProject", payload);
        if (res.status) {
          alert("✅ Proje başarıyla eklendi!");
        } else {
          setError(res.message);
        }
    } catch (err) {
        console.error("Project post error:", err);
        setError((err as Error)?.message ?? "Proje verisi işlenirken hata oluştu.");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!project.managerId) return allUsers;
    return allUsers.filter((u) => u.code !== project.managerId);
  }, [allUsers, project.managerId]);

  const stepComponents = useMemo(() => [
    {
      title: "Genel Bilgiler",
      component: (
        <ProjectFormStepMain
          project={project}
          managers={managers}
          maxChars={maxChars}
          error={error}
          onChange={handleChange}
        />
      )
    },
    {
      title: "Kullanıcı Ekleme",
      component: (
        <ProjectFormStepUsers
          initialSelectedUsers={project.extraUsers}
          users={filteredUsers}
          onSave={async (selectedUsers: IUsers[]) => {
            try {
              setProject((prev) => ({ ...prev, extraUsers: selectedUsers }));
              setError("");
              return true;
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message ?? "Kullanıcı kaydedilirken hata.");
              return false;
            }
          }}
          error={error}
        />
      )
    },
    {
      title: "Proje Sabitleri",
      component: (
        <ProjectFormStepConstants
          initialStatuses={project.statuses}
          initialTypes={project.types}
          initialPriorities={project.priorities}
          onSave={async ({ statuses, types, priorities }: { statuses: Item[]; types: Item[]; priorities: Item[] }) => {
            try {
              setProject((prev) => ({ ...prev, statuses, types, priorities }));
              setError("");
              return true;
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message ?? "Proje sabitleri kaydedilirken hata.");
              return false;
            }
          }}
          error={error}
        />
      )
    }
  ], [project, managers, filteredUsers, error]);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <Page>
        <PageHeader text="PROJELER - Proje Ekle" />
        {error && (
          <div className="mb-4 text-red-700 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}
        <StepProgressTabs
          steps={stepComponents}
          onFinish={handleFinish}
        />
      </Page>
    </div>
  );
}
