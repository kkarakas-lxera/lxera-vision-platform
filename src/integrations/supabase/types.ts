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
      companies: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_courses: number | null
          max_employees: number | null
          name: string
          plan_type: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_courses?: number | null
          max_employees?: number | null
          name: string
          plan_type?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_courses?: number | null
          max_employees?: number | null
          name?: string
          plan_type?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          company_id: string
          completed_at: string | null
          completion_time_minutes: number | null
          course_id: string
          created_at: string | null
          due_date: string | null
          employee_id: string
          feedback: Json | null
          id: string
          priority: string | null
          progress_percentage: number | null
          quiz_score: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          company_id: string
          completed_at?: string | null
          completion_time_minutes?: number | null
          course_id: string
          created_at?: string | null
          due_date?: string | null
          employee_id: string
          feedback?: Json | null
          id?: string
          priority?: string | null
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          company_id?: string
          completed_at?: string | null
          completion_time_minutes?: number | null
          course_id?: string
          created_at?: string | null
          due_date?: string | null
          employee_id?: string
          feedback?: Json | null
          id?: string
          priority?: string | null
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          career_goal: string | null
          company_id: string
          courses_completed: number | null
          created_at: string | null
          department: string | null
          employee_id: string | null
          employee_role: string | null
          hired_date: string | null
          id: string
          is_active: boolean | null
          key_tools: string[] | null
          last_activity: string | null
          learning_style: Json | null
          manager_id: string | null
          position: string | null
          skill_level: string | null
          total_learning_hours: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          career_goal?: string | null
          company_id: string
          courses_completed?: number | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          employee_role?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          key_tools?: string[] | null
          last_activity?: string | null
          learning_style?: Json | null
          manager_id?: string | null
          position?: string | null
          skill_level?: string | null
          total_learning_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          career_goal?: string | null
          company_id?: string
          courses_completed?: number | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          employee_role?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          key_tools?: string[] | null
          last_activity?: string | null
          learning_style?: Json | null
          manager_id?: string | null
          position?: string | null
          skill_level?: string | null
          total_learning_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          department: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          learning_preferences: Json | null
          password_hash: string
          phone: string | null
          position: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          learning_preferences?: Json | null
          password_hash: string
          phone?: string | null
          position?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          learning_preferences?: Json | null
          password_hash?: string
          phone?: string | null
          position?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
