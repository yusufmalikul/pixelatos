import { ItemType } from './Inventory';

export interface WorldItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Image;
}

export class ItemSpawner {
  private scene: Phaser.Scene;
  private items: Map<string, WorldItem>;
  private spawnTimer: number = 0;
  private spawnInterval: number = 300000; // 5 minutes in milliseconds
  private nextItemId: number = 0;
  private onItemCollected?: (itemId: string, type: ItemType) => void;
  private onItemSpawned?: (item: WorldItem) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.items = new Map();
  }

  /**
   * Set callback for item collection
   */
  setOnItemCollected(callback: (itemId: string, type: ItemType) => void): void {
    this.onItemCollected = callback;
  }

  /**
   * Set callback for item spawning
   */
  setOnItemSpawned(callback: (item: WorldItem) => void): void {
    this.onItemSpawned = callback;
  }

  /**
   * Update spawner (call every frame)
   */
  update(delta: number): void {
    this.spawnTimer += delta;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnRandomItems();
    }
  }

  /**
   * Spawn random items (1-3 items)
   */
  private spawnRandomItems(): void {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 items

    for (let i = 0; i < count; i++) {
      this.spawnItem();
    }
  }

  /**
   * Spawn a single random item at a random position
   */
  spawnItem(type?: ItemType, x?: number, y?: number, id?: string): WorldItem {
    // Random item type if not specified
    if (!type) {
      const types: ItemType[] = ['gold', 'silver', 'stone'];
      const weights = [0.1, 0.3, 0.6]; // Gold is rare, stone is common
      const random = Math.random();
      let cumulative = 0;

      for (let i = 0; i < types.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          type = types[i];
          break;
        }
      }

      if (!type) type = 'stone'; // Fallback
    }

    // Random position if not specified (within reasonable range)
    if (x === undefined) {
      x = (Math.random() - 0.5) * 2000; // -1000 to 1000
    }
    if (y === undefined) {
      y = (Math.random() - 0.5) * 2000; // -1000 to 1000
    }

    // Generate unique ID if not specified
    if (!id) {
      id = `item_${this.nextItemId++}_${Date.now()}`;
    }

    // Create sprite
    const spriteKey = `item_${type}`;
    const sprite = this.scene.add.image(x, y, spriteKey);
    sprite.setDepth(5);

    const item: WorldItem = {
      id,
      type,
      x,
      y,
      sprite,
    };

    this.items.set(id, item);

    // Notify listeners
    if (this.onItemSpawned) {
      this.onItemSpawned(item);
    }

    return item;
  }

  /**
   * Check for item collection near a position
   */
  checkCollection(x: number, y: number, collectionRadius: number = 20): void {
    const toRemove: string[] = [];

    this.items.forEach((item, id) => {
      const dx = item.x - x;
      const dy = item.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < collectionRadius) {
        toRemove.push(id);
      }
    });

    toRemove.forEach((id) => {
      const item = this.items.get(id)!;
      this.collectItem(id, item.type);
    });
  }

  /**
   * Collect an item by ID
   */
  private collectItem(itemId: string, type: ItemType): void {
    const item = this.items.get(itemId);
    if (item) {
      item.sprite.destroy();
      this.items.delete(itemId);

      if (this.onItemCollected) {
        this.onItemCollected(itemId, type);
      }
    }
  }

  /**
   * Remove an item (e.g., collected by another player)
   */
  removeItem(itemId: string): void {
    const item = this.items.get(itemId);
    if (item) {
      item.sprite.destroy();
      this.items.delete(itemId);
    }
  }

  /**
   * Drop an item at a position
   */
  dropItem(type: ItemType, x: number, y: number, id?: string): WorldItem {
    return this.spawnItem(type, x, y, id);
  }

  /**
   * Get all current items
   */
  getAllItems(): WorldItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Get spawn timer progress (0-1)
   */
  getSpawnProgress(): number {
    return this.spawnTimer / this.spawnInterval;
  }

  /**
   * Get time until next spawn (in seconds)
   */
  getTimeUntilSpawn(): number {
    return Math.max(0, (this.spawnInterval - this.spawnTimer) / 1000);
  }

  /**
   * Sync spawn timer (for multiplayer)
   */
  setSpawnTimer(time: number): void {
    this.spawnTimer = time;
  }

  /**
   * Clear all items
   */
  clearAllItems(): void {
    this.items.forEach((item) => {
      item.sprite.destroy();
    });
    this.items.clear();
  }
}
