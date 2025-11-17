import { NoiseGenerator } from '../utils/NoiseGenerator';

export interface Chunk {
  x: number;
  y: number;
  tiles: Phaser.GameObjects.Image[][];
}

export class ChunkManager {
  private scene: Phaser.Scene;
  private chunks: Map<string, Chunk>;
  private noise: NoiseGenerator;
  private chunkSize: number = 16;
  private tileSize: number = 32;
  private loadedChunks: Set<string>;

  constructor(scene: Phaser.Scene, seed: number) {
    this.scene = scene;
    this.chunks = new Map();
    this.noise = new NoiseGenerator(seed);
    this.loadedChunks = new Set();
  }

  /**
   * Get chunk key from coordinates
   */
  private getChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }

  /**
   * Get chunk coordinates from world position
   */
  getChunkCoords(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / (this.chunkSize * this.tileSize)),
      y: Math.floor(worldY / (this.chunkSize * this.tileSize)),
    };
  }

  /**
   * Generate a chunk at the given chunk coordinates
   */
  generateChunk(chunkX: number, chunkY: number): Chunk {
    const key = this.getChunkKey(chunkX, chunkY);

    // Return existing chunk if already generated
    if (this.chunks.has(key)) {
      return this.chunks.get(key)!;
    }

    const tiles: Phaser.GameObjects.Image[][] = [];
    const startX = chunkX * this.chunkSize * this.tileSize;
    const startY = chunkY * this.chunkSize * this.tileSize;

    for (let y = 0; y < this.chunkSize; y++) {
      tiles[y] = [];
      for (let x = 0; x < this.chunkSize; x++) {
        const worldX = startX + x * this.tileSize;
        const worldY = startY + y * this.tileSize;

        // Use noise to determine tile type
        const noiseValue = this.noise.octaveNoise(
          (chunkX * this.chunkSize + x) * 0.1,
          (chunkY * this.chunkSize + y) * 0.1,
          3,
          0.5
        );

        // Choose tile based on noise value
        let tileKey: string;
        if (noiseValue < 0.3) {
          // Dirt
          const variant = Math.floor(noiseValue * 13) % 4;
          tileKey = `tile_dirt_${variant}`;
        } else {
          // Grass
          const variant = Math.floor(noiseValue * 17) % 4;
          tileKey = `tile_grass_${variant}`;
        }

        const tile = this.scene.add.image(
          worldX + this.tileSize / 2,
          worldY + this.tileSize / 2,
          tileKey
        );
        tile.setOrigin(0.5);
        tile.setDisplaySize(this.tileSize, this.tileSize);
        tile.setDepth(-1);

        tiles[y][x] = tile;
      }
    }

    const chunk: Chunk = { x: chunkX, y: chunkY, tiles };
    this.chunks.set(key, chunk);
    this.loadedChunks.add(key);

    return chunk;
  }

  /**
   * Unload a chunk (destroy its tiles)
   */
  unloadChunk(chunkX: number, chunkY: number): void {
    const key = this.getChunkKey(chunkX, chunkY);
    const chunk = this.chunks.get(key);

    if (chunk) {
      // Destroy all tiles
      for (let y = 0; y < this.chunkSize; y++) {
        for (let x = 0; x < this.chunkSize; x++) {
          chunk.tiles[y][x].destroy();
        }
      }
      this.chunks.delete(key);
      this.loadedChunks.delete(key);
    }
  }

  /**
   * Update loaded chunks based on player position
   * Loads chunks in a 3x3 grid around the player
   */
  updateChunks(playerX: number, playerY: number): void {
    const playerChunk = this.getChunkCoords(playerX, playerY);
    const renderDistance = 1; // Load 3x3 grid (1 chunk in each direction)

    const chunksToKeep = new Set<string>();

    // Load chunks around player
    for (let dy = -renderDistance; dy <= renderDistance; dy++) {
      for (let dx = -renderDistance; dx <= renderDistance; dx++) {
        const chunkX = playerChunk.x + dx;
        const chunkY = playerChunk.y + dy;
        const key = this.getChunkKey(chunkX, chunkY);

        chunksToKeep.add(key);
        if (!this.loadedChunks.has(key)) {
          this.generateChunk(chunkX, chunkY);
        }
      }
    }

    // Unload chunks that are too far away
    const chunksToUnload: { x: number; y: number }[] = [];
    this.loadedChunks.forEach((key) => {
      if (!chunksToKeep.has(key)) {
        const [x, y] = key.split(',').map(Number);
        chunksToUnload.push({ x, y });
      }
    });

    chunksToUnload.forEach(({ x, y }) => this.unloadChunk(x, y));
  }

  /**
   * Get the world seed
   */
  getSeed(): number {
    return this.noise['seed'];
  }
}
