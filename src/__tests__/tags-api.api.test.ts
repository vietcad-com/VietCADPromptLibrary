/**
 * Tests for GET /api/tags and POST /api/tags
 */

import { GET, POST } from "@/app/api/tags/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));

const mockPrisma = prisma as unknown as {
  tag: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/tags", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns tags grouped by model, type, topic", async () => {
    mockPrisma.tag.findMany.mockResolvedValue([
      { id: "gemini", label: "Gemini", group: "model", createdAt: new Date() },
      { id: "image", label: "Hình ảnh", group: "type", createdAt: new Date() },
      { id: "tech", label: "Tech", group: "topic", createdAt: new Date() },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.model).toHaveLength(1);
    expect(data.model[0].id).toBe("gemini");
    expect(data.type).toHaveLength(1);
    expect(data.type[0].id).toBe("image");
    expect(data.topic).toHaveLength(1);
    expect(data.topic[0].id).toBe("tech");
  });

  it("returns empty groups when no tags exist", async () => {
    mockPrisma.tag.findMany.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(data.model).toEqual([]);
    expect(data.type).toEqual([]);
    expect(data.topic).toEqual([]);
  });

  it("correctly separates multiple tags per group", async () => {
    mockPrisma.tag.findMany.mockResolvedValue([
      { id: "gemini", label: "Gemini", group: "model", createdAt: new Date() },
      { id: "claude", label: "Claude", group: "model", createdAt: new Date() },
      { id: "chatgpt", label: "ChatGPT", group: "model", createdAt: new Date() },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(data.model).toHaveLength(3);
    expect(data.type).toHaveLength(0);
    expect(data.topic).toHaveLength(0);
  });
});

describe("POST /api/tags", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a valid tag and returns 201", async () => {
    mockPrisma.tag.findUnique.mockResolvedValue(null);
    mockPrisma.tag.create.mockResolvedValue({
      id: "copilot",
      label: "Copilot",
      group: "model",
    });

    const req = makeRequest({ id: "copilot", label: "Copilot", group: "model" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.id).toBe("copilot");
    expect(data.label).toBe("Copilot");
    expect(mockPrisma.tag.create).toHaveBeenCalledWith({
      data: { id: "copilot", label: "Copilot", group: "model" },
    });
  });

  it("returns 400 when id is missing", async () => {
    const req = makeRequest({ label: "Copilot", group: "model" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Missing/);
  });

  it("returns 400 when label is missing", async () => {
    const req = makeRequest({ id: "copilot", group: "model" });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 when group is missing", async () => {
    const req = makeRequest({ id: "copilot", label: "Copilot" });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid group value", async () => {
    const req = makeRequest({ id: "x", label: "X", group: "invalid" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid group/);
  });

  it("returns 409 when tag already exists", async () => {
    mockPrisma.tag.findUnique.mockResolvedValue({
      id: "gemini",
      label: "Gemini",
      group: "model",
    });

    const req = makeRequest({ id: "gemini", label: "Gemini", group: "model" });
    const res = await POST(req);

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/already exists/);
    expect(mockPrisma.tag.create).not.toHaveBeenCalled();
  });

  it("accepts all three valid group values", async () => {
    mockPrisma.tag.findUnique.mockResolvedValue(null);

    for (const group of ["model", "type", "topic"]) {
      mockPrisma.tag.create.mockResolvedValue({ id: "x", label: "X", group });

      const req = makeRequest({ id: "x", label: "X", group });
      const res = await POST(req);

      expect(res.status).toBe(201);
    }
  });

  it("returns 400 when body is empty object", async () => {
    const req = makeRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
