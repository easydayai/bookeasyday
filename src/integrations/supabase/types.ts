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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          address: string | null
          applicant_name: string
          applicant_notes: string | null
          approved_at: string | null
          approved_by: string | null
          background_info: Json | null
          bedroom_count: number | null
          city: string
          created_at: string | null
          decline_reason: string | null
          declined_at: string | null
          declined_by: string | null
          desired_move_in_date: string | null
          email: string
          employment_type: string | null
          id: string
          income_range: string | null
          internal_notes: string | null
          monthly_income: number | null
          phone: string
          source: string | null
          state: string
          status: string
          unit_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          applicant_name: string
          applicant_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          background_info?: Json | null
          bedroom_count?: number | null
          city: string
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          desired_move_in_date?: string | null
          email: string
          employment_type?: string | null
          id?: string
          income_range?: string | null
          internal_notes?: string | null
          monthly_income?: number | null
          phone: string
          source?: string | null
          state: string
          status?: string
          unit_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          applicant_name?: string
          applicant_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          background_info?: Json | null
          bedroom_count?: number | null
          city?: string
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          desired_move_in_date?: string | null
          email?: string
          employment_type?: string | null
          id?: string
          income_range?: string | null
          internal_notes?: string | null
          monthly_income?: number | null
          phone?: string
          source?: string | null
          state?: string
          status?: string
          unit_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointment_types: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          location_type: string | null
          name: string
          price: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          name: string
          price?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          name?: string
          price?: number | null
          user_id?: string
        }
        Relationships: []
      }
      availability_rules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          timezone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          timezone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          timezone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      booking_page_config: {
        Row: {
          config: Json
          created_at: string
          published_config: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          published_config?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          published_config?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          appointment_type_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: string | null
          user_id: string
        }
        Insert: {
          appointment_type_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: string | null
          user_id: string
        }
        Update: {
          appointment_type_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_design_settings: {
        Row: {
          accent_color: string | null
          background_color: string | null
          button_radius: number | null
          cover_image_url: string | null
          cover_style: string | null
          created_at: string | null
          font_family: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          show_business_name: boolean | null
          show_contact: boolean | null
          show_logo: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          button_radius?: number | null
          cover_image_url?: string | null
          cover_style?: string | null
          created_at?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          show_business_name?: boolean | null
          show_contact?: boolean | null
          show_logo?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          button_radius?: number | null
          cover_image_url?: string | null
          cover_style?: string | null
          created_at?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          show_business_name?: boolean | null
          show_contact?: boolean | null
          show_logo?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_knowledge: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credits_balance: {
        Row: {
          balance_credits: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance_credits?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance_credits?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credits_ledger: {
        Row: {
          created_at: string | null
          credits_delta: number
          event_type: string
          id: string
          reference_id: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_delta: number
          event_type: string
          id?: string
          reference_id?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_delta?: number
          event_type?: string
          id?: string
          reference_id?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          booking_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          notification_type: string
          recipient_email: string | null
          recipient_phone: string | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          notification_type: string
          recipient_email?: string | null
          recipient_phone?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          refund_reason: string | null
          refunded_at: string | null
          refunded_by: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          refunded_by?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          refunded_by?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          slug: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          slug?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          slug?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminder_rules: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          email_hours_before: number | null
          second_reminder_enabled: boolean | null
          second_reminder_hours_before: number | null
          sms_enabled: boolean | null
          sms_hours_before: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          email_hours_before?: number | null
          second_reminder_enabled?: boolean | null
          second_reminder_hours_before?: number | null
          sms_enabled?: boolean | null
          sms_hours_before?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          email_hours_before?: number | null
          second_reminder_enabled?: boolean | null
          second_reminder_hours_before?: number | null
          sms_enabled?: boolean | null
          sms_hours_before?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          id: string
          plan_key: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          id?: string
          plan_key?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          id?: string
          plan_key?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug_from_email: { Args: { email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "staff"
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
      app_role: ["owner", "admin", "staff"],
    },
  },
} as const
