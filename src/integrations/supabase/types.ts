export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      asset_versions: {
        Row: {
          asset_id: string
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at: string
          created_by: string | null
          environment: Database["public"]["Enums"]["version_environment"]
          id: string
          is_current: boolean
          parent_version_id: string | null
          snapshot_data: Json
          status: Database["public"]["Enums"]["version_status"]
          tenant_id: string
          version_name: string
          version_note: string | null
          version_number: number
        }
        Insert: {
          asset_id: string
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          created_by?: string | null
          environment?: Database["public"]["Enums"]["version_environment"]
          id?: string
          is_current?: boolean
          parent_version_id?: string | null
          snapshot_data?: Json
          status?: Database["public"]["Enums"]["version_status"]
          tenant_id: string
          version_name?: string
          version_note?: string | null
          version_number: number
        }
        Update: {
          asset_id?: string
          asset_type?: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          created_by?: string | null
          environment?: Database["public"]["Enums"]["version_environment"]
          id?: string
          is_current?: boolean
          parent_version_id?: string | null
          snapshot_data?: Json
          status?: Database["public"]["Enums"]["version_status"]
          tenant_id?: string
          version_name?: string
          version_note?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_versions_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "asset_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          environment: string
          id: string
          name: string
          status: string
          tags: string[]
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment?: string
          id?: string
          name: string
          status?: string
          tags?: string[]
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment?: string
          id?: string
          name?: string
          status?: string
          tags?: string[]
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_versions: {
        Row: {
          created_at: string
          created_by: string | null
          edges: Json
          flow_id: string
          id: string
          nodes: Json
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          edges?: Json
          flow_id: string
          id?: string
          nodes?: Json
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          edges?: Json
          flow_id?: string
          id?: string
          nodes?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "flow_versions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          edges: Json
          experience_id: string | null
          id: string
          language: string
          name: string
          nodes: Json
          status: Database["public"]["Enums"]["flow_status"]
          tenant_id: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          experience_id?: string | null
          id?: string
          language?: string
          name: string
          nodes?: Json
          status?: Database["public"]["Enums"]["flow_status"]
          tenant_id: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json
          experience_id?: string | null
          id?: string
          language?: string
          name?: string
          nodes?: Json
          status?: Database["public"]["Enums"]["flow_status"]
          tenant_id?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flows_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_org_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      globals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          tenant_id: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          tenant_id: string
          value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          tenant_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "globals_org_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      production_candidates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          environment: string
          experience_id: string | null
          flow_id: string | null
          id: string
          name: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment?: string
          experience_id?: string | null
          flow_id?: string | null
          id?: string
          name: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment?: string
          experience_id?: string | null
          flow_id?: string | null
          id?: string
          name?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_candidates_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_candidates_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          channels: string[]
          country_code: string
          created_at: string
          display_name: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          timezone: string | null
        }
        Insert: {
          channels?: string[]
          country_code?: string
          created_at?: string
          display_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          timezone?: string | null
        }
        Update: {
          channels?: string[]
          country_code?: string
          created_at?: string
          display_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          timezone?: string | null
        }
        Relationships: []
      }
      uploaded_demos: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          jsx_source: string
          scenario_notes: Json
          source_id: string | null
          source_name: string | null
          status: string
          tags: string[]
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id: string
          jsx_source: string
          scenario_notes?: Json
          source_id?: string | null
          source_name?: string | null
          status?: string
          tags?: string[]
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          jsx_source?: string
          scenario_notes?: Json
          source_id?: string | null
          source_name?: string | null
          status?: string
          tags?: string[]
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_demos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["webhook_direction"]
          flow_id: string | null
          id: string
          payload: Json | null
          response_body: string | null
          status_code: number | null
          tenant_id: string
          url: string | null
        }
        Insert: {
          created_at?: string
          direction?: Database["public"]["Enums"]["webhook_direction"]
          flow_id?: string | null
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          tenant_id: string
          url?: string | null
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["webhook_direction"]
          flow_id?: string | null
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          tenant_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_org_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          created_at: string
          direction: string
          from_phone: string | null
          id: string
          message_type: string | null
          payload: Json | null
          to_phone: string | null
          wa_message_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          direction?: string
          from_phone?: string | null
          id?: string
          message_type?: string | null
          payload?: Json | null
          to_phone?: string | null
          wa_message_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          direction?: string
          from_phone?: string | null
          id?: string
          message_type?: string | null
          payload?: Json | null
          to_phone?: string | null
          wa_message_id?: string | null
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          slug?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_asset_version_number: {
        Args: {
          _asset_id: string
          _asset_type: Database["public"]["Enums"]["asset_type"]
        }
        Returns: number
      }
      set_current_version: { Args: { _version_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      asset_type: "experience" | "demo" | "flow" | "production_candidate"
      flow_status: "draft" | "active" | "archived"
      version_environment: "draft" | "sandbox" | "production"
      version_status: "draft" | "validated" | "candidate" | "live" | "archived"
      webhook_direction: "inbound" | "outbound"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer"],
      asset_type: ["experience", "demo", "flow", "production_candidate"],
      flow_status: ["draft", "active", "archived"],
      version_environment: ["draft", "sandbox", "production"],
      version_status: ["draft", "validated", "candidate", "live", "archived"],
      webhook_direction: ["inbound", "outbound"],
    },
  },
} as const
