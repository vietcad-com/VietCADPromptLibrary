import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/prompts/[id] — fetch single prompt
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      items: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  return NextResponse.json({
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
  });
}

// PUT /api/prompts/[id] — update prompt
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const { title, items, note, author, tagIds } = body;

  const existing = await prisma.prompt.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

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

  // Delete old items and tags, then recreate
  const updated = await prisma.$transaction(async (tx) => {
    await tx.promptItem.deleteMany({ where: { promptId: id } });
    await tx.promptTag.deleteMany({ where: { promptId: id } });

    return tx.prompt.update({
      where: { id },
      data: {
        title: title.trim(),
        note: note?.trim() || null,
        author: author?.trim() || existing.author,
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
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    items: updated.items.map((item) => ({
      id: item.id,
      header: item.header,
      content: item.content,
      position: item.position,
    })),
    note: updated.note,
    author: updated.author,
    createdAt: updated.createdAt.toISOString().slice(0, 10),
    tags: updated.tags.map((pt) => ({
      id: pt.tag.id,
      label: pt.tag.label,
      group: pt.tag.group,
    })),
  });
}

// DELETE /api/prompts/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const existing = await prisma.prompt.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  await prisma.prompt.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
