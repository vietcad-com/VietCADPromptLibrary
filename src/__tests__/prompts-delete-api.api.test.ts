/**
 * Tests for DELETE /api/prompts/[id]
 */

import { DELETE } from "@/app/api/prompts/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));

const mockPrisma = prisma as unknown as {
  prompt: {
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
};

function makeDeleteRequest(id: string): [NextRequest, { params: { id: string } }] {
  const req = new NextRequest(`http://localhost:3000/api/prompts/${id}`, {
    method: "DELETE",
  });
  return [req, { params: { id } }];
}

describe("DELETE /api/prompts/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes an existing prompt and returns success", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: "abc123", title: "Test" });
    mockPrisma.prompt.delete.mockResolvedValue({ id: "abc123" });

    const [req, params] = makeDeleteRequest("abc123");
    const res = await DELETE(req, params);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.prompt.delete).toHaveBeenCalledWith({ where: { id: "abc123" } });
  });

  it("returns 404 when prompt does not exist", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue(null);

    const [req, params] = makeDeleteRequest("nonexistent");
    const res = await DELETE(req, params);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
    expect(mockPrisma.prompt.delete).not.toHaveBeenCalled();
  });

  it("passes correct id to findUnique", async () => {
    mockPrisma.prompt.findUnique.mockResolvedValue(null);

    const [req, params] = makeDeleteRequest("my-prompt-id");
    await DELETE(req, params);

    expect(mockPrisma.prompt.findUnique).toHaveBeenCalledWith({
      where: { id: "my-prompt-id" },
    });
  });

  it("handles special characters in id", async () => {
    const weirdId = "clx_abc-123.xyz";
    mockPrisma.prompt.findUnique.mockResolvedValue({ id: weirdId });
    mockPrisma.prompt.delete.mockResolvedValue({ id: weirdId });

    const [req, params] = makeDeleteRequest(weirdId);
    const res = await DELETE(req, params);

    expect(res.status).toBe(200);
    expect(mockPrisma.prompt.delete).toHaveBeenCalledWith({ where: { id: weirdId } });
  });
});
