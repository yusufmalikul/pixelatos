export type ItemType = 'gold' | 'silver' | 'stone';

export interface InventoryItem {
  type: ItemType;
  count: number;
}

export class Inventory {
  private items: Map<ItemType, number>;
  private scene: Phaser.Scene;
  private uiContainer?: Phaser.GameObjects.Container;
  private uiText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.items = new Map();
    this.items.set('gold', 0);
    this.items.set('silver', 0);
    this.items.set('stone', 0);
  }

  /**
   * Add item to inventory
   */
  addItem(type: ItemType, count: number = 1): void {
    const current = this.items.get(type) || 0;
    this.items.set(type, current + count);
    this.updateUI();
  }

  /**
   * Remove item from inventory
   */
  removeItem(type: ItemType, count: number = 1): boolean {
    const current = this.items.get(type) || 0;
    if (current >= count) {
      this.items.set(type, current - count);
      this.updateUI();
      return true;
    }
    return false;
  }

  /**
   * Get item count
   */
  getItemCount(type: ItemType): number {
    return this.items.get(type) || 0;
  }

  /**
   * Get all items
   */
  getAllItems(): InventoryItem[] {
    return Array.from(this.items.entries()).map(([type, count]) => ({
      type,
      count,
    }));
  }

  /**
   * Create UI display
   */
  createUI(): void {
    this.uiContainer = this.scene.add.container(0, 0);
    this.uiContainer.setScrollFactor(0);
    this.uiContainer.setDepth(100);

    // Background
    const bg = this.scene.add.rectangle(10, 10, 200, 100, 0x000000, 0.7);
    bg.setOrigin(0, 0);

    // Title
    const title = this.scene.add.text(20, 20, 'Inventory', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Items text
    this.uiText = this.scene.add.text(20, 45, '', {
      fontSize: '14px',
      color: '#ffffff',
    });

    this.uiContainer.add([bg, title, this.uiText]);
    this.updateUI();
  }

  /**
   * Update UI display
   */
  private updateUI(): void {
    if (!this.uiText) return;

    const gold = this.items.get('gold') || 0;
    const silver = this.items.get('silver') || 0;
    const stone = this.items.get('stone') || 0;

    this.uiText.setText([
      `Gold: ${gold}`,
      `Silver: ${silver}`,
      `Stone: ${stone}`,
    ]);
  }

  /**
   * Handle UI click to drop item
   */
  setupDropHandler(onDrop: (type: ItemType) => void): void {
    if (!this.uiContainer) return;

    // Make UI interactive
    const bg = this.uiContainer.list[0] as Phaser.GameObjects.Rectangle;
    bg.setInteractive();

    // Add click zones for each item type
    const goldZone = this.scene.add.zone(20, 45, 180, 15).setOrigin(0, 0);
    const silverZone = this.scene.add.zone(20, 60, 180, 15).setOrigin(0, 0);
    const stoneZone = this.scene.add.zone(20, 75, 180, 15).setOrigin(0, 0);

    goldZone.setInteractive();
    silverZone.setInteractive();
    stoneZone.setInteractive();

    goldZone.setScrollFactor(0);
    silverZone.setScrollFactor(0);
    stoneZone.setScrollFactor(0);

    goldZone.setDepth(101);
    silverZone.setDepth(101);
    stoneZone.setDepth(101);

    goldZone.on('pointerdown', () => {
      if (this.getItemCount('gold') > 0) {
        onDrop('gold');
      }
    });

    silverZone.on('pointerdown', () => {
      if (this.getItemCount('silver') > 0) {
        onDrop('silver');
      }
    });

    stoneZone.on('pointerdown', () => {
      if (this.getItemCount('stone') > 0) {
        onDrop('stone');
      }
    });
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.items.set('gold', 0);
    this.items.set('silver', 0);
    this.items.set('stone', 0);
    this.updateUI();
  }
}
