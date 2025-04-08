
// Contains the custom table type definitions to extend Supabase types
// This is separate from client.ts to reduce its size

export type CustomTables = {
  news: {
    Row: {
      id: string;
      title: string;
      content: string;
      created_at: string;
      updated_at: string | null;
      status: string;
      is_server_wide: boolean;
    };
    Insert: {
      id?: string;
      title: string;
      content: string;
      created_at?: string;
      updated_at?: string | null;
      status?: string;
      is_server_wide?: boolean;
    };
    Update: {
      id?: string;
      title?: string;
      content?: string;
      created_at?: string;
      updated_at?: string | null;
      status?: string;
      is_server_wide?: boolean;
    };
  };
  application_seasons: {
    Row: {
      id: string;
      name: string;
      is_active: boolean;
      created_at: string;
    };
    Insert: {
      id?: string;
      name: string;
      is_active?: boolean;
      created_at?: string;
    };
    Update: {
      id?: string;
      name?: string;
      is_active?: boolean;
      created_at?: string;
    };
  };
  partner_servers: {
    Row: {
      id: string;
      name: string;
      description: string | null;
      website: string;
      owner: string | null;
      members: number;
      type: string;
      logo_url: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      name: string;
      description?: string | null;
      website: string;
      owner?: string | null;
      members?: number;
      type?: string;
      logo_url?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      name?: string;
      description?: string | null;
      website?: string;
      owner?: string | null;
      members?: number;
      type?: string;
      logo_url?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  sub_servers: {
    Row: {
      id: string;
      name: string;
      description: string | null;
      icon: string;
      color: string;
      status: string;
      link: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      name: string;
      description?: string | null;
      icon?: string;
      color?: string;
      status?: string;
      link?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      name?: string;
      description?: string | null;
      icon?: string;
      color?: string;
      status?: string;
      link?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  };
  team_absences: {
    Row: {
      id: string;
      user_id: string;
      start_date: string;
      end_date: string;
      reason: string;
      status: string;
      created_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      start_date?: string;
      end_date: string;
      reason: string;
      status?: string;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      start_date?: string;
      end_date?: string;
      reason?: string;
      status?: string;
      created_at?: string;
    };
  };
  announcement_email_queue: {
    Row: {
      id: string;
      announcement_id: string;
      processed_at: string | null;
      attempts: number;
      created_at: string;
      error: string | null;
      status: string;
    };
    Insert: {
      id?: string;
      announcement_id: string;
      processed_at?: string | null;
      attempts?: number;
      created_at?: string;
      error?: string | null;
      status?: string;
    };
    Update: {
      id?: string;
      announcement_id?: string;
      processed_at?: string | null;
      attempts?: number;
      created_at?: string;
      error?: string | null;
      status?: string;
    };
  };
  account_deletion_requests: {
    Row: {
      id: string;
      user_id: string;
      reason: string;
      status: string;
      processed_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      reason: string;
      status?: string;
      processed_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      reason?: string;
      status?: string;
      processed_at?: string | null;
      created_at?: string;
    };
  };
  id_change_requests: {
    Row: {
      id: string;
      user_id: string;
      field_name: string;
      new_value: string;
      status: string;
      processed_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      field_name: string;
      new_value: string;
      status?: string;
      processed_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      field_name?: string;
      new_value?: string;
      status?: string;
      processed_at?: string | null;
      created_at?: string;
    };
  };
  site_settings: {
    Row: {
      id: string;
      key: string;
      value: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      key: string;
      value: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      key?: string;
      value?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  admin_users: {
    Row: {
      id: string;
      user_id: string;
      role: string;
      created_at: string;
    };
    Insert: {
      id?: string;
      user_id: string;
      role?: string;
      created_at?: string;
    };
    Update: {
      id?: string;
      user_id?: string;
      role?: string;
      created_at?: string;
    };
  };
};

export type CustomFunctions = {
  get_users_by_ids: (args: { user_ids: string[] }) => { id: string; email: string }[];
  find_users_by_email: (args: { email_query: string }) => { id: string; email: string }[];
};
