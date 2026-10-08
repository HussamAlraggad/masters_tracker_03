import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const HU_COURSES_URL = "https://hu.edu.jo/en/facnew/dept/courses.aspx?prgm=5003&deptid=67020000";

const DEFAULT_SEMESTER_MAP: Record<string, number> = {
  '121003723': 1, // Advanced Software Engineering
  '121003732': 1, // Software Design and Architecture
  '121003751': 1, // SE Tools and Methods
  '121003763': 1, // Requirements Engineering
  '121003740': 2, // Software Quality Engineering
  '121003710': 2, // Software Testing
  '121003736': 2, // Software Project Management
  '121003724': 2, // Distributed Software Development
  '121003752': 3, // Advanced Software Process
  '121003714': 3, // Software Maintenance and Evolution
  '121003721': 3, // Mobile Applications Development
  '121003795': 3, // Selected Topics in SE
  '121003798': 4, // Research Project
  '121003790': 4, // Comprehensive Exam
  '1003799': 4,   // Thesis
  '31003799': 4,  // Thesis (3cr)
  '61003799': 4,  // Thesis (6cr)
  '91003799': 4,  // Thesis (9cr)
};

const CLASSIFICATION_MAP: Record<string, string> = {
  'MASTER': 'CORE',
  'THESIS': 'THESIS',
  'EXAM': 'EXAM',
};

async function scrapeHUCourses(): Promise<Array<{
  courseCode: string;
  courseName: string;
  active: boolean;
  classification: string;
}>> {
  // Dynamic import to avoid issues with Playwright in serverless
  const { chromium } = await import("playwright");
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(HU_COURSES_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    const courses = await page.evaluate(() => {
      const table = document.querySelector('#ctl00_ContentPlaceHolder1_GridView1');
      if (!table) return [];
      
      const rows = table.querySelectorAll('tbody tr');
      return Array.from(rows).slice(1).map(row => { // Skip header
        const cells = row.querySelectorAll('td');
        if (cells.length < 4) return null;
        
        const code = cells[0].textContent?.trim() || '';
        const nameLink = cells[1].querySelector('a');
        const name = nameLink?.textContent?.trim() || cells[1].textContent?.trim() || '';
        const active = cells[2].textContent?.trim() === 'YES';
        const classification = cells[3].textContent?.trim() || '';
        
        return { courseCode: code, courseName: name, active, classification };
      }).filter(Boolean);
    });
    
    return courses as Array<{ courseCode: string; courseName: string; active: boolean; classification: string }>;
  } finally {
    await browser.close();
  }
}

export async function POST() {
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

    // Check if user is admin (for now, allow any authenticated user)
    // In production, you'd check for admin role

    // Scrape courses
    const scrapedCourses = await scrapeHUCourses();
    
    if (scrapedCourses.length === 0) {
      return NextResponse.json({ error: "No courses found" }, { status: 500 });
    }

    // Prepare courses for upsert
    const coursesToUpsert = scrapedCourses
      .filter(c => c.active)
      .map(course => ({
        course_code: course.courseCode,
        course_name: course.courseName,
        course_name_ar: null, // Would need Arabic scraping
        credits: 3, // Default for HU master's
        semester: DEFAULT_SEMESTER_MAP[course.courseCode] || null,
        classification: CLASSIFICATION_MAP[course.classification] || 'ELECTIVE',
        prerequisites: [], // Would need detail page scraping
        description: null,
        source_url: HU_COURSES_URL,
        is_active: true,
      }));

    // Upsert courses
    const { error: upsertError } = await supabase
      .from("courses")
      .upsert(coursesToUpsert, { onConflict: "course_code" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to save courses" }, { status: 500 });
    }

    // Update scrape log
    await supabase
      .from("scraped_sources")
      .upsert({
        source_url: HU_COURSES_URL,
        program_id: "5003",
        department_id: "67020000",
        last_scraped: new Date().toISOString(),
        scrape_status: "success",
        selector_config: {
          table: '#ctl00_ContentPlaceHolder1_GridView1',
          row: 'tbody tr:not(:first-child)',
          code: 'td:nth-child(1)',
          name: 'td:nth-child(2) a',
          active: 'td:nth-child(3)',
          classification: 'td:nth-child(4)',
        },
      }, { onConflict: "source_url" });

    return NextResponse.json({ 
      success: true, 
      count: coursesToUpsert.length,
      message: `Successfully scraped and saved ${coursesToUpsert.length} courses`
    });
  } catch (error: any) {
    console.error("Scraping error:", error);
    
    // Log failed scrape
    await supabase
      .from("scraped_sources")
      .upsert({
        source_url: HU_COURSES_URL,
        program_id: "5003",
        department_id: "67020000",
        last_scraped: new Date().toISOString(),
        scrape_status: "failed",
        error_message: error.message,
      }, { onConflict: "source_url" });

    return NextResponse.json({ error: error.message || "Scraping failed" }, { status: 500 });
  }
}