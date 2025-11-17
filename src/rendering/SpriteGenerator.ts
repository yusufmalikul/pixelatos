export class SpriteGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Generate a player sprite
   * @param color - The color for the player (e.g., 'blue' or 'red')
   * @param size - The size of the player sprite
   */
  generatePlayer(color: string, size: number = 32): string {
    const key = `player_${color}`;
    if (this.scene.textures.exists(key)) {
      return key;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Draw circle for player
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Add outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add eyes
    const eyeSize = size / 8;
    const eyeY = size / 2 - size / 8;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(size / 2 - size / 6, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size / 2 + size / 6, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    this.scene.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Generate a gold item sprite
   */
  generateGoldItem(size: number = 16): string {
    const key = 'item_gold';
    if (this.scene.textures.exists(key)) {
      return key;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Create radial gradient for shine effect
    const gradient = ctx.createRadialGradient(
      size / 2 - size / 4,
      size / 2 - size / 4,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFA500');
    gradient.addColorStop(1, '#FF8C00');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    // Add outline
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Add highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(size / 2 - size / 6, size / 2 - size / 6, size / 4, 0, Math.PI * 2);
    ctx.fill();

    this.scene.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Generate a silver item sprite
   */
  generateSilverItem(size: number = 16): string {
    const key = 'item_silver';
    if (this.scene.textures.exists(key)) {
      return key;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Create radial gradient
    const gradient = ctx.createRadialGradient(
      size / 2 - size / 4,
      size / 2 - size / 4,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, '#E8E8E8');
    gradient.addColorStop(0.5, '#C0C0C0');
    gradient.addColorStop(1, '#A8A8A8');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    // Add outline
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.stroke();

    this.scene.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Generate a stone item sprite
   */
  generateStoneItem(size: number = 16): string {
    const key = 'item_stone';
    if (this.scene.textures.exists(key)) {
      return key;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Draw square
    ctx.fillStyle = '#696969';
    ctx.fillRect(2, 2, size - 4, size - 4);

    // Add some texture
    ctx.fillStyle = '#505050';
    ctx.fillRect(4, 4, 3, 3);
    ctx.fillRect(size - 7, 6, 2, 2);
    ctx.fillRect(6, size - 7, 2, 2);

    // Add outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    this.scene.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Generate a grass tile sprite
   */
  generateGrassTile(variant: number = 0, size: number = 32): string {
    const key = `tile_grass_${variant}`;
    if (this.scene.textures.exists(key)) {
      return key;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base grass colors
    const colors = ['#2E7D32', '#388E3C', '#43A047', '#4CAF50'];
    ctx.fillStyle = colors[variant % colors.length];
    ctx.fillRect(0, 0, size, size);

    // Add some random grass blades
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.random() * 3 - 1.5, y - 3);
      ctx.stroke();
    }

    this.scene.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Generate a dirt tile sprite
   */
  generateDirtTile(variant: number = 0, size: number = 32): string {
    const key = `tile_dirt_${variant}`;
    if (this.scene.textures.exists(key)) {
      return key;
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base dirt colors
    const colors = ['#6D4C41', '#795548', '#8D6E63', '#A1887F'];
    ctx.fillStyle = colors[variant % colors.length];
    ctx.fillRect(0, 0, size, size);

    // Add some random dots for texture
    ctx.fillStyle = '#5D4037';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillRect(x, y, 2, 2);
    }

    this.scene.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Generate all sprites needed for the game
   */
  generateAll(): void {
    // Generate player sprites
    this.generatePlayer('#4A90E2', 32); // Blue player
    this.generatePlayer('#E74C3C', 32); // Red player

    // Generate item sprites
    this.generateGoldItem();
    this.generateSilverItem();
    this.generateStoneItem();

    // Generate tile sprites
    for (let i = 0; i < 4; i++) {
      this.generateGrassTile(i);
      this.generateDirtTile(i);
    }
  }
}
