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
      twitch_users: {
        Row: {
          access_token: string | null
          background_media_type: string | null
          background_media_url: string | null
          broadcaster_type: string | null
          confirmed_at: string | null
          created_at: string
          custom_bio: string | null
          display_name: string | null
          email: string | null
          icon_style: Database["public"]["Enums"]["icon_style"] | null
          id: string
          is_anonymous: boolean | null
          last_sign_in_at: string | null
          profile_image_url: string | null
          provider_id: string | null
          provider_refresh_token: string | null
          provider_scopes: string[] | null
          provider_token: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          refresh_token: string | null
          role: string | null
          seasonal_themes: boolean | null
          site_role: Database["public"]["Enums"]["user_level"]
          theme_scheme: string | null
          token_expires_at: string | null
          twitch_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          access_token?: string | null
          background_media_type?: string | null
          background_media_url?: string | null
          broadcaster_type?: string | null
          confirmed_at?: string | null
          created_at?: string
          custom_bio?: string | null
          display_name?: string | null
          email?: string | null
          icon_style?: Database["public"]["Enums"]["icon_style"] | null
          id?: string
          is_anonymous?: boolean | null
          last_sign_in_at?: string | null
          profile_image_url?: string | null
          provider_id?: string | null
          provider_refresh_token?: string | null
          provider_scopes?: string[] | null
          provider_token?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          refresh_token?: string | null
          role?: string | null
          seasonal_themes?: boolean | null
          site_role?: Database["public"]["Enums"]["user_level"]
          theme_scheme?: string | null
          token_expires_at?: string | null
          twitch_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          access_token?: string | null
          background_media_type?: string | null
          background_media_url?: string | null
          broadcaster_type?: string | null
          confirmed_at?: string | null
          created_at?: string
          custom_bio?: string | null
          display_name?: string | null
          email?: string | null
          icon_style?: Database["public"]["Enums"]["icon_style"] | null
          id?: string
          is_anonymous?: boolean | null
          last_sign_in_at?: string | null
          profile_image_url?: string | null
          provider_id?: string | null
          provider_refresh_token?: string | null
          provider_scopes?: string[] | null
          provider_token?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          refresh_token?: string | null
          role?: string | null
          seasonal_themes?: boolean | null
          site_role?: Database["public"]["Enums"]["user_level"]
          theme_scheme?: string | null
          token_expires_at?: string | null
          twitch_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      social_tree: {
        Row: {
          created_at: string | null
          id: string
          order_index: number | null
          platform: string
          title: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number | null
          platform: string
          title?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number | null
          platform?: string
          title?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_tree_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_tree_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "twitch_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          background_media_type: string | null
          background_media_url: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          icon_style: Database["public"]["Enums"]["icon_style"] | null
          profile_image_url: string | null
          seasonal_themes: boolean | null
          theme_scheme: string | null
          twitch_id: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          background_media_type?: string | null
          background_media_url?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon_style?: Database["public"]["Enums"]["icon_style"] | null
          profile_image_url?: string | null
          seasonal_themes?: boolean | null
          theme_scheme?: string | null
          twitch_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          background_media_type?: string | null
          background_media_url?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon_style?: Database["public"]["Enums"]["icon_style"] | null
          profile_image_url?: string | null
          seasonal_themes?: boolean | null
          theme_scheme?: string | null
          twitch_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      icon_style: "monochrome" | "colored" | "theme"
      user_level: "owner" | "admin" | "moderator" | "user"
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
