// Mock PrismaClient for testing
export const prisma = {
  tag: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn(),
  },
  prompt: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  promptItem: {
    findMany: jest.fn(),
  },
};
