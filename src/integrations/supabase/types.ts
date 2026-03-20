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
      channel_connections: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          health_checked_at: string | null
          health_error: string | null
          health_status: string
          id: string
          provider: string
          status: string
          tenant_id: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name?: string
          health_checked_at?: string | null
          health_error?: string | null
          health_status?: string
          id?: string
          provider: string
          status?: string
          tenant_id: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          health_checked_at?: string | null
          health_error?: string | null
          health_status?: string
          id?: string
          provider?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_share_views: {
        Row: {
          demo_id: string
          id: string
          referrer: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          demo_id: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          demo_id?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      demo_shares: {
        Row: {
          created_at: string
          created_by: string | null
          demo_type: string
          demo_url: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_views: number | null
          tenant_id: string | null
          title: string
          token: string
          updated_at: string
          view_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          demo_type?: string
          demo_url: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_views?: number | null
          tenant_id?: string | null
          title: string
          token?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          demo_type?: string
          demo_url?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_views?: number | null
          tenant_id?: string | null
          title?: string
          token?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "demo_shares_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_context_values: {
        Row: {
          entity_data: Json | null
          entity_id: string
          experience_id: string | null
          id: string
          last_updated: string | null
          run_id: string | null
        }
        Insert: {
          entity_data?: Json | null
          entity_id: string
          experience_id?: string | null
          id?: string
          last_updated?: string | null
          run_id?: string | null
        }
        Update: {
          entity_data?: Json | null
          entity_id?: string
          experience_id?: string | null
          id?: string
          last_updated?: string | null
          run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_context_values_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "experience_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_context_values_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_context_values_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "flow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_entities: {
        Row: {
          created_at: string | null
          data_schema: Json | null
          description: string | null
          entity_type: string
          experience_id: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_schema?: Json | null
          description?: string | null
          entity_type?: string
          experience_id?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_schema?: Json | null
          description?: string | null
          entity_type?: string
          experience_id?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_entities_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_entities_tenant_id_fkey"
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
      flow_run_steps: {
        Row: {
          created_at: string
          elapsed_ms: number | null
          id: string
          input: Json
          node_label: string | null
          node_type: string
          node_uuid: string
          output: Json
          run_id: string
        }
        Insert: {
          created_at?: string
          elapsed_ms?: number | null
          id?: string
          input?: Json
          node_label?: string | null
          node_type?: string
          node_uuid?: string
          output?: Json
          run_id: string
        }
        Update: {
          created_at?: string
          elapsed_ms?: number | null
          id?: string
          input?: Json
          node_label?: string | null
          node_type?: string
          node_uuid?: string
          output?: Json
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_run_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "flow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_runs: {
        Row: {
          contact_urn: string
          context_snapshot: Json
          created_at: string
          ended_at: string | null
          flow_id: string | null
          id: string
          started_at: string
          status: Database["public"]["Enums"]["run_status"]
          tenant_id: string
          terminal_reason: string | null
          updated_at: string
        }
        Insert: {
          contact_urn?: string
          context_snapshot?: Json
          created_at?: string
          ended_at?: string | null
          flow_id?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          tenant_id: string
          terminal_reason?: string | null
          updated_at?: string
        }
        Update: {
          contact_urn?: string
          context_snapshot?: Json
          created_at?: string
          ended_at?: string | null
          flow_id?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
          tenant_id?: string
          terminal_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_runs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          trigger_rules: Json
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
          trigger_rules?: Json
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
          trigger_rules?: Json
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
      llm_usage_logs: {
        Row: {
          completion_tokens: number
          created_at: string
          error_message: string | null
          estimated_cost_usd: number
          flow_id: string | null
          id: string
          iteration_count: number
          latency_ms: number
          model: string
          prompt_tokens: number
          session_id: string | null
          status: string
          tenant_id: string | null
          tool_calls_count: number
          total_tokens: number
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number
          flow_id?: string | null
          id?: string
          iteration_count?: number
          latency_ms?: number
          model?: string
          prompt_tokens?: number
          session_id?: string | null
          status?: string
          tenant_id?: string | null
          tool_calls_count?: number
          total_tokens?: number
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number
          flow_id?: string | null
          id?: string
          iteration_count?: number
          latency_ms?: number
          model?: string
          prompt_tokens?: number
          session_id?: string | null
          status?: string
          tenant_id?: string | null
          tool_calls_count?: number
          total_tokens?: number
        }
        Relationships: [
          {
            foreignKeyName: "llm_usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      player_conversations: {
        Row: {
          channel: string
          contact_urn: string
          created_at: string
          data_mode: string
          id: string
          last_message_at: string
          message_count: number
          metadata: Json
          session_id: string
          started_at: string
          tenant_id: string | null
        }
        Insert: {
          channel?: string
          contact_urn?: string
          created_at?: string
          data_mode?: string
          id?: string
          last_message_at?: string
          message_count?: number
          metadata?: Json
          session_id: string
          started_at?: string
          tenant_id?: string | null
        }
        Update: {
          channel?: string
          contact_urn?: string
          created_at?: string
          data_mode?: string
          id?: string
          last_message_at?: string
          message_count?: number
          metadata?: Json
          session_id?: string
          started_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      player_messages: {
        Row: {
          ai_latency_ms: number | null
          ai_model: string | null
          blocks: Json
          content: string
          conversation_id: string
          created_at: string
          direction: string
          id: string
          image_url: string | null
          source: string | null
        }
        Insert: {
          ai_latency_ms?: number | null
          ai_model?: string | null
          blocks?: Json
          content?: string
          conversation_id: string
          created_at?: string
          direction?: string
          id?: string
          image_url?: string | null
          source?: string | null
        }
        Update: {
          ai_latency_ms?: number | null
          ai_model?: string | null
          blocks?: Json
          content?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          image_url?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "player_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      player_saved_flows: {
        Row: {
          conversation_snapshot: Json
          created_at: string
          created_by: string | null
          data_mode: string
          description: string | null
          id: string
          message_count: number
          name: string
          scenario_config: Json
          source_id: string | null
          source_name: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          conversation_snapshot?: Json
          created_at?: string
          created_by?: string | null
          data_mode?: string
          description?: string | null
          id?: string
          message_count?: number
          name: string
          scenario_config?: Json
          source_id?: string | null
          source_name?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          conversation_snapshot?: Json
          created_at?: string
          created_by?: string | null
          data_mode?: string
          description?: string | null
          id?: string
          message_count?: number
          name?: string
          scenario_config?: Json
          source_id?: string | null
          source_name?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_saved_flows_tenant_id_fkey"
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
      telegram_messages: {
        Row: {
          chat_id: number
          created_at: string
          direction: string
          first_name: string | null
          id: string
          message_text: string | null
          telegram_message_id: number | null
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          direction?: string
          first_name?: string | null
          id?: string
          message_text?: string | null
          telegram_message_id?: number | null
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          direction?: string
          first_name?: string | null
          id?: string
          message_text?: string | null
          telegram_message_id?: number | null
          username?: string | null
        }
        Relationships: []
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
      whatsapp_templates: {
        Row: {
          body_text: string
          category: string
          created_at: string
          id: string
          language: string
          name: string
          parameter_count: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          body_text?: string
          category?: string
          created_at?: string
          id?: string
          language?: string
          name: string
          parameter_count?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          body_text?: string
          category?: string
          created_at?: string
          id?: string
          language?: string
          name?: string
          parameter_count?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      increment_demo_share_view: {
        Args: { share_token: string }
        Returns: undefined
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
      run_status: "waiting" | "active" | "completed" | "expired" | "errored"
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
      run_status: ["waiting", "active", "completed", "expired", "errored"],
      version_environment: ["draft", "sandbox", "production"],
      version_status: ["draft", "validated", "candidate", "live", "archived"],
      webhook_direction: ["inbound", "outbound"],
    },
  },
} as const
