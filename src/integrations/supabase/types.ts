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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      a2a_agents: {
        Row: {
          active: boolean
          agent_id: string
          capabilities: Json
          created_at: string
          description: string
          jobs_completed: number
          name: string
          niche: string
          persona: string
          pricing_per_lead_cents: number
          pricing_per_meeting_cents: number
          pricing_per_reply_cents: number
          rating: number
          tagline: string
          updated_at: string
          version: string
        }
        Insert: {
          active?: boolean
          agent_id: string
          capabilities?: Json
          created_at?: string
          description?: string
          jobs_completed?: number
          name: string
          niche?: string
          persona?: string
          pricing_per_lead_cents?: number
          pricing_per_meeting_cents?: number
          pricing_per_reply_cents?: number
          rating?: number
          tagline?: string
          updated_at?: string
          version?: string
        }
        Update: {
          active?: boolean
          agent_id?: string
          capabilities?: Json
          created_at?: string
          description?: string
          jobs_completed?: number
          name?: string
          niche?: string
          persona?: string
          pricing_per_lead_cents?: number
          pricing_per_meeting_cents?: number
          pricing_per_reply_cents?: number
          rating?: number
          tagline?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      a2a_api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          notes: string
          owner_email: string
          owner_name: string
          rate_limit_per_min: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          notes?: string
          owner_email: string
          owner_name?: string
          rate_limit_per_min?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          notes?: string
          owner_email?: string
          owner_name?: string
          rate_limit_per_min?: number
          status?: string
        }
        Relationships: []
      }
      a2a_byo_smtp: {
        Row: {
          created_at: string
          from_email: string
          id: string
          job_id: string
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_username: string
        }
        Insert: {
          created_at?: string
          from_email: string
          id?: string
          job_id: string
          smtp_host: string
          smtp_password: string
          smtp_port?: number
          smtp_username: string
        }
        Update: {
          created_at?: string
          from_email?: string
          id?: string
          job_id?: string
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_username?: string
        }
        Relationships: []
      }
      a2a_jobs: {
        Row: {
          agent_id: string
          api_key_id: string | null
          callback_url: string | null
          campaign_id: string | null
          created_at: string
          daily_send_cap: number
          error_message: string | null
          estimated_cost_cents: number
          id: string
          last_event: string | null
          last_event_at: string | null
          last_run_at: string | null
          leads_sent: number
          leads_total: number
          paused_at: string | null
          request: Json
          results_summary: Json
          sender_identity: Json
          source: string
          spend_cents: number
          spending_cap_cents: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          api_key_id?: string | null
          callback_url?: string | null
          campaign_id?: string | null
          created_at?: string
          daily_send_cap?: number
          error_message?: string | null
          estimated_cost_cents?: number
          id?: string
          last_event?: string | null
          last_event_at?: string | null
          last_run_at?: string | null
          leads_sent?: number
          leads_total?: number
          paused_at?: string | null
          request?: Json
          results_summary?: Json
          sender_identity?: Json
          source?: string
          spend_cents?: number
          spending_cap_cents?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          api_key_id?: string | null
          callback_url?: string | null
          campaign_id?: string | null
          created_at?: string
          daily_send_cap?: number
          error_message?: string | null
          estimated_cost_cents?: number
          id?: string
          last_event?: string | null
          last_event_at?: string | null
          last_run_at?: string | null
          leads_sent?: number
          leads_total?: number
          paused_at?: string | null
          request?: Json
          results_summary?: Json
          sender_identity?: Json
          source?: string
          spend_cents?: number
          spending_cap_cents?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "a2a_jobs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "a2a_agents"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "a2a_jobs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "a2a_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      a2a_ledger: {
        Row: {
          billed: boolean
          billed_at: string | null
          billing_method: string | null
          created_at: string
          event_type: string
          id: string
          job_id: string
          metadata: Json
          stripe_invoice_item_id: string | null
          unit_cost_cents: number
        }
        Insert: {
          billed?: boolean
          billed_at?: string | null
          billing_method?: string | null
          created_at?: string
          event_type: string
          id?: string
          job_id: string
          metadata?: Json
          stripe_invoice_item_id?: string | null
          unit_cost_cents?: number
        }
        Update: {
          billed?: boolean
          billed_at?: string | null
          billing_method?: string | null
          created_at?: string
          event_type?: string
          id?: string
          job_id?: string
          metadata?: Json
          stripe_invoice_item_id?: string | null
          unit_cost_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "a2a_ledger_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "a2a_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      a2a_partners: {
        Row: {
          api_key_id: string
          auto_charge: boolean
          balance_cents: number
          billing_email: string
          created_at: string
          current_invoice_id: string | null
          id: string
          stripe_customer_id: string | null
          total_spent_cents: number
          updated_at: string
        }
        Insert: {
          api_key_id: string
          auto_charge?: boolean
          balance_cents?: number
          billing_email?: string
          created_at?: string
          current_invoice_id?: string | null
          id?: string
          stripe_customer_id?: string | null
          total_spent_cents?: number
          updated_at?: string
        }
        Update: {
          api_key_id?: string
          auto_charge?: boolean
          balance_cents?: number
          billing_email?: string
          created_at?: string
          current_invoice_id?: string | null
          id?: string
          stripe_customer_id?: string | null
          total_spent_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      campaign_sends: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          error_message: string | null
          id: string
          lead_email: string
          lead_name: string
          opened_at: string | null
          sent_at: string | null
          status: string
          subject: string
          user_id: string
          variant: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lead_email: string
          lead_name?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          user_id: string
          variant?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lead_email?: string
          lead_name?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string
          variant?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          emails: Json
          goal: string
          id: string
          leads: Json
          name: string
          niche: string
          status: string
          target_audience: Json
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          created_at?: string
          emails?: Json
          goal?: string
          id?: string
          leads?: Json
          name?: string
          niche?: string
          status?: string
          target_audience?: Json
          updated_at?: string
          user_id: string
          website_url?: string
        }
        Update: {
          created_at?: string
          emails?: Json
          goal?: string
          id?: string
          leads?: Json
          name?: string
          niche?: string
          status?: string
          target_audience?: Json
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          credits_added: number
          environment: string
          id: string
          stripe_session_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          credits_added: number
          environment?: string
          id?: string
          stripe_session_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          credits_added?: number
          environment?: string
          id?: string
          stripe_session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_replies: {
        Row: {
          ai_draft_reply: string
          ai_suggested_action: string
          body: string
          campaign_id: string
          classification: string
          created_at: string
          id: string
          lead_email: string
          lead_name: string
          received_at: string
          sent_at: string | null
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          ai_draft_reply?: string
          ai_suggested_action?: string
          body?: string
          campaign_id: string
          classification?: string
          created_at?: string
          id?: string
          lead_email: string
          lead_name?: string
          received_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          user_id: string
        }
        Update: {
          ai_draft_reply?: string
          ai_suggested_action?: string
          body?: string
          campaign_id?: string
          classification?: string
          created_at?: string
          id?: string
          lead_email?: string
          lead_name?: string
          received_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_groups_research: {
        Row: {
          audience: string
          created_at: string
          expires_at: string
          id: string
          niche: string
          results: Json
          user_id: string
        }
        Insert: {
          audience?: string
          created_at?: string
          expires_at?: string
          id?: string
          niche: string
          results?: Json
          user_id: string
        }
        Update: {
          audience?: string
          created_at?: string
          expires_at?: string
          id?: string
          niche?: string
          results?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_purchased: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_email_settings: {
        Row: {
          created_at: string
          email_address: string
          email_alerts_paused: boolean
          id: string
          is_connected: boolean
          provider: string
          scheduling_link: string
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_username: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_address?: string
          email_alerts_paused?: boolean
          id?: string
          is_connected?: boolean
          provider?: string
          scheduling_link?: string
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_username?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_address?: string
          email_alerts_paused?: boolean
          id?: string
          is_connected?: boolean
          provider?: string
          scheduling_link?: string
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_username?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_usage: {
        Row: {
          created_at: string
          emails_sent: number
          id: string
          linkedin_actions: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          emails_sent?: number
          id?: string
          linkedin_actions?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          emails_sent?: number
          id?: string
          linkedin_actions?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_week_caps: {
        Args: { _user_id: string }
        Returns: {
          email_cap: number
          emails_used: number
          linkedin_cap: number
          linkedin_used: number
          subscription_active: boolean
          tier: string
          week_start: string
        }[]
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
    Enums: {},
  },
} as const
