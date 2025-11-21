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
      order_shared_users: {
        Row: {
          created_at: string
          has_access: boolean
          id: string
          order_id: string
          user_email: string
          user_name: string
          user_phone: string
          user_type: string
        }
        Insert: {
          created_at?: string
          has_access?: boolean
          id?: string
          order_id: string
          user_email: string
          user_name: string
          user_phone: string
          user_type: string
        }
        Update: {
          created_at?: string
          has_access?: boolean
          id?: string
          order_id?: string
          user_email?: string
          user_name?: string
          user_phone?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shared_users_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_templates: {
        Row: {
          created_at: string
          id: string
          order_id: string
          template_duration: string
          template_id: string
          template_orientation: string
          template_price: number
          template_resolution: string
          template_thumbnail_url: string | null
          template_title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          template_duration: string
          template_id: string
          template_orientation: string
          template_price: number
          template_resolution: string
          template_thumbnail_url?: string | null
          template_title: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          template_duration?: string
          template_id?: string
          template_orientation?: string
          template_price?: number
          template_resolution?: string
          template_thumbnail_url?: string | null
          template_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_templates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          discount: number
          discount_code: string | null
          id: string
          order_number: string
          payment_method: string
          payment_status: string
          share_method: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          discount?: number
          discount_code?: string | null
          id?: string
          order_number: string
          payment_method: string
          payment_status?: string
          share_method: string
          subtotal: number
          tax: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          discount?: number
          discount_code?: string | null
          id?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          share_method?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_enrolled_users: {
        Row: {
          created_at: string
          enrolled_user_email: string
          enrolled_user_name: string
          enrolled_user_phone: string | null
          id: string
          is_enabled: boolean
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          enrolled_user_email: string
          enrolled_user_name: string
          enrolled_user_phone?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          enrolled_user_email?: string
          enrolled_user_name?: string
          enrolled_user_phone?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      user_templates: {
        Row: {
          created_at: string | null
          custom_title: string | null
          id: string
          notes: string | null
          published: boolean | null
          published_at: string | null
          updated_at: string | null
          user_id: string
          variation_id: string
        }
        Insert: {
          created_at?: string | null
          custom_title?: string | null
          id?: string
          notes?: string | null
          published?: boolean | null
          published_at?: string | null
          updated_at?: string | null
          user_id: string
          variation_id: string
        }
        Update: {
          created_at?: string | null
          custom_title?: string | null
          id?: string
          notes?: string | null
          published?: boolean | null
          published_at?: string | null
          updated_at?: string | null
          user_id?: string
          variation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_templates_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "video_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      video_variations: {
        Row: {
          aspect_ratio: string
          created_at: string
          duration: string
          id: string
          platforms: string[] | null
          quality: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_id: number
          video_url: string | null
        }
        Insert: {
          aspect_ratio: string
          created_at?: string
          duration: string
          id?: string
          platforms?: string[] | null
          quality?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_id: number
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          duration?: string
          id?: string
          platforms?: string[] | null
          quality?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_id?: number
          video_url?: string | null
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
