/**
 * Tests for GET /api/prompts and POST /api/prompts
 */

import { GET, POST } from "@/app/api/prompts/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));

const mockPrisma = prisma as unknown as {
  prompt: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

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

describe("GET /api/prompts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns prompts with items and tags in correct shape", async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([MOCK_DB_PROMPT]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);

    const p = data[0];
    expect(p.id).toBe("clx123");
    expect(p.title).toBe("Test Prompt");
    expect(p.note).toBe("A note");
    expect(p.author).toBe("Tester");
    expect(p.createdAt).toBe("2026-03-28");
  });

  it("returns items ordered by position", async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([MOCK_DB_PROMPT]);

    const res = await GET();
    const data = await res.json();

    expect(data[0].items).toHaveLength(2);
    expect(data[0].items[0].header).toBe("Step 1");
    expect(data[0].items[0].position).toBe(0);
    expect(data[0].items[1].header).toBe("Step 2");
    expect(data[0].items[1].position).toBe(1);
  });

  it("flattens tags from join table", async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([MOCK_DB_PROMPT]);

    const res = await GET();
    const data = await res.json();

    expect(data[0].tags).toEqual([
      { id: "gemini", label: "Gemini", group: "model" },
      { id: "text", label: "Văn bản", group: "type" },
    ]);
  });

  it("returns empty array when no prompts exist", async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(data).toEqual([]);
  });

  it("formats createdAt as YYYY-MM-DD string", async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([
      { ...MOCK_DB_PROMPT, createdAt: new Date("2026-01-15T14:30:00Z") },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(data[0].createdAt).toBe("2026-01-15");
  });

  it("handles prompt with no note (null)", async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([
      { ...MOCK_DB_PROMPT, note: null },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(data[0].note).toBeNull();
  });

  it("handles prompt with single item", async () => {
    mockPrisma.prompt.findMany.mockResolvedValue([
      {
        ...MOCK_DB_PROMPT,
        items: [{ id: "i1", header: "Only", content: "Content", position: 0 }],
      },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(data[0].items).toHaveLength(1);
  });
});

describe("POST /api/prompts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a prompt with items and returns 201", async () => {
    const created = {
      ...MOCK_DB_PROMPT,
      title: "New Prompt",
    };
    mockPrisma.prompt.create.mockResolvedValue(created);

    const req = makeRequest({
      title: "New Prompt",
      items: [
        { header: "Step 1", content: "Content 1" },
        { header: "Step 2", content: "Content 2" },
      ],
      author: "Tester",
      tagIds: ["gemini", "text"],
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.title).toBe("New Prompt");
    expect(data.items).toHaveLength(2);
  });

  it("passes correct data to prisma.create", async () => {
    mockPrisma.prompt.create.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makeRequest({
      title: "  Test  ",
      items: [{ header: " H1 ", content: " C1 " }],
      note: "  Note  ",
      author: "  Author  ",
      tagIds: ["gemini"],
    });

    await POST(req);

    expect(mockPrisma.prompt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Test",
          note: "Note",
          author: "Author",
          items: {
            create: [{ header: "H1", content: "C1", position: 0 }],
          },
          tags: {
            create: [{ tagId: "gemini" }],
          },
        }),
      })
    );
  });

  it("returns 400 when title is missing", async () => {
    const req = makeRequest({
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Title/i);
  });

  it("returns 400 when title is empty string", async () => {
    const req = makeRequest({
      title: "   ",
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when items array is empty", async () => {
    const req = makeRequest({
      title: "Test",
      items: [],
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/item/i);
  });

  it("returns 400 when items is not an array", async () => {
    const req = makeRequest({
      title: "Test",
      items: "not an array",
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when items is missing entirely", async () => {
    const req = makeRequest({
      title: "Test",
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when an item has empty header", async () => {
    const req = makeRequest({
      title: "Test",
      items: [{ header: "", content: "Content" }],
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Prompt 1/);
  });

  it("returns 400 when an item has empty content", async () => {
    const req = makeRequest({
      title: "Test",
      items: [{ header: "Header", content: "   " }],
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when second item is invalid", async () => {
    const req = makeRequest({
      title: "Test",
      items: [
        { header: "Good", content: "Good content" },
        { header: "", content: "Bad" },
      ],
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Prompt 2/);
  });

  it("returns 400 when tagIds is empty array", async () => {
    const req = makeRequest({
      title: "Test",
      items: [{ header: "H", content: "C" }],
      tagIds: [],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/tag/i);
  });

  it("returns 400 when tagIds is missing", async () => {
    const req = makeRequest({
      title: "Test",
      items: [{ header: "H", content: "C" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when tagIds is not an array", async () => {
    const req = makeRequest({
      title: "Test",
      items: [{ header: "H", content: "C" }],
      tagIds: "gemini",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("sets author to Anonymous when not provided", async () => {
    mockPrisma.prompt.create.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makeRequest({
      title: "Test",
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini"],
    });

    await POST(req);

    const callData = mockPrisma.prompt.create.mock.calls[0][0].data;
    expect(callData.author).toBe("Anonymous");
  });

  it("sets note to null when not provided", async () => {
    mockPrisma.prompt.create.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makeRequest({
      title: "Test",
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini"],
    });

    await POST(req);

    const callData = mockPrisma.prompt.create.mock.calls[0][0].data;
    expect(callData.note).toBeNull();
  });

  it("assigns correct position to each item", async () => {
    mockPrisma.prompt.create.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makeRequest({
      title: "Test",
      items: [
        { header: "A", content: "1" },
        { header: "B", content: "2" },
        { header: "C", content: "3" },
      ],
      tagIds: ["gemini"],
    });

    await POST(req);

    const items = mockPrisma.prompt.create.mock.calls[0][0].data.items.create;
    expect(items[0].position).toBe(0);
    expect(items[1].position).toBe(1);
    expect(items[2].position).toBe(2);
  });

  it("trims whitespace from all fields", async () => {
    mockPrisma.prompt.create.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makeRequest({
      title: "  Spaced Title  ",
      items: [{ header: "  H  ", content: "  C  " }],
      note: "  Note  ",
      author: "  Auth  ",
      tagIds: ["gemini"],
    });

    await POST(req);

    const callData = mockPrisma.prompt.create.mock.calls[0][0].data;
    expect(callData.title).toBe("Spaced Title");
    expect(callData.note).toBe("Note");
    expect(callData.author).toBe("Auth");
    expect(callData.items.create[0].header).toBe("H");
    expect(callData.items.create[0].content).toBe("C");
  });

  it("handles prompt with many items", async () => {
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      header: `H${i}`,
      content: `C${i}`,
    }));

    mockPrisma.prompt.create.mockResolvedValue({
      ...MOCK_DB_PROMPT,
      items: manyItems.map((item, i) => ({ id: `id${i}`, ...item, position: i })),
    });

    const req = makeRequest({
      title: "Many Items",
      items: manyItems,
      tagIds: ["gemini"],
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const createItems = mockPrisma.prompt.create.mock.calls[0][0].data.items.create;
    expect(createItems).toHaveLength(20);
  });

  it("handles multiple tagIds", async () => {
    mockPrisma.prompt.create.mockResolvedValue(MOCK_DB_PROMPT);

    const req = makeRequest({
      title: "Test",
      items: [{ header: "H", content: "C" }],
      tagIds: ["gemini", "claude", "text", "marketing"],
    });

    await POST(req);

    const tags = mockPrisma.prompt.create.mock.calls[0][0].data.tags.create;
    expect(tags).toHaveLength(4);
    expect(tags.map((t: { tagId: string }) => t.tagId)).toEqual([
      "gemini",
      "claude",
      "text",
      "marketing",
    ]);
  });
});
