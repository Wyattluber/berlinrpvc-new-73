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
      account_deletion_requests: {
        Row: {
          created_at: string
          id: string
          processed_at: string | null
          reason: string
          scheduled_deletion: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          processed_at?: string | null
          reason: string
          scheduled_deletion?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          processed_at?: string | null
          reason?: string
          scheduled_deletion?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
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
      announcement_comments: {
        Row: {
          announcement_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          is_server_wide: boolean
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_server_wide?: boolean
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_server_wide?: boolean
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      application_seasons: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
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
          season_id: string | null
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
          season_id?: string | null
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
          season_id?: string | null
          server_age_understanding?: string
          situation_handling?: string
          status?: string
          taschen_rp_understanding?: string
          updated_at?: string
          user_id?: string
          vdm_understanding?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "application_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      id_change_requests: {
        Row: {
          created_at: string
          field_name: string
          id: string
          new_value: string
          processed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          new_value: string
          processed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string
          processed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          created_at: string
          id: string
          is_server_wide: boolean
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_server_wide?: boolean
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_server_wide?: boolean
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          advertisement: string | null
          created_at: string
          discord_id: string
          discord_invite: string
          expectations: string | null
          expiration_date: string | null
          has_other_partners: boolean | null
          id: string
          is_active: boolean | null
          is_renewal: boolean | null
          member_count: number | null
          other_partners: string | null
          reason: string
          requirements: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advertisement?: string | null
          created_at?: string
          discord_id: string
          discord_invite: string
          expectations?: string | null
          expiration_date?: string | null
          has_other_partners?: boolean | null
          id?: string
          is_active?: boolean | null
          is_renewal?: boolean | null
          member_count?: number | null
          other_partners?: string | null
          reason: string
          requirements: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advertisement?: string | null
          created_at?: string
          discord_id?: string
          discord_invite?: string
          expectations?: string | null
          expiration_date?: string | null
          has_other_partners?: boolean | null
          id?: string
          is_active?: boolean | null
          is_renewal?: boolean | null
          member_count?: number | null
          other_partners?: string | null
          reason?: string
          requirements?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_servers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          members: number | null
          name: string
          owner: string | null
          partner_application_id: string | null
          type: string | null
          updated_at: string
          website: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          members?: number | null
          name: string
          owner?: string | null
          partner_application_id?: string | null
          type?: string | null
          updated_at?: string
          website: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          members?: number | null
          name?: string
          owner?: string | null
          partner_application_id?: string | null
          type?: string | null
          updated_at?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_servers_partner_application_id_fkey"
            columns: ["partner_application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          discord_id: string | null
          id: string
          roblox_id: string | null
          updated_at: string | null
          username: string | null
          username_changed_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id?: string | null
          id: string
          roblox_id?: string | null
          updated_at?: string | null
          username?: string | null
          username_changed_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          discord_id?: string | null
          id?: string
          roblox_id?: string | null
          updated_at?: string | null
          username?: string | null
          username_changed_at?: string | null
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
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      store_items: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          product_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          product_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          product_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_servers: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          link: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          link?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          link?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_absences: {
        Row: {
          created_at: string
          end_date: string
          id: string
          reason: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          reason: string
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          reason?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      team_settings: {
        Row: {
          created_at: string
          id: string
          meeting_day: string
          meeting_frequency: string
          meeting_location: string
          meeting_notes: string
          meeting_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_day: string
          meeting_frequency: string
          meeting_location: string
          meeting_notes: string
          meeting_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_day?: string
          meeting_frequency?: string
          meeting_location?: string
          meeting_notes?: string
          meeting_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      username_blacklist: {
        Row: {
          created_at: string
          id: string
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_user: {
        Args: { discord_id_param: string }
        Returns: string
      }
      get_users_by_ids: {
        Args: { user_ids: string[] }
        Returns: Json[]
      }
      is_admin: {
        Args: { user_uuid: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
