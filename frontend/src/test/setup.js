import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});