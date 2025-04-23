
export interface Task {
  id: string;
  title: string;
  description: string;
  deadline?: Date;
  status: 'pendente' | 'em_progresso' | 'concluido';
  assigned_to?: string; // user id
  manager_id?: string; // manager user id
  completed_at?: number;
  date: string; // YYYY-MM-DD format for the day this task belongs to
  created_by: string; // user id
  created_at: number;
}

export interface TaskRecord {
  id: string;
  task_id: string;
  user_id: string;
  userName: string;
  date: string; // YYYY-MM-DD format
  status: 'pendente' | 'em_progresso' | 'concluido';
  completed_at?: number;
  notes?: string;
}
