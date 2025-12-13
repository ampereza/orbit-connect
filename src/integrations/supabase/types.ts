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
      applications: {
        Row: {
          age: number
          country: string
          created_at: string
          email: string
          full_name: string
          has_passport: boolean
          id: string
          manychat_subscriber_id: string | null
          notes: string | null
          paid_at: string | null
          payment_amount: number | null
          payment_currency: string | null
          payment_reference: string | null
          payment_status: string | null
          phone: string
          processing_fee: string | null
          recruitment_cycle: string | null
          status: Database["public"]["Enums"]["application_status"]
          telegram_chat_id: string | null
          updated_at: string
          whatsapp_phone: string | null
        }
        Insert: {
          age: number
          country: string
          created_at?: string
          email: string
          full_name: string
          has_passport?: boolean
          id?: string
          manychat_subscriber_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone: string
          processing_fee?: string | null
          recruitment_cycle?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          telegram_chat_id?: string | null
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Update: {
          age?: number
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          has_passport?: boolean
          id?: string
          manychat_subscriber_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string
          processing_fee?: string | null
          recruitment_cycle?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          telegram_chat_id?: string | null
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      manychat_logs: {
        Row: {
          application_id: string | null
          created_at: string
          direction: string
          id: string
          message_content: string | null
          message_type: string
          status: string | null
          subscriber_id: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          direction?: string
          id?: string
          message_content?: string | null
          message_type: string
          status?: string | null
          subscriber_id?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string
          direction?: string
          id?: string
          message_content?: string | null
          message_type?: string
          status?: string | null
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manychat_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_phone: string | null
          flutterwave_ref: string | null
          id: string
          metadata: Json | null
          payment_type: string | null
          status: string
          transaction_ref: string
          updated_at: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string
          currency: string
          customer_email?: string | null
          customer_phone?: string | null
          flutterwave_ref?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: string | null
          status?: string
          transaction_ref: string
          updated_at?: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_phone?: string | null
          flutterwave_ref?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: string | null
          status?: string
          transaction_ref?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notification_logs: {
        Row: {
          application_id: string | null
          created_at: string
          error_message: string | null
          id: string
          platform: string
          sent_at: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platform: string
          sent_at?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platform?: string
          sent_at?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_notification_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          ai_generated: boolean | null
          application_id: string | null
          content: string
          created_at: string
          direction: string
          id: string
          message_type: string
          metadata: Json | null
          platform: string
          sender_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          application_id?: string | null
          content: string
          created_at?: string
          direction: string
          id?: string
          message_type: string
          metadata?: Json | null
          platform: string
          sender_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          application_id?: string | null
          content?: string
          created_at?: string
          direction?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          platform?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      application_status:
        | "pending"
        | "paid"
        | "verified"
        | "matched"
        | "deployed"
        | "rejected"
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
      app_role: ["admin", "user"],
      application_status: [
        "pending",
        "paid",
        "verified",
        "matched",
        "deployed",
        "rejected",
      ],
    },
  },
} as const
