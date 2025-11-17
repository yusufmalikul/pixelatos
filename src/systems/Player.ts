export interface PlayerData {
  id: string;
  x: number;
  y: number;
  color: string;
}

export class Player {
  private scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Image;
  public id: string;
  public speed: number = 200;
  private keys?: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
  private touchPointer?: Phaser.Input.Pointer;
  private isLocalPlayer: boolean;

  // Interpolation for smooth remote player movement
  private targetX: number = 0;
  private targetY: number = 0;
  private interpolationSpeed: number = 0.15;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: string,
    id: string,
    isLocalPlayer: boolean = false
  ) {
    this.scene = scene;
    this.id = id;
    this.isLocalPlayer = isLocalPlayer;

    // Create sprite
    const spriteKey = color === '#4A90E2' ? 'player_#4A90E2' : 'player_#E74C3C';
    this.sprite = scene.add.image(x, y, spriteKey);
    this.sprite.setDepth(10);

    this.targetX = x;
    this.targetY = y;

    // Setup controls for local player only
    if (isLocalPlayer && scene.input.keyboard) {
      this.keys = {
        w: scene.input.keyboard.addKey('W'),
        a: scene.input.keyboard.addKey('A'),
        s: scene.input.keyboard.addKey('S'),
        d: scene.input.keyboard.addKey('D'),
      };

      // Setup touch controls
      scene.input.on('pointerdown', this.onPointerDown, this);
      scene.input.on('pointerup', this.onPointerUp, this);
    }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.touchPointer = pointer;
  }

  private onPointerUp(): void {
    this.touchPointer = undefined;
  }

  /**
   * Update player movement
   */
  update(delta: number): void {
    if (this.isLocalPlayer) {
      this.updateLocalPlayer(delta);
    } else {
      this.updateRemotePlayer();
    }
  }

  /**
   * Update local player (with controls)
   */
  private updateLocalPlayer(delta: number): void {
    let velocityX = 0;
    let velocityY = 0;

    // Keyboard controls
    if (this.keys) {
      if (this.keys.w.isDown) velocityY -= 1;
      if (this.keys.s.isDown) velocityY += 1;
      if (this.keys.a.isDown) velocityX -= 1;
      if (this.keys.d.isDown) velocityX += 1;
    }

    // Touch controls
    if (this.touchPointer && this.touchPointer.isDown) {
      const worldPoint = this.scene.cameras.main.getWorldPoint(
        this.touchPointer.x,
        this.touchPointer.y
      );
      const dx = worldPoint.x - this.sprite.x;
      const dy = worldPoint.y - this.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        velocityX = dx / distance;
        velocityY = dy / distance;
      }
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    // Apply movement
    const movement = (this.speed * delta) / 1000;
    this.sprite.x += velocityX * movement;
    this.sprite.y += velocityY * movement;

    // Update target for network sync
    this.targetX = this.sprite.x;
    this.targetY = this.sprite.y;
  }

  /**
   * Update remote player (interpolation)
   */
  private updateRemotePlayer(): void {
    // Smooth interpolation to target position
    this.sprite.x += (this.targetX - this.sprite.x) * this.interpolationSpeed;
    this.sprite.y += (this.targetY - this.sprite.y) * this.interpolationSpeed;
  }

  /**
   * Set target position for remote player
   */
  setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Get current position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Get player data for network sync
   */
  getData(): PlayerData {
    return {
      id: this.id,
      x: this.sprite.x,
      y: this.sprite.y,
      color: this.isLocalPlayer ? '#4A90E2' : '#E74C3C',
    };
  }

  /**
   * Destroy the player
   */
  destroy(): void {
    if (this.isLocalPlayer) {
      this.scene.input.off('pointerdown', this.onPointerDown, this);
      this.scene.input.off('pointerup', this.onPointerUp, this);
    }
    this.sprite.destroy();
  }
}
