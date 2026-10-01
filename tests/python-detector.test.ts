import { describe, it, expect } from 'vitest';
import { detectPythonEnvironment } from '../src/main/python-detector';

describe('Python Environment Detector', () => {
  it('detects Python 3.14 and Manim Community correctly', async () => {
    const info = await detectPythonEnvironment();
    console.log('Detected Python Info:', JSON.stringify(info, null, 2));

    expect(info.python.found).toBe(true);
    expect(info.python.version).toContain('Python');
    expect(info.manim.found).toBe(true);
    expect(info.manim.version).toContain('Manim');
    expect(info.ffmpeg.found).toBe(true);
    expect(info.allRequiredReady).toBe(true);
  }, 15000);
});
