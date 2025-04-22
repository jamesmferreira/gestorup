
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'gestor' | 'vendedor';
  approved: boolean;
  createdAt: number;
}

export interface PendingUser {
  uid: string;
  email: string;
  name: string;
  requestedAt: number;
}
