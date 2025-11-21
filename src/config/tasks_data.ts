export interface TaskFile {
  name: string;
  data: string;
}

export interface Task {
  task_id: number;
  project_code: string;
  title: string;
  description: string;
  created_time: string;
  created_by: string;
  start_date: string;
  end_date: string;
  status_id: number;
  status_definition: string;
  status_category: string;
  priority_id: number;
  priority_definition: string;
  type_id: number;
  type_definition: string;
  assigned_users: string[];
  sub_tasks: Subtask[];
  attachments: TaskFile[]
}

export interface Subtask {
  id: number;
  task_id: number;
  description: string;
  created_by: string;
  created_time: string;
  assigned_users: string[]
}
