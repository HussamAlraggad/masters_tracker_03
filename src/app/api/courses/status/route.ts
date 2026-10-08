import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
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
    const { courseId, status, grade, semesterTaken, yearTaken, notes } = body;

    if (!courseId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validStatuses = ["planned", "in_progress", "completed", "dropped", "failed", "exempted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, credits")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const updates: any = {
      user_id: user.id,
      course_id: courseId,
      status,
      updated_at: new Date().toISOString(),
    };

    if (grade) updates.grade = grade;
    if (semesterTaken) updates.semester_taken = semesterTaken;
    if (yearTaken) updates.year_taken = yearTaken;
    if (notes !== undefined) updates.notes = notes;

    if (status === "completed") {
      updates.credits_earned = course.credits;
      updates.completed_at = new Date().toISOString().split("T")[0];
    } else {
      updates.credits_earned = 0;
      updates.completed_at = null;
    }

    if (status === "in_progress") {
      updates.started_at = new Date().toISOString().split("T")[0];
    } else if (status !== "completed") {
      updates.started_at = null;
    }

    const { data, error } = await supabase
      .from("course_status")
      .upsert(updates, { onConflict: "user_id,course_id" })
      .select()
      .single();

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    let query = supabase
      .from("course_status")
      .select("*")
      .eq("user_id", user.id);

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}