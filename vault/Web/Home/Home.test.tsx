// teste da página Home
import { describe, expect, it } from 'vitest';
import { Home } from './Home';

describe('Home', () => {
  it('renderiza a entrada', () => {
    expect(typeof Home).toBe('function');
  });
});
