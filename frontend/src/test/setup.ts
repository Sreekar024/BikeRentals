import { afterEach, vi } from 'vitest';

// Mock setup for tests
(globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});