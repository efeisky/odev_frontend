import {
  useState,
  useEffect,
  useMemo,
  type ChangeEvent,
} from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { APIConnection } from "../api/connection";
import StepProgressTabs from "../components/StepProgressTabs";
import TaskFormStepMain from "../components/forms/TaskFormStepsMain";
import TaskFormStepsAssignment, { type SubtaskForm } from "../components/forms/TaskFormStepsAssignment";
import TaskFormStepsAttachment, { type UploadedFile } from "../components/forms/TaskFormStepsAttachment";
import Cookies from "js-cookie";

export interface TaskForm {
  projectId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status_definition: string;
  priority_definition: string;
  type_definition: string;
  users: User[];
  subtasks: SubtaskForm[];
  attachments: UploadedFile[];
}

interface TaskProjects {
  code: string;
  definition: string;
}

interface User {
  id: string;
  name: string;
}


export default function TaskAdd() {
  const connection = APIConnection.getInstance();
  const [projects, setProjects] = useState<TaskProjects[]>([]);
  const [error, setError] = useState<string>("");
  const [_, setLoading] = useState<boolean>(false);
  const userCode = Cookies.get("user_code");

  const [task, setTask] = useState<TaskForm>({
    projectId: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status_definition: "",
    priority_definition: "",
    type_definition: "",
    attachments: [],
    subtasks: [],
    users: []
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await connection.get<{ projects: TaskProjects[] }>(
          "tasks/getProjectsForTask",
          { user_code: userCode }
        );
        if (res.status && res.data) {
          setProjects(res.data.projects);
        } else {
          setError(res.message || "Projeler alınamadı.");
        }
      } catch (err) {
        console.error(err);
        setError("Projeler alınamadı. Sunucu ile bağlantı kurulamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [connection]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const setDescription = (text: string) => {
    setTask((prev) => ({ ...prev, description: text }));
  };

  const handleProjectChange = async (projectId: string) => {
    setUsers([]);
    if (!projectId) return;
    setLoadingUsers(true);
    try {
      const res = await connection.get<{ users: User[] }>(
        "project/projectUsers",
        { project_code: projectId }
      );
      if (res.status && res.data) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Proje kullanıcıları alınamadı", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const stepComponents = useMemo(
    () => [
      {
        title: "Genel Bilgiler",
        component: (
          <TaskFormStepMain
            task={task}
            projects={projects}
            error={error}
            onChange={handleChange}
            onDefinitionChange={setDescription}
            onProjectChange={handleProjectChange}
          />
        ),
      },
      {
        title: "Görev Atamaları",
        component: (
          <TaskFormStepsAssignment
            users={users}
            selectedUsers={task.users}
            subtasks={task.subtasks}
            onChange={(updatedUsers, updatedSubtasks) => {
              setTask(prev => ({
                ...prev,
                users: updatedUsers,
                subtasks: updatedSubtasks,
              }));
            }}
            loading={loadingUsers}
          />
        ),
      },
      {
        title: "Dosya Ekleme",
        component: <TaskFormStepsAttachment 
          files={task.attachments}
          onChangeFiles={(files)=>{
            setTask((prev) => ({ ...prev, attachments: files }));
          }}
        />,
      },
    ],
    [projects, error, users, loadingUsers, task.attachments, task.users, task.subtasks, task]
  );

  const handleFinish = async() => {
      setLoading(true);
      setError("");
      try {
        const payload = {
          project_code: task.projectId,
          created_by: userCode,
          title: task.title,
          description: task.description,
          startDate: task.startDate,
          endDate: task.endDate,
          status_definition: task.status_definition,
          priority_definition: task.priority_definition,
          type_definition: task.type_definition,
          attachments: task.attachments.map((attachment) => ({
            name: attachment.name,
            data: Array.from(new Uint8Array(attachment.data))
          })),
          subtasks: task.subtasks,
          users: task.users

        }
        const res = await connection.post(
          "tasks/setTask", payload
        );
        if (res.status) {
          alert("Görev kaydedildi.")
        } else {
          setError(res.message || "Projeler alınamadı.");
        }
      } catch (err) {
        console.error(err);
        setError("Projeler alınamadı. Sunucu ile bağlantı kurulamadı.");
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <Page>
        <PageHeader text="GÖREVLER - Görev Ekle" />
        <StepProgressTabs steps={stepComponents} onFinish={handleFinish} />
      </Page>
    </div>
  );
}
