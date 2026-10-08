export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          university: string | null;
          faculty: string | null;
          department: string | null;
          major: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          university?: string | null;
          faculty?: string | null;
          department?: string | null;
          major?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          university?: string | null;
          faculty?: string | null;
          department?: string | null;
          major?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          course_code: string;
          course_name: string;
          course_name_ar: string | null;
          credits: number;
          semester: number | null;
          classification: string | null;
          prerequisites: string[] | null;
          description: string | null;
          source_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_code: string;
          course_name: string;
          course_name_ar?: string | null;
          credits?: number;
          semester?: number | null;
          classification?: string | null;
          prerequisites?: string[] | null;
          description?: string | null;
          source_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_code?: string;
          course_name?: string;
          course_name_ar?: string | null;
          credits?: number;
          semester?: number | null;
          classification?: string | null;
          prerequisites?: string[] | null;
          description?: string | null;
          source_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      course_status: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: "planned" | "in_progress" | "completed" | "dropped" | "failed" | "exempted";
          grade: string | null;
          semester_taken: number | null;
          year_taken: number | null;
          credits_earned: number;
          notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: "planned" | "in_progress" | "completed" | "dropped" | "failed" | "exempted";
          grade?: string | null;
          semester_taken?: number | null;
          year_taken?: number | null;
          credits_earned?: number;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          status?: "planned" | "in_progress" | "completed" | "dropped" | "failed" | "exempted";
          grade?: string | null;
          semester_taken?: number | null;
          year_taken?: number | null;
          credits_earned?: number;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_status_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_status_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      scraped_sources: {
        Row: {
          id: string;
          source_url: string;
          program_id: string | null;
          department_id: string | null;
          selector_config: Json | null;
          last_scraped: string | null;
          scrape_status: "success" | "failed" | "pending";
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_url: string;
          program_id?: string | null;
          department_id?: string | null;
          selector_config?: Json | null;
          last_scraped?: string | null;
          scrape_status?: "success" | "failed" | "pending";
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_url?: string;
          program_id?: string | null;
          department_id?: string | null;
          selector_config?: Json | null;
          last_scraped?: string | null;
          scrape_status?: "success" | "failed" | "pending";
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      course_status_enum: "planned" | "in_progress" | "completed" | "dropped" | "failed" | "exempted";
      scrape_status_enum: "success" | "failed" | "pending";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type CourseStatus = Database["public"]["Tables"]["course_status"]["Row"]["status"];
export type ScrapeStatus = Database["public"]["Tables"]["scraped_sources"]["Row"]["scrape_status"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type CourseStatusRow = Database["public"]["Tables"]["course_status"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ScrapedSource = Database["public"]["Tables"]["scraped_sources"]["Row"];

export interface CourseWithStatus extends Course {
  status?: CourseStatusRow;
  user_status?: CourseStatus;
  user_grade?: string | null;
  user_semester_taken?: number | null;
  user_year_taken?: number | null;
  user_notes?: string | null;
}

export interface SemesterCourses {
  semester: number;
  courses: CourseWithStatus[];
  totalCredits: number;
  completedCredits: number;
  inProgressCredits: number;
  plannedCredits: number;
}

export interface UserStats {
  totalCredits: number;
  completedCredits: number;
  inProgressCredits: number;
  plannedCredits: number;
  gpa: number;
  currentSemester: number;
  completionPercentage: number;
}