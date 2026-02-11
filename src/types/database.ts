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
      Achievement: {
        Row: {
          category: string | null
          createdAt: string | null
          date: string | null
          description: string | null
          id: string
          title: string
          updatedAt: string | null
          userId: string
        }
        Insert: {
          category?: string | null
          createdAt?: string | null
          date?: string | null
          description?: string | null
          id?: string
          title: string
          updatedAt?: string | null
          userId: string
        }
        Update: {
          category?: string | null
          createdAt?: string | null
          date?: string | null
          description?: string | null
          id?: string
          title?: string
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Achievement_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      AudienceDemographics: {
        Row: {
          connectedAccountId: string
          id: string
          label: string
          type: string
          updatedAt: string | null
        }
        Insert: {
          connectedAccountId: string
          id?: string
          label: string
          type: string
          updatedAt?: string | null
        }
        Update: {
          connectedAccountId?: string
          id?: string
          label?: string
          type?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AudienceDemographics_connectedAccountId_fkey"
            columns: ["connectedAccountId"]
            isOneToOne: false
            referencedRelation: "ConnectedAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      Collaboration: {
        Row: {
          brand: string
          campaign: string | null
          createdAt: string | null
          date: string | null
          id: string
          type: string | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          brand: string
          campaign?: string | null
          createdAt?: string | null
          date?: string | null
          id?: string
          type?: string | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          brand?: string
          campaign?: string | null
          createdAt?: string | null
          date?: string | null
          id?: string
          type?: string | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Collaboration_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ConnectedAccount: {
        Row: {
          accessToken: string | null
          createdAt: string | null
          id: string
          instagramBusinessId: string | null
          isPrimary: boolean | null
          pageAccessToken: string | null
          pageId: string | null
          platform: Database["public"]["Enums"]["Platform"]
          platformUserId: string
          profileLink: string | null
          refreshToken: string | null
          scopes: string[] | null
          tokenExpiresAt: string | null
          updatedAt: string | null
          userId: string
          username: string | null
        }
        Insert: {
          accessToken?: string | null
          createdAt?: string | null
          id?: string
          instagramBusinessId?: string | null
          isPrimary?: boolean | null
          pageAccessToken?: string | null
          pageId?: string | null
          platform: Database["public"]["Enums"]["Platform"]
          platformUserId: string
          profileLink?: string | null
          refreshToken?: string | null
          scopes?: string[] | null
          tokenExpiresAt?: string | null
          updatedAt?: string | null
          userId: string
          username?: string | null
        }
        Update: {
          accessToken?: string | null
          createdAt?: string | null
          id?: string
          instagramBusinessId?: string | null
          isPrimary?: boolean | null
          pageAccessToken?: string | null
          pageId?: string | null
          platform?: Database["public"]["Enums"]["Platform"]
          platformUserId?: string
          profileLink?: string | null
          refreshToken?: string | null
          scopes?: string[] | null
          tokenExpiresAt?: string | null
          updatedAt?: string | null
          userId?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ConnectedAccount_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      PlatformMetrics: {
        Row: {
          avgViews: number | null
          comments: number | null
          connectedAccountId: string
          createdAt: string | null
          date: string
          engagementRate: number | null
          followers: number | null
          id: string
          impressions: number | null
          likes: number | null
          linkClicks: number | null
          newFollows: number | null
          profileVisits: number | null
          reach: number | null
          saves: number | null
          shares: number | null
          total_comments: number | null
          total_likes: number | null
          total_saves: number | null
          total_shares: number | null
          unfollows: number | null
          videoCount: number | null
        }
        Insert: {
          avgViews?: number | null
          comments?: number | null
          connectedAccountId: string
          createdAt?: string | null
          date: string
          engagementRate?: number | null
          followers?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          linkClicks?: number | null
          newFollows?: number | null
          profileVisits?: number | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          total_comments?: number | null
          total_likes?: number | null
          total_saves?: number | null
          total_shares?: number | null
          unfollows?: number | null
          videoCount?: number | null
        }
        Update: {
          avgViews?: number | null
          comments?: number | null
          connectedAccountId?: string
          createdAt?: string | null
          date?: string
          engagementRate?: number | null
          followers?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          linkClicks?: number | null
          newFollows?: number | null
          profileVisits?: number | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          total_comments?: number | null
          total_likes?: number | null
          total_saves?: number | null
          total_shares?: number | null
          unfollows?: number | null
          videoCount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "PlatformMetrics_connectedAccountId_fkey"
            columns: ["connectedAccountId"]
            isOneToOne: false
            referencedRelation: "ConnectedAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          audienceSummary: string | null
          bio: string | null
          category: string | null
          coverImageUrl: string | null
          createdAt: string
          customUrl: string | null
          email: string
          firstName: string | null
          id: string
          isMediaKitPublic: boolean
          lastName: string | null
          location: string | null
          onboardingCompleted: boolean
          phone: string | null
          profileImageUrl: string | null
          updatedAt: string
          userName: string | null
          website: string | null
        }
        Insert: {
          audienceSummary?: string | null
          bio?: string | null
          category?: string | null
          coverImageUrl?: string | null
          createdAt?: string
          customUrl?: string | null
          email: string
          firstName?: string | null
          id: string
          isMediaKitPublic?: boolean
          lastName?: string | null
          location?: string | null
          onboardingCompleted?: boolean
          phone?: string | null
          profileImageUrl?: string | null
          updatedAt?: string
          userName?: string | null
          website?: string | null
        }
        Update: {
          audienceSummary?: string | null
          bio?: string | null
          category?: string | null
          coverImageUrl?: string | null
          createdAt?: string
          customUrl?: string | null
          email?: string
          firstName?: string | null
          id?: string
          isMediaKitPublic?: boolean
          lastName?: string | null
          location?: string | null
          onboardingCompleted?: boolean
          phone?: string | null
          profileImageUrl?: string | null
          updatedAt?: string
          userName?: string | null
          website?: string | null
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
      Platform: "INSTAGRAM" | "FACEBOOK" | "YOUTUBE" | "TIKTOK"
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
      Platform: ["INSTAGRAM", "FACEBOOK", "YOUTUBE", "TIKTOK"],
    },
  },
} as const
