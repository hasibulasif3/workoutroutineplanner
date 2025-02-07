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
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      column_preferences: {
        Row: {
          created_at: string | null
          day: string
          display_order: number | null
          id: string
          is_collapsed: boolean | null
          is_hidden: boolean | null
          last_modified: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          day: string
          display_order?: number | null
          id?: string
          is_collapsed?: boolean | null
          is_hidden?: boolean | null
          last_modified?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          day?: string
          display_order?: number | null
          id?: string
          is_collapsed?: boolean | null
          is_hidden?: boolean | null
          last_modified?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          bcc: string[] | null
          cc: string[] | null
          delivery_status: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          bcc?: string[] | null
          cc?: string[] | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient: string
          sent_at?: string | null
          status: string
          subject: string
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          bcc?: string[] | null
          cc?: string[] | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string | null
          html_content: string
          id: string
          is_default: boolean | null
          name: string
          subject: string
          text_content: string
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          html_content: string
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          text_content: string
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          html_content?: string
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          text_content?: string
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          affiliate_link: string
          category: string
          created_at: string
          created_by: string | null
          description: string
          difficulty: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          price: number
          rating: number | null
          reviews_count: number | null
          stock_status: number | null
          updated_at: string
        }
        Insert: {
          affiliate_link: string
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          difficulty?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          metadata?: Json | null
          name: string
          price: number
          rating?: number | null
          reviews_count?: number | null
          stock_status?: number | null
          updated_at?: string
        }
        Update: {
          affiliate_link?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          difficulty?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          metadata?: Json | null
          name?: string
          price?: number
          rating?: number | null
          reviews_count?: number | null
          stock_status?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_banners: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          is_active: boolean | null
          link_url: string | null
          message: string
          position: string | null
          start_date: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          message: string
          position?: string | null
          start_date: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          message?: string
          position?: string | null
          start_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calories: string | null
          client_timestamp: string | null
          completed: boolean | null
          concurrent_version: number | null
          cooldown_duration: string | null
          created_at: string | null
          difficulty: string | null
          display_order: number | null
          duration: string
          exercise_order: Json | null
          exercise_validation_rules: Json | null
          exercises: Json | null
          id: string
          last_modified: string | null
          last_synced_at: string | null
          local_changes: Json | null
          metadata: Json | null
          notes: string | null
          offline_id: string | null
          related_workouts: Json | null
          rest_between_exercises: string | null
          retry_count: number | null
          scheduled_time: string | null
          sync_conflicts: Json | null
          sync_error: string | null
          sync_hash: string | null
          sync_status: string | null
          time_zone: string | null
          title: string
          total_exercise_time: number | null
          type: string
          user_id: string | null
          version: string | null
          warmup_duration: string | null
        }
        Insert: {
          calories?: string | null
          client_timestamp?: string | null
          completed?: boolean | null
          concurrent_version?: number | null
          cooldown_duration?: string | null
          created_at?: string | null
          difficulty?: string | null
          display_order?: number | null
          duration: string
          exercise_order?: Json | null
          exercise_validation_rules?: Json | null
          exercises?: Json | null
          id?: string
          last_modified?: string | null
          last_synced_at?: string | null
          local_changes?: Json | null
          metadata?: Json | null
          notes?: string | null
          offline_id?: string | null
          related_workouts?: Json | null
          rest_between_exercises?: string | null
          retry_count?: number | null
          scheduled_time?: string | null
          sync_conflicts?: Json | null
          sync_error?: string | null
          sync_hash?: string | null
          sync_status?: string | null
          time_zone?: string | null
          title: string
          total_exercise_time?: number | null
          type: string
          user_id?: string | null
          version?: string | null
          warmup_duration?: string | null
        }
        Update: {
          calories?: string | null
          client_timestamp?: string | null
          completed?: boolean | null
          concurrent_version?: number | null
          cooldown_duration?: string | null
          created_at?: string | null
          difficulty?: string | null
          display_order?: number | null
          duration?: string
          exercise_order?: Json | null
          exercise_validation_rules?: Json | null
          exercises?: Json | null
          id?: string
          last_modified?: string | null
          last_synced_at?: string | null
          local_changes?: Json | null
          metadata?: Json | null
          notes?: string | null
          offline_id?: string | null
          related_workouts?: Json | null
          rest_between_exercises?: string | null
          retry_count?: number | null
          scheduled_time?: string | null
          sync_conflicts?: Json | null
          sync_error?: string | null
          sync_hash?: string | null
          sync_status?: string | null
          time_zone?: string | null
          title?: string
          total_exercise_time?: number | null
          type?: string
          user_id?: string | null
          version?: string | null
          warmup_duration?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_rate_limit: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "product_manager" | "content_manager"
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
