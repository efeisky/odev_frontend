import { useEffect, useState, useMemo, type JSX, type ChangeEvent } from "react";
import Sidebar from "../components/Sidebar";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import StepProgressTabs from "../components/StepProgressTabs";
import ProjectFormStepsConstants from "../components/forms/ProjectFormStepsConstants";
import { APIConnection } from "../api/connection";
import type { Item } from "../components/forms/ProjectFormStepsConstants";
import type { IManager } from "./ProjectAdd";
import EditProjectFormStepMain from "../components/editforms/ProjectEditFormStepMain";
import EditProjectEditFormStepUsers from "../components/editforms/ProjectEditFormStepUsers";

// ===================== Tipler =====================
export type UserRole = "manager" | "admin" | "editor" | "viewer" | null;

export interface IUsers {
  code: string;
  full_name: string;
  role: UserRole;
}

export interface EditProjectForm {
  managerId: string;
  startDate: string;
  endDate: string;
  definition: string;
  extraUsers: IUsers[]; // artık manager dahil
  statuses: Item[];
  priorities: Item[];
  types: Item[];
}

// ===================== OOP Model Sınıfı =====================
class ProjectModel {
  projectForm: EditProjectForm;
  managers: IManager[];
  users: IUsers[];
  initialUsers: IUsers[];

  constructor() {
    this.projectForm = {
      managerId: "",
      startDate: "",
      endDate: "",
      definition: "",
      extraUsers: [],
      statuses: [],
      priorities: [],
      types: [],
    };
    this.managers = [];
    this.users = [];
    this.initialUsers = [];
  }

  setProjectForm(form: EditProjectForm) {
    this.projectForm = form;
  }

  setManagers(managers: IManager[]) {
    this.managers = managers;
  }

  setUsers(users: IUsers[]) {
    this.users = users;
  }

  setInitialUsers(users: IUsers[]) {
    this.initialUsers = users;
  }
}

// ===================== React Component =====================
export default function EditProject(): JSX.Element {
  const connection = APIConnection.getInstance();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  const [projectModel, setProjectModel] = useState(new ProjectModel());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ------------------- Handle Input Change -------------------
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...projectModel.projectForm, [name]: value };
    setProjectModel((prev) => {
      const model = new ProjectModel();
      model.setProjectForm(updatedForm);
      model.setManagers(prev.managers);
      model.setUsers(prev.users);
      model.setInitialUsers(prev.initialUsers);
      return model;
    });
  };

  // ------------------- Form Submit -------------------
  const handleFinish = async () => {
    console.log("📤 Form submitted:", projectModel.projectForm);
    alert("Proje başarıyla güncellendi!");
  };

  // ------------------- Fetch Project -------------------
  useEffect(() => {
    async function fetchProject() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const res = await connection.get<{ users: any; details: any }>(
          "project/getProjectForEdit",
          { project_code: id }
        );

        if (res.status && res.data) {
          const { users, details } = res.data;

          // 1️⃣ Manager listesi
          const managerList: IManager[] = users.map((u: any) => ({
            code: u.code,
            full_name: u.full_name,
          }));

          // 2️⃣ Üyeler listesi (manager dahil)
          const members: IUsers[] = details.project_members.map((m: any) => ({
            full_name: m.name,
            code: users.find((u: any) => u.full_name === m.name)?.code || crypto.randomUUID(),
            role: m.role as UserRole,
          }));

          // 3️⃣ Edit Project Form
          const projectData: EditProjectForm = {
            managerId:
              users.find((u: any) => u.full_name === details.project_detail.manager_name)?.code || "",
            startDate: details.project_detail.date_start,
            endDate: details.project_detail.date_end,
            definition: details.project_detail.name,
            extraUsers: members, // manager dahil
            statuses: details.project_meta.statuses.map((s: string, i: number) => ({ id: i + 1, name: s })),
            priorities: details.project_meta.priorities.map((p: string, i: number) => ({ id: i + 1, name: p })),
            types: details.project_meta.types.map((t: string, i: number) => ({ id: i + 1, name: t })),
          };

          // 4️⃣ State güncelle
          const model = new ProjectModel();
          model.setProjectForm(projectData);
          model.setManagers(managerList);
          model.setUsers(users);
          model.setInitialUsers(members);

          setProjectModel(model);
          setError(null);
        } else {
          setError("Kullanıcı verisi alınamadı.");
        }
      } catch (err) {
        console.error("❌ Proje yüklenemedi:", err);
        setError("Proje verisi alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  // ------------------- Form Steps -------------------
  const stepComponents = useMemo(() => {
    if (!projectModel.projectForm) return [];

    return [
      {
        title: "Genel Bilgiler",
        component: (
          <EditProjectFormStepMain
            project={projectModel.projectForm}
            managers={projectModel.managers}
            error={error ?? undefined}
            onChange={handleChange}
            maxChars={50}
          />
        ),
      },
      {
        title: "Kullanıcıları Düzenle",
        component: (
          <EditProjectEditFormStepUsers
            initialUsers={projectModel.initialUsers}
            users={projectModel.users}
            onSave={async (selectedUsers: IUsers[]) => {
              const model = new ProjectModel();
              model.setProjectForm({ ...projectModel.projectForm, extraUsers: selectedUsers });
              model.setManagers(projectModel.managers);
              model.setUsers(projectModel.users);
              model.setInitialUsers(selectedUsers);
              setProjectModel(model);
              return true;
            }}
            error={error ?? undefined}
          />
        ),
      },
      {
        title: "Proje Sabitleri",
        component: (
          <ProjectFormStepsConstants
            initialStatuses={projectModel.projectForm.statuses}
            initialTypes={projectModel.projectForm.types}
            initialPriorities={projectModel.projectForm.priorities}
            onSave={async ({ statuses, types, priorities }: { statuses: Item[]; types: Item[]; priorities: Item[] }) => {
              const model = new ProjectModel();
              model.setProjectForm({ ...projectModel.projectForm, statuses, types, priorities });
              model.setManagers(projectModel.managers);
              model.setUsers(projectModel.users);
              model.setInitialUsers(projectModel.initialUsers);
              setProjectModel(model);
              return true;
            }}
            error={error ?? undefined}
          />
        ),
      },
    ];
  }, [projectModel, error]);

  // ------------------- Loading State -------------------
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Proje yükleniyor...</p>
      </div>
    );
  }

  if (!projectModel.projectForm) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Proje verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <Page>
        <PageHeader text="PROJELER - Proje Düzenleme" />
        <StepProgressTabs steps={stepComponents} onFinish={handleFinish} />
      </Page>
    </div>
  );
}
