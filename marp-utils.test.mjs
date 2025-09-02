import { initializeMarp, renderMarp } from './marp-utils.mjs';
import { Marp } from '@marp-team/marp-core';

jest.mock('@marp-team/marp-core', () => ({
  Marp: jest.fn(() => ({
    use: jest.fn().mockReturnThis(),
    render: jest.fn(() => ({ html: '', css: '' })),
    themeSet: {
      add: jest.fn(),
    },
  })),
}));

describe('Marp Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Marp', async () => {
    await initializeMarp();
    expect(Marp).toHaveBeenCalled();
  });

  it('should render markdown', async () => {
    const marp = await initializeMarp();
    renderMarp('# Hello');
    expect(marp.render).toHaveBeenCalledWith('# Hello');
  });
});
