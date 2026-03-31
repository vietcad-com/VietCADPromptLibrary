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
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  promptItem: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  promptTag: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};
