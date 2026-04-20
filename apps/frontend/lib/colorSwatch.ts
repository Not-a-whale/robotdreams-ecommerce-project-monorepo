/** Maps product color keys (same keys as `ProductType.images`) to CSS hex for swatches. */
export const COLOR_SWATCH_HEX: Record<string, string> = {
  black: '#111111',
  navy: '#1e3a5f',
  burgundy: '#800020',
  olive: '#556b2f',
  cream: '#f5f5dc',
  charcoal: '#36454f',
  white: '#ffffff',
  rust: '#b7410e',
  sage: '#9caf88',
  slate: '#708090',
  blush: '#de5d83',
  midnight: '#191970',
};

export function colorKeyToHex(key: string): string {
  return COLOR_SWATCH_HEX[key] ?? '#94a3b8';
}
