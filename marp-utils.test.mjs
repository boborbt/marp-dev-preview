import { initializeMarp, renderMarp } from './marp-utils.mjs';
import { Marp } from '@marp-team/marp-core';

jest.mock('@marp-team/marp-core', () => ({
  Marp: jest.fn(() => ({
    use: jest.fn(() => ({
      use: jest.fn(() => ({
        use: jest.fn(),
      })),
    })),
    render: jest.fn(() => ({ html: '', css: '' })),
    themeSet: {
      add: jest.fn(),
    },
  })),
}));

describe('Marp Utils', () => {
  it('should initialize Marp', async () => {
    const marp = await initializeMarp();
    expect(Marp).toHaveBeenCalled();
  });
});
