import { NextResponse } from "next/server";
import * as roadmapRepo from "@/lib/db/repositories/roadmap-repository";

/**
 * GET /api/roadmaps
 * Returns all available roadmaps (static data, no user progress)
 * This data is cacheable
 */
export async function GET() {
  const roadmaps = await roadmapRepo.findAllRoadmaps();

  return NextResponse.json(
    { roadmaps },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}

// Allow caching - roadmap list is static
export const revalidate = 3600;
