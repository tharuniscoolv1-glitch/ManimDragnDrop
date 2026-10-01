export function formatColor(color: string): string {
  if (!color) return '"#FFFFFF"';
  const trimmed = color.trim();
  // If it's a known Manim color name like BLUE, RED, YELLOW, etc.
  const manimColorNames = [
    'WHITE', 'BLACK', 'GRAY', 'GREY', 'RED', 'BLUE', 'GREEN', 'YELLOW',
    'ORANGE', 'PURPLE', 'PINK', 'TEAL', 'GOLD', 'MAROON', 'DARK_BLUE',
    'LIGHT_PINK', 'LIGHT_GRAY', 'DARK_GRAY'
  ];
  if (manimColorNames.includes(trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  // If it starts with # or is hex string
  if (trimmed.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    return `"${hex}"`;
  }
  return `"${trimmed}"`;
}

export function formatVector3(vec: [number, number, number] | string): string {
  if (Array.isArray(vec)) {
    return `np.array([${vec[0]}, ${vec[1]}, ${vec[2]}])`;
  }
  if (typeof vec === 'string') {
    const parts = vec.split(',').map((s) => parseFloat(s.trim()) || 0);
    return `np.array([${parts[0] || 0}, ${parts[1] || 0}, ${parts[2] || 0}])`;
  }
  return 'ORIGIN';
}

export function formatDirection(dir: string): string {
  const map: Record<string, string> = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UL: 'UL',
    UR: 'UR',
    DL: 'DL',
    DR: 'DR',
    ORIGIN: 'ORIGIN'
  };
  return map[dir] || 'RIGHT';
}
