import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import Page from "../components/Page";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import { APIConnection } from "../api/connection";
import StepProgressTabs from "../components/StepProgressTabs";
import TaskFormStepMainEdit from "../components/forms/TaskFormStepsMainEdit";
import TaskFormStepsAssignmentEdit, { type SubtaskForm } from "../components/forms/TaskFormStepsAssignmentEdit";
import TaskFormStepsAttachmentEdit, { type UploadedFile } from "../components/forms/TaskFormStepsAttachmentEdit";
import Cookies from 'js-cookie'

export interface User {
  code: string;
  name: string;
}

export interface TaskEditForm {
  project_code: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status_definition: string;
  type_definition: string;
  priority_definition: string;
  all_status_definitions: string[];
  all_type_definitions: string[];
  all_priority_definitions: string[];
  assigned_members: User[];
  unassigned_members: User[];
  attachments: UploadedFile[];
  subtasks_raw: Array<{
    subtask_id: number;
    description: string;
    assigned_members: User[];
    unassigned_members: User[];
  }>;
}

export default function EditTask() {
  const userCode = Cookies.get("user_code");
  const searchParams = new URLSearchParams(window.location.search);
  const taskId = searchParams.get("id");
  const connection = APIConnection.getInstance();

  const [task, setTask] = useState<TaskEditForm>({
    project_code: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status_definition: "",
    type_definition: "",
    priority_definition: "",
    all_status_definitions: [],
    all_type_definitions: [],
    all_priority_definitions: [],
    assigned_members: [],
    unassigned_members: [],
    attachments: [],
    subtasks_raw: []
  });

  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await connection.get<any>("tasks/getDetailsForTaskEdit", { user_code: userCode, task_id: taskId });
        console.log(res)
        if (res.status && res.data) {
          const t = res.data.task;
          setTask({
            project_code: t.project_code,
            title: t.title,
            description: t.description,
            startDate: t.start_date,
            endDate: t.end_date,
            status_definition: t.status_definition,
            type_definition: t.type_definition,
            priority_definition: t.priority_definition,
            all_status_definitions: t.all_status_definitions,
            all_type_definitions: t.all_type_definitions,
            all_priority_definitions: t.all_priority_definitions,
            assigned_members: res.data.users.assigned_members,
            unassigned_members: res.data.users.unassigned_members,
            attachments: res.data.attachments || [],
            subtasks_raw: res.data.subtasks
          });
        } else {
          setError("Görev verisi alınamadı.");
        }
      } catch (err) {
        console.error(err);
        setError("Görev verisi alınamadı. Sunucu ile bağlantı kurulamadı.");
      }
    };
    fetchTask();
  }, [connection, taskId, userCode]);

  /** Genel input değişiklikleri */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const setDescription = (text: string) => {
    setTask(prev => ({ ...prev, description: text }));
  };

  /** Assignment callbacks */
  const handleUserAdded = (user: User) => {
    setTask(prev => ({
      ...prev,
      assigned_members: [...prev.assigned_members, user],
      unassigned_members: prev.unassigned_members.filter(u => u.code !== user.code)
    }));
  };

  const handleUserRemoved = (user: User) => {
    setTask(prev => ({
      ...prev,
      assigned_members: prev.assigned_members.filter(u => u.code !== user.code),
      unassigned_members: [...prev.unassigned_members, user],
      subtasks_raw: prev.subtasks_raw.map(s => ({
        ...s,
        assigned_members: s.assigned_members.filter(a => a.code !== user.code),
        assignedUserIds: undefined
      }))
    }));
  };

  const handleSubtaskAdded = (subtask: SubtaskForm) => {
    setTask(prev => ({
      ...prev,
      subtasks_raw: [...prev.subtasks_raw, {
        subtask_id: subtask.id,
        description: subtask.title,
        assigned_members: [],
        unassigned_members: prev.unassigned_members
      }]
    }));
  };

  const handleSubtaskDeleted = (subtaskId: number) => {
    setTask(prev => ({
      ...prev,
      subtasks_raw: prev.subtasks_raw.filter(s => s.subtask_id !== subtaskId)
    }));
  };

  const handleSubtaskUserToggled = (subtaskId: number, userId: string) => {
    setTask(prev => ({
      ...prev,
      subtasks_raw: prev.subtasks_raw.map(s => {
        if (s.subtask_id !== subtaskId) return s;

        const userInSubtask = s.assigned_members.find(u => u.code === userId);
        if (userInSubtask) {
          // Remove user
          return {
            ...s,
            assigned_members: s.assigned_members.filter(u => u.code !== userId)
          };
        } else {
          // Add user
          const userToAdd = prev.assigned_members.find(u => u.code === userId);
          return {
            ...s,
            assigned_members: userToAdd ? [...s.assigned_members, userToAdd] : s.assigned_members
          };
        }
      })
    }));
  };

  /** Steps for StepProgressTabs */
  const stepComponents = useMemo(() => [
    {
      title: "Genel Bilgiler",
      component: (
        <TaskFormStepMainEdit
          task={task}
          error={error}
          onChange={handleChange}
          onDefinitionChange={setDescription}
          apiData={{
            all_priority_definitions: task.all_priority_definitions,
            all_status_definitions: task.all_status_definitions,
            all_type_definitions: task.all_type_definitions
          }}
        />
      )
    },
    {
      title: "Görev Atamaları",
      component: (
        <TaskFormStepsAssignmentEdit
          assigned_users={task.assigned_members}
          unassigned_users={task.unassigned_members}
          subtasks={task.subtasks_raw.map(s => ({
            id: s.subtask_id,
            title: s.description,
            assignedUserIds: s.assigned_members.map(u => u.code)
          }))}
          loading={false}
          onUserAdded={handleUserAdded}
          onUserRemoved={handleUserRemoved}
          onSubtaskAdded={handleSubtaskAdded}
          onSubtaskDeleted={handleSubtaskDeleted}
          onSubtaskUserToggled={handleSubtaskUserToggled}
        />
      )
    },
    {
      title: "Dosya Yönetimi",
      component: (
        <TaskFormStepsAttachmentEdit
          files={task.attachments}
          onChangeFiles={(files) => setTask(prev => ({ ...prev, attachments: files }))}
        />
      )
    }
  ], [task, error]);

  const handleFinish = async () => {
    setError("");
    try {
      const payload = { ...task, edited_by: userCode, task_id: taskId };
      console.log(payload)
      const res = await connection.post("tasks/completeEdit", payload);
      if (res.status) alert("✅ Görev değişikliği kaydedildi!");
      else setError(res.message || "Görev kaydedilemedi.");
    } catch (err) {
      console.error(err);
      setError("Görev kaydedilemedi. Sunucu ile bağlantı kurulamadı.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <Page>
        <PageHeader text="GÖREVLER - Görevi Düzenle" />
        <StepProgressTabs steps={stepComponents} onFinish={handleFinish} />
      </Page>
    </div>
  );
}
