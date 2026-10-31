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
      applicant_documents: {
        Row: {
          admin_notes: string | null
          application_id: string
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          application_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          application_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applicant_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applicant_profiles: {
        Row: {
          application_id: string
          certifications: string[] | null
          created_at: string
          education_institution: string | null
          education_level: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          id: string
          job_title: string | null
          languages: string[] | null
          marital_status: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          number_of_dependents: number | null
          previous_employer: string | null
          skills: string[] | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          application_id: string
          certifications?: string[] | null
          created_at?: string
          education_institution?: string | null
          education_level?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id?: string
          job_title?: string | null
          languages?: string[] | null
          marital_status?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          number_of_dependents?: number | null
          previous_employer?: string | null
          skills?: string[] | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          application_id?: string
          certifications?: string[] | null
          created_at?: string
          education_institution?: string | null
          education_level?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          id?: string
          job_title?: string | null
          languages?: string[] | null
          marital_status?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          number_of_dependents?: number | null
          previous_employer?: string | null
          skills?: string[] | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "applicant_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applicant_references: {
        Row: {
          application_id: string
          company_or_organization: string | null
          created_at: string
          id: string
          reference_email: string | null
          reference_name: string
          reference_phone: string
          relationship: string
        }
        Insert: {
          application_id: string
          company_or_organization?: string | null
          created_at?: string
          id?: string
          reference_email?: string | null
          reference_name: string
          reference_phone: string
          relationship: string
        }
        Update: {
          application_id?: string
          company_or_organization?: string | null
          created_at?: string
          id?: string
          reference_email?: string | null
          reference_name?: string
          reference_phone?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "applicant_references_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          age: number
          country: string
          cover_letter: string | null
          created_at: string
          email: string
          full_name: string
          has_passport: boolean
          id: string
          job_id: string | null
          kyc_completed: boolean | null
          manychat_subscriber_id: string | null
          notes: string | null
          paid_at: string | null
          payment_amount: number | null
          payment_currency: string | null
          payment_reference: string | null
          payment_status: string | null
          phone: string
          processing_fee: string | null
          proposal_id: string | null
          recruitment_cycle: string | null
          status: Database["public"]["Enums"]["application_status"]
          telegram_chat_id: string | null
          updated_at: string
          user_id: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          age: number
          country: string
          cover_letter?: string | null
          created_at?: string
          email: string
          full_name: string
          has_passport?: boolean
          id?: string
          job_id?: string | null
          kyc_completed?: boolean | null
          manychat_subscriber_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone: string
          processing_fee?: string | null
          proposal_id?: string | null
          recruitment_cycle?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          telegram_chat_id?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          age?: number
          country?: string
          cover_letter?: string | null
          created_at?: string
          email?: string
          full_name?: string
          has_passport?: boolean
          id?: string
          job_id?: string | null
          kyc_completed?: boolean | null
          manychat_subscriber_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string
          processing_fee?: string | null
          proposal_id?: string | null
          recruitment_cycle?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          telegram_chat_id?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      connects_purchases: {
        Row: {
          amount_usd: number
          connects: number
          contract_id: string | null
          created_at: string
          refunded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_usd?: number
          connects?: number
          contract_id?: string | null
          created_at?: string
          refunded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          connects?: number
          contract_id?: string | null
          created_at?: string
          refunded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connects_purchases_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          employer_id: string | null
          end_date: string | null
          fixed_amount: number | null
          hourly_rate: number | null
          id: string
          job_id: string | null
          pay_type: Database["public"]["Enums"]["pay_type"]
          proposal_id: string | null
          signed_at: string | null
          signature_name: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"]
          terms: string | null
          title: string
          updated_at: string
          weekly_hours: number | null
          worker_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          employer_id?: string | null
          end_date?: string | null
          fixed_amount?: number | null
          hourly_rate?: number | null
          id?: string
          job_id?: string | null
          pay_type?: Database["public"]["Enums"]["pay_type"]
          proposal_id?: string | null
          signed_at?: string | null
          signature_name?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terms?: string | null
          title: string
          updated_at?: string
          weekly_hours?: number | null
          worker_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          employer_id?: string | null
          end_date?: string | null
          fixed_amount?: number | null
          hourly_rate?: number | null
          id?: string
          job_id?: string | null
          pay_type?: Database["public"]["Enums"]["pay_type"]
          proposal_id?: string | null
          signed_at?: string | null
          signature_name?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          terms?: string | null
          title?: string
          updated_at?: string
          weekly_hours?: number | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: true
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          availability: string | null
          created_at: string
          hourly_rate: number | null
          portfolio: string | null
          ratings: number
          skills: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          hourly_rate?: number | null
          portfolio?: string | null
          ratings?: number
          skills?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          hourly_rate?: number | null
          portfolio?: string | null
          ratings?: number
          skills?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          contract_type: string | null
          country: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          requirements: string[] | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          contract_type?: string | null
          country: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          contract_type?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string[] | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_subscriptions: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          expires_at: string | null
          flutterwave_ref: string | null
          id: string
          is_client: boolean | null
          payment_reference: string | null
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          expires_at?: string | null
          flutterwave_ref?: string | null
          id?: string
          is_client?: boolean | null
          payment_reference?: string | null
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          expires_at?: string | null
          flutterwave_ref?: string | null
          id?: string
          is_client?: boolean | null
          payment_reference?: string | null
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_subscriptions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
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
      messages: {
        Row: {
          application_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          recipient_type: string
          sender_id: string
          type: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          recipient_type?: string
          sender_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          recipient_type?: string
          sender_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey"
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
      notifications: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
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
          kyc_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string
          description: string
          freelancer_id: string
          id: string
          job_id: string
          proposed_fee: number
          status: Database["public"]["Enums"]["proposal_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          freelancer_id: string
          id?: string
          job_id: string
          proposed_fee: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          freelancer_id?: string
          id?: string
          job_id?: string
          proposed_fee?: number
          status?: Database["public"]["Enums"]["proposal_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
      worker_payout_methods: {
        Row: {
          account_name: string
          account_number: string | null
          bank_name: string | null
          country: string | null
          created_at: string
          currency: string
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          mobile_network: string | null
          paypal_email: string | null
          routing_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          method: Database["public"]["Enums"]["payout_method"]
          mobile_network?: string | null
          paypal_email?: string | null
          routing_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          mobile_network?: string | null
          paypal_email?: string | null
          routing_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_balances: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      withdrawal_requests: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          currency: string
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          notes: string | null
          payout_details: Json
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          currency?: string
          id?: string
          method: Database["public"]["Enums"]["payout_method"]
          notes?: string | null
          payout_details?: Json
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          currency?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          notes?: string | null
          payout_details?: Json
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
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
      contract_status:
        | "draft"
        | "pending_signature"
        | "signed"
        | "active"
        | "completed"
        | "cancelled"
      pay_type: "hourly" | "fixed"
      payout_method: "mobile_money" | "bank_transfer" | "paypal"
      proposal_status: "pending" | "accepted" | "rejected" | "withdrawn"
      withdrawal_status: "pending" | "approved" | "paid" | "rejected"
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
      contract_status: [
        "draft",
        "pending_signature",
        "signed",
        "active",
        "completed",
        "cancelled",
      ],
      pay_type: ["hourly", "fixed"],
      payout_method: ["mobile_money", "bank_transfer", "paypal"],
      proposal_status: ["pending", "accepted", "rejected", "withdrawn"],
      withdrawal_status: ["pending", "approved", "paid", "rejected"],
    },
  },
} as const
