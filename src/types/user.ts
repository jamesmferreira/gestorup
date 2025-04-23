
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'gestor' | 'vendedor';
  approved: boolean | null;
  company_id: string | null;
  created_at: string;
}

export interface PendingUser {
  id: string;
  email: string;
  name: string;
  company_id: string | null;
  requested_at: string;
}
