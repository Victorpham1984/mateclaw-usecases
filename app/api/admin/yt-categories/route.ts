import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import {
  readCategories,
  readDrafts,
  addCategoryViaGitHub,
  updateCategoryViaGitHub,
  mergeCategoryViaGitHub,
} from "@/lib/youtube-data";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-categories - List categories
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let categories = readCategories();

  // Sort by sort_order
  categories.sort((a, b) => a.sort_order - b.sort_order);

  if (status) {
    categories = categories.filter((c) => c.status === status);
  }

  // Count use cases per category
  const drafts = readDrafts();
  const countMap: Record<string, number> = {};
  drafts
    .filter((d) => ["draft", "approved", "published"].includes(d.status))
    .forEach((d) => {
      if (d.category_id) {
        countMap[d.category_id] = (countMap[d.category_id] || 0) + 1;
      }
    });

  const enriched = categories.map((cat) => ({
    ...cat,
    use_case_count: countMap[cat.id] || 0,
  }));

  return NextResponse.json(enriched);
}

// POST /api/admin/yt-categories - Create category (via GitHub API)
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const cat = await addCategoryViaGitHub({
      name: body.name,
      description: body.description,
      icon: body.icon,
      color: body.color,
      status: body.status,
    });

    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error("Failed to add category:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add category" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/yt-categories - Update category (via GitHub API)
export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // If merging into another category
    if (updates.merge_into) {
      await mergeCategoryViaGitHub(id, updates.merge_into);
      return NextResponse.json({ success: true, merged: true });
    }

    const cat = await updateCategoryViaGitHub(id, updates);
    return NextResponse.json(cat);
  } catch (error) {
    console.error("Failed to update category:", error);
    const msg = error instanceof Error ? error.message : "Failed to update category";
    const status = msg.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
