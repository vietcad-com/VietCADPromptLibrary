import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/prompts — list all prompts with items and tags
export async function GET() {
  const prompts = await prisma.prompt.findMany({
    include: {
      items: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = prompts.map((p) => ({
    id: p.id,
    title: p.title,
    items: p.items.map((item) => ({
      id: item.id,
      header: item.header,
      content: item.content,
      position: item.position,
    })),
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

// POST /api/prompts — create a new prompt with items
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, items, note, author, tagIds } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "At least one prompt item is required" }, { status: 400 });
  }

  for (let i = 0; i < items.length; i++) {
    if (!items[i].header?.trim() || !items[i].content?.trim()) {
      return NextResponse.json(
        { error: `Prompt ${i + 1}: header and content are required` },
        { status: 400 }
      );
    }
  }

  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
  }

  const prompt = await prisma.prompt.create({
    data: {
      title: title.trim(),
      note: note?.trim() || null,
      author: author?.trim() || "Anonymous",
      items: {
        create: items.map((item: { header: string; content: string }, idx: number) => ({
          header: item.header.trim(),
          content: item.content.trim(),
          position: idx,
        })),
      },
      tags: {
        create: tagIds.map((tagId: string) => ({ tagId })),
      },
    },
    include: {
      items: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(
    {
      id: prompt.id,
      title: prompt.title,
      items: prompt.items.map((item) => ({
        id: item.id,
        header: item.header,
        content: item.content,
        position: item.position,
      })),
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
