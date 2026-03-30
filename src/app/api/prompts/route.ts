import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/prompts — list all prompts with tags
export async function GET() {
  const prompts = await prisma.prompt.findMany({
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });

  const result = prompts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    note: p.note,
    author: p.author,
    createdAt: p.createdAt.toISOString().slice(0, 10),
    tags: p.tags.map((pt) => ({
      id: pt.tag.id,
      label: pt.tag.label,
      group: pt.tag.group,
    })),
  }));

  return NextResponse.json(result);
}

// POST /api/prompts — create a new prompt
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, note, author, tagIds } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
  }

  const prompt = await prisma.prompt.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      note: note?.trim() || null,
      author: author?.trim() || "Anonymous",
      tags: {
        create: tagIds.map((tagId: string) => ({ tagId })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json(
    {
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      note: prompt.note,
      author: prompt.author,
      createdAt: prompt.createdAt.toISOString().slice(0, 10),
      tags: prompt.tags.map((pt) => ({
        id: pt.tag.id,
        label: pt.tag.label,
        group: pt.tag.group,
      })),
    },
    { status: 201 }
  );
}
