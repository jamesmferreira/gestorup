
export interface Task {
  id: string;
  title: string;
  description: string;
  deadline?: Date;
  status: 'pendente' | 'em_progresso' | 'concluido';
  assignedTo?: string; // user UID
  completedAt?: number;
  date: string; // YYYY-MM-DD format for the day this task belongs to
  createdBy: string; // user UID
  createdAt: number;
}

export interface TaskRecord {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD format
  status: 'pendente' | 'em_progresso' | 'concluido';
  completedAt?: number;
  notes?: string;
}
