import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tags — list all tags grouped
export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { createdAt: "asc" } });

  const grouped = {
    model: tags.filter((t) => t.group === "model"),
    type: tags.filter((t) => t.group === "type"),
    topic: tags.filter((t) => t.group === "topic"),
  };

  return NextResponse.json(grouped);
}

// POST /api/tags — create a new tag
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, label, group } = body;

  if (!id || !label || !group) {
    return NextResponse.json({ error: "Missing id, label, or group" }, { status: 400 });
  }

  if (!["model", "type", "topic"].includes(group)) {
    return NextResponse.json({ error: "Invalid group" }, { status: 400 });
  }

  const existing = await prisma.tag.findUnique({ where: { id } });
  if (existing) {
    return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
  }

  const tag = await prisma.tag.create({ data: { id, label, group } });
  return NextResponse.json(tag, { status: 201 });
}
