import { NextRequest, NextResponse } from "next/server";
import * as roadmapRepo from "@/lib/db/repositories/roadmap-repository";

/**
 * GET /api/roadmaps/[slug]
 * Returns static roadmap data (nodes, edges, milestones, topics, objectives)
 * This data is cacheable as it doesn't include user-specific progress
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const roadmap = await roadmapRepo.findRoadmapBySlug(slug);

  if (!roadmap) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
  }

  // Fetch sub-roadmaps and parent roadmap for navigation
  const [subRoadmaps, parentRoadmap] = await Promise.all([
    roadmapRepo.findSubRoadmaps(slug),
    roadmap.parentRoadmapSlug
      ? roadmapRepo.findRoadmapBySlug(roadmap.parentRoadmapSlug)
      : Promise.resolve(null),
  ]);

  return NextResponse.json(
    {
      roadmap,
      subRoadmaps,
      parentRoadmap,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}

// Allow caching - roadmap structure is static
export const revalidate = 3600;
