import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const [profileRes, coursesRes, statusRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("courses").select("*").eq("is_active", true).order("semester", { ascending: true }),
      supabase.from("course_status").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      profile: profileRes.data,
      courses: coursesRes.data?.map(course => {
        const status = statusRes.data?.find(s => s.course_id === course.id);
        return {
          ...course,
          user_status: status?.status || "planned",
          user_grade: status?.grade || null,
          user_semester_taken: status?.semester_taken || null,
          user_year_taken: status?.year_taken || null,
          user_credits_earned: status?.credits_earned || 0,
          user_notes: status?.notes || null,
        };
      }) || [],
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    return NextResponse.json(exportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courses } = body;

    if (!courses || !Array.isArray(courses)) {
      return NextResponse.json({ error: "Invalid import data" }, { status: 400 });
    }

    // Import course statuses
    const statusUpdates = courses
      .filter((c: any) => c.user_status && c.user_status !== "planned")
      .map((c: any) => ({
        user_id: user.id,
        course_id: c.id,
        status: c.user_status,
        grade: c.user_grade,
        semester_taken: c.user_semester_taken,
        year_taken: c.user_year_taken,
        credits_earned: c.user_credits_earned || 0,
        notes: c.user_notes,
        updated_at: new Date().toISOString(),
      }));

    if (statusUpdates.length > 0) {
      const { error } = await supabase
        .from("course_status")
        .upsert(statusUpdates, { onConflict: "user_id,course_id" });

      if (error) {
        return NextResponse.json({ error: "Failed to import statuses" }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      imported: statusUpdates.length 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}