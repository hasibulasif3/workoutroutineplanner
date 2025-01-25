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
      workouts: {
        Row: {
          calories: string | null
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
          scheduled_time: string | null
          sync_conflicts: Json | null
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
          scheduled_time?: string | null
          sync_conflicts?: Json | null
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
          scheduled_time?: string | null
          sync_conflicts?: Json | null
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
      [_ in never]: never
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
