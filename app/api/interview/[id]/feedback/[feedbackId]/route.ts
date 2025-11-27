import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/get-user";
import { feedbackRepository } from "@/lib/db/repositories/feedback-repository";
import { interviewRepository } from "@/lib/db/repositories/interview-repository";
import { userRepository } from "@/lib/db/repositories/user-repository";

/**
 * DELETE /api/interview/[id]/feedback/[feedbackId]
 * Delete a feedback entry
 * Requirements: 1.5
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  const { id: interviewId, feedbackId } = await params;

  try {
    // Get authenticated user
    const clerkId = await getAuthUserId();
    const user = await userRepository.findByClerkId(clerkId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Verify interview exists
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Get feedback entry
    const feedbackEntry = await feedbackRepository.findById(feedbackId);
    if (!feedbackEntry) {
      return NextResponse.json(
        { error: "Feedback entry not found" },
        { status: 404 }
      );
    }

    // Verify the feedback belongs to this interview
    if (feedbackEntry.interviewId !== interviewId) {
      return NextResponse.json(
        { error: "Feedback entry does not belong to this interview" },
        { status: 400 }
      );
    }

    // Verify ownership
    if (feedbackEntry.userId !== user._id) {
      return NextResponse.json(
        { error: "Not authorized to delete this feedback entry" },
        { status: 403 }
      );
    }

    // Delete the feedback entry
    await feedbackRepository.delete(feedbackId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete feedback error:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback entry" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interview/[id]/feedback/[feedbackId]
 * Get a single feedback entry by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  const { id: interviewId, feedbackId } = await params;

  try {
    // Get authenticated user
    const clerkId = await getAuthUserId();
    const user = await userRepository.findByClerkId(clerkId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Verify interview exists
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Get feedback entry
    const feedbackEntry = await feedbackRepository.findById(feedbackId);
    if (!feedbackEntry) {
      return NextResponse.json(
        { error: "Feedback entry not found" },
        { status: 404 }
      );
    }

    // Verify the feedback belongs to this interview
    if (feedbackEntry.interviewId !== interviewId) {
      return NextResponse.json(
        { error: "Feedback entry does not belong to this interview" },
        { status: 400 }
      );
    }

    // Verify access (owner or public interview)
    if (feedbackEntry.userId !== user._id && !interview.isPublic) {
      return NextResponse.json(
        { error: "Not authorized to view this feedback entry" },
        { status: 403 }
      );
    }

    return NextResponse.json(feedbackEntry);
  } catch (error) {
    console.error("Get feedback error:", error);
    return NextResponse.json(
      { error: "Failed to get feedback entry" },
      { status: 500 }
    );
  }
}
