
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string; // Changed from enum to string to match our database changes
  approved: boolean | null;
  created_at: string;
}

export interface PendingUser {
  id: string;
  email: string;
  name: string;
  requested_at: string;
}

// Add manager relationship type
export interface UserManager {
  id: string;
  user_id: string;
  manager_id: string;
  created_at: string;
}
