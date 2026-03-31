import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
