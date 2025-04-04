export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          activity_level: number
          admin_experience: string | null
          age: number
          bodycam_understanding: string
          created_at: string
          discord_id: string
          friend_rule_violation: string
          frp_understanding: string
          id: string
          notes: string | null
          other_servers: string | null
          roblox_id: string
          roblox_username: string
          server_age_understanding: string
          situation_handling: string
          status: string
          taschen_rp_understanding: string
          updated_at: string
          user_id: string
          vdm_understanding: string
        }
        Insert: {
          activity_level: number
          admin_experience?: string | null
          age: number
          bodycam_understanding: string
          created_at?: string
          discord_id: string
          friend_rule_violation: string
          frp_understanding: string
          id?: string
          notes?: string | null
          other_servers?: string | null
          roblox_id: string
          roblox_username: string
          server_age_understanding: string
          situation_handling: string
          status?: string
          taschen_rp_understanding: string
          updated_at?: string
          user_id: string
          vdm_understanding: string
        }
        Update: {
          activity_level?: number
          admin_experience?: string | null
          age?: number
          bodycam_understanding?: string
          created_at?: string
          discord_id?: string
          friend_rule_violation?: string
          frp_understanding?: string
          id?: string
          notes?: string | null
          other_servers?: string | null
          roblox_id?: string
          roblox_username?: string
          server_age_understanding?: string
          situation_handling?: string
          status?: string
          taschen_rp_understanding?: string
          updated_at?: string
          user_id?: string
          vdm_understanding?: string
        }
        Relationships: []
      }
      server_stats: {
        Row: {
          discordMembers: number
          id: number
          lastUpdated: string
          partnerServers: number
          servers: number
        }
        Insert: {
          discordMembers?: number
          id?: number
          lastUpdated?: string
          partnerServers?: number
          servers?: number
        }
        Update: {
          discordMembers?: number
          id?: number
          lastUpdated?: string
          partnerServers?: number
          servers?: number
        }
        Relationships: []
      }
      team_settings: {
        Row: {
          created_at: string | null
          id: string
          meeting_day: string | null
          meeting_frequency: string | null
          meeting_location: string | null
          meeting_notes: string | null
          meeting_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_day?: string | null
          meeting_frequency?: string | null
          meeting_location?: string | null
          meeting_notes?: string | null
          meeting_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_day?: string | null
          meeting_frequency?: string | null
          meeting_location?: string | null
          meeting_notes?: string | null
          meeting_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_user: {
        Args: {
          discord_id_param: string
        }
        Returns: string
      }
      is_admin: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
