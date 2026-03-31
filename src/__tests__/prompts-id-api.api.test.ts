/**
 * Tests for GET /api/prompts/[id], PUT /api/prompts/[id], DELETE /api/prompts/[id]
 */

import { GET, PUT, DELETE } from "@/app/api/prompts/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));

const mockPrisma = prisma as unknown as {
  prompt: {
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  promptItem: { deleteMany: jest.Mock };
  promptTag: { deleteMany: jest.Mock };
  $transaction: jest.Mock;
};

const MOCK_DB_PROMPT = {
  id: "clx123",
  title: "Test Prompt",
  note: "A note",
  author: "Tester",
  createdAt: new Date("2026-03-28T00:00:00Z"),
  items: [
    { id: "item1", header: "Step 1", content: "Do thing 1", position: 0 },
    { id: "item2", header: "Step 2", content: "Do thing 2", position: 1 },
  ],
  tags: [
    { tag: { id: "gemini", label: "Gemini", group: "model" } },
    { tag: { id: "text", label: "Văn bản", group: "type" } },
  ],
};

function makeParams(id: string) {
  return { params: { id } };
}

function makePutRequest(id: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/prompts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── GET ───

describe("GET /api/prompts/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a single prompt with items and tags", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue(MOCK_DB_PROMPT);

    const req = new NextRequest("http://localhost:3000/api/prompts/clx123");
    const res = await GET(req, makeParams("clx123"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("clx123");
    expect(data.title).toBe("Test Prompt");
    expect(data.items).toHaveLength(2);
    expect(data.tags).toHaveLength(2);
    expect(data.createdAt).toBe("2026-03-28");
  });

  it("returns 404 when prompt does not exist", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/prompts/nonexistent");
    const res = await GET(req, makeParams("nonexistent"));

    expect(res.status).toBe(404);
  });
});

// ─── PUT ───

describe("PUT /api/prompts/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // $transaction executes the callback with prisma
    mockPrisma.$transaction.mockImplementation(async (fn: Function) => fn(mockPrisma));
  });

  it("updates a prompt and returns 200", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123", author: "Old" });
    mockPrisma.promptItem.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.promptTag.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.prompt.update.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makePutRequest("clx123", {
      title: "Updated",
      items: [{ header: "New H", content: "New C" }],
      tagIds: ["gemini"],
    });
    const res = await PUT(req, makeParams("clx123"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("clx123");
    expect(mockPrisma.promptItem.deleteMany).toHaveBeenCalledWith({ where: { promptId: "clx123" } });
    expect(mockPrisma.promptTag.deleteMany).toHaveBeenCalledWith({ where: { promptId: "clx123" } });
  });

  it("returns 404 when prompt does not exist", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue(null);

    const req = makePutRequest("nope", {
      title: "X",
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini"],
    });
    const res = await PUT(req, makeParams("nope"));

    expect(res.status).toBe(404);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns 400 when title is empty", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123" });

    const req = makePutRequest("clx123", {
      title: "   ",
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini"],
    });
    const res = await PUT(req, makeParams("clx123"));

    expect(res.status).toBe(400);
  });

  it("returns 400 when items is empty", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123" });

    const req = makePutRequest("clx123", {
      title: "T",
      items: [],
      tagIds: ["gemini"],
    });
    const res = await PUT(req, makeParams("clx123"));

    expect(res.status).toBe(400);
  });

  it("returns 400 when an item header is empty", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123" });

    const req = makePutRequest("clx123", {
      title: "T",
      items: [{ header: "", content: "C" }],
      tagIds: ["gemini"],
    });
    const res = await PUT(req, makeParams("clx123"));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Prompt 1/);
  });

  it("returns 400 when tagIds is empty", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123" });

    const req = makePutRequest("clx123", {
      title: "T",
      items: [{ header: "H", content: "C" }],
      tagIds: [],
    });
    const res = await PUT(req, makeParams("clx123"));

    expect(res.status).toBe(400);
  });

  it("trims whitespace from fields", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123", author: "Old" });
    mockPrisma.promptItem.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.promptTag.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.prompt.update.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makePutRequest("clx123", {
      title: "  Trimmed  ",
      items: [{ header: "  H  ", content: "  C  " }],
      note: "  N  ",
      author: "  A  ",
      tagIds: ["gemini"],
    });
    await PUT(req, makeParams("clx123"));

    const updateData = mockPrisma.prompt.update.mock.calls[0][0].data;
    expect(updateData.title).toBe("Trimmed");
    expect(updateData.note).toBe("N");
    expect(updateData.author).toBe("A");
    expect(updateData.items.create[0].header).toBe("H");
    expect(updateData.items.create[0].content).toBe("C");
  });

  it("preserves existing author when not provided", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123", author: "OriginalAuthor" });
    mockPrisma.promptItem.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.promptTag.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.prompt.update.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makePutRequest("clx123", {
      title: "T",
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini"],
    });
    await PUT(req, makeParams("clx123"));

    const updateData = mockPrisma.prompt.update.mock.calls[0][0].data;
    expect(updateData.author).toBe("OriginalAuthor");
  });

  it("assigns positions to items in order", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123", author: "A" });
    mockPrisma.promptItem.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.promptTag.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.prompt.update.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makePutRequest("clx123", {
      title: "T",
      items: [
        { header: "A", content: "1" },
        { header: "B", content: "2" },
        { header: "C", content: "3" },
      ],
      tagIds: ["gemini"],
    });
    await PUT(req, makeParams("clx123"));

    const items = mockPrisma.prompt.update.mock.calls[0][0].data.items.create;
    expect(items[0].position).toBe(0);
    expect(items[1].position).toBe(1);
    expect(items[2].position).toBe(2);
  });
});

// ─── DELETE ───

describe("DELETE /api/prompts/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes existing prompt", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "clx123" });
    mockPrisma.prompt.delete.mockResolvedValue({ id: "clx123" });

    const req = new NextRequest("http://localhost:3000/api/prompts/clx123", { method: "DELETE" });
    const res = await DELETE(req, makeParams("clx123"));

    expect(res.status).toBe(200);
    expect(mockPrisma.prompt.delete).toHaveBeenCalledWith({ where: { id: "clx123" } });
  });

  it("returns 404 when not found", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/prompts/x", { method: "DELETE" });
    const res = await DELETE(req, makeParams("x"));

    expect(res.status).toBe(404);
    expect(mockPrisma.prompt.delete).not.toHaveBeenCalled();
  });
});
