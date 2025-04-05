
export interface AccountDeletionRequest {
  id: string;
  user_id: string;
  reason: string;
  status: string;
  created_at: string;
  username?: string;
  email?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
