import { describe, expect, test } from 'vitest';

import { TextRenderer } from '@/index';
import aribInitialState from '@/lib/parser/state/ARIB';
import { ARIBB24CharacterToken, ARIBB24ClearScreenToken } from '@/lib/tokenizer/token';

describe('ARIB B24 TextRenderer', () => {
  test('exposes the rendered text and clears it with the cue', () => {
    const renderer = new TextRenderer();
    const info = { association: 'ARIB' as const, language: 'jpn' };

    expect(renderer.getText()).toBeNull();
    renderer.render(aribInitialState, [ARIBB24ClearScreenToken.from(), ARIBB24CharacterToken.from('字')], info);
    expect(renderer.getText()).toBe('字');

    renderer.clear();
    expect(renderer.getText()).toBeNull();
    renderer.destroy();
  });

  test('starts text extraction when the first statement has no ClearScreen', () => {
    const renderer = new TextRenderer();
    const info = { association: 'ARIB' as const, language: 'jpn' };

    renderer.render(aribInitialState, [ARIBB24CharacterToken.from('あ')], info);
    renderer.render(aribInitialState, [ARIBB24CharacterToken.from('い')], info);
    expect(renderer.getText()).toBe('あい');
    renderer.destroy();
  });
});
