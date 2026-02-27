import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import {
  readCategories,
  addCategory,
  updateCategory,
  writeCategories,
  readDrafts,
  writeDrafts,
  commitSingleFile,
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

// POST /api/admin/yt-categories - Create category
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  const cat = addCategory({
    name: body.name,
    description: body.description,
    icon: body.icon,
    color: body.color,
    status: body.status,
  });

  // Commit to GitHub
  await commitSingleFile(
    "youtube-categories.json",
    `[YouTube Pipeline] Add category: ${cat.name}`
  );

  return NextResponse.json(cat, { status: 201 });
}

// PATCH /api/admin/yt-categories - Update category
export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // If merging into another category
  if (updates.merge_into) {
    const drafts = readDrafts();
    const updated = drafts.map((d) =>
      d.category_id === id ? { ...d, category_id: updates.merge_into } : d
    );
    writeDrafts(updated);

    updateCategory(id, { status: "archived" as any });

    // Commit both files
    await commitSingleFile("youtube-drafts.json", `[YouTube Pipeline] Merge category ${id} → ${updates.merge_into}`);
    await commitSingleFile("youtube-categories.json", `[YouTube Pipeline] Archive merged category ${id}`);

    return NextResponse.json({ success: true, merged: true });
  }

  const cat = updateCategory(id, updates);
  if (!cat) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // Commit to GitHub
  await commitSingleFile(
    "youtube-categories.json",
    `[YouTube Pipeline] Update category: ${cat.name}`
  );

  return NextResponse.json(cat);
}
