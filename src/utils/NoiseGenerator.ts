/**
 * Simple noise generator using a seeded random function
 */
export class NoiseGenerator {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Seeded random number generator
   */
  private random(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Get noise value at position (0-1 range)
   */
  noise(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    // Get corner values
    const a = this.random(xi, yi);
    const b = this.random(xi + 1, yi);
    const c = this.random(xi, yi + 1);
    const d = this.random(xi + 1, yi + 1);

    // Smooth interpolation
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);

    // Bilinear interpolation
    const ab = a * (1 - u) + b * u;
    const cd = c * (1 - u) + d * u;
    return ab * (1 - v) + cd * v;
  }

  /**
   * Get octave noise (multiple frequencies combined)
   */
  octaveNoise(x: number, y: number, octaves: number = 4, persistence: number = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}
