import Phaser from 'phaser';
import { SpriteGenerator } from '../rendering/SpriteGenerator';
import { ChunkManager } from '../systems/ChunkManager';
import { Player } from '../systems/Player';
import { Inventory, ItemType } from '../systems/Inventory';
import { ItemSpawner } from '../systems/ItemSpawner';
import { MultiplayerManager } from '../systems/MultiplayerManager';

export class GameScene extends Phaser.Scene {
  private spriteGenerator!: SpriteGenerator;
  private chunkManager!: ChunkManager;
  private localPlayer!: Player;
  private remotePlayer?: Player;
  private inventory!: Inventory;
  private itemSpawner!: ItemSpawner;
  private multiplayerManager?: MultiplayerManager;
  private isHost: boolean = false;
  private worldSeed: number = 0;

  // UI
  private connectionStatusText?: Phaser.GameObjects.Text;
  private spawnTimerText?: Phaser.GameObjects.Text;

  // Network sync
  private positionSyncTimer: number = 0;
  private positionSyncInterval: number = 50; // Send position every 50ms

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { multiplayerManager?: MultiplayerManager; isHost: boolean }): void {
    this.multiplayerManager = data.multiplayerManager;
    this.isHost = data.isHost;

    // Generate or receive world seed
    if (this.isHost || !this.multiplayerManager) {
      this.worldSeed = Math.floor(Math.random() * 1000000);
    }
  }

  create(): void {
    // Initialize sprite generator
    this.spriteGenerator = new SpriteGenerator(this);
    this.spriteGenerator.generateAll();

    // Initialize chunk manager
    this.chunkManager = new ChunkManager(this, this.worldSeed);

    // Create local player
    this.localPlayer = new Player(
      this,
      400,
      300,
      '#4A90E2',
      'local',
      true
    );

    // Setup camera to follow player
    this.cameras.main.startFollow(this.localPlayer.sprite);
    this.cameras.main.setZoom(1);

    // Initialize inventory
    this.inventory = new Inventory(this);
    this.inventory.createUI();
    this.inventory.setupDropHandler((type) => this.dropItem(type));

    // Initialize item spawner
    this.itemSpawner = new ItemSpawner(this);

    // Setup item spawner callbacks
    this.itemSpawner.setOnItemCollected((itemId, type) => {
      this.inventory.addItem(type);

      // Notify remote player
      if (this.multiplayerManager?.isConnected()) {
        this.multiplayerManager.sendItemCollected(itemId);
      }
    });

    this.itemSpawner.setOnItemSpawned((item) => {
      // Only host spawns items and notifies guest
      if (this.isHost && this.multiplayerManager?.isConnected()) {
        this.multiplayerManager.sendItemSpawned(item.id, item.type, item.x, item.y);
      }
    });

    // Setup multiplayer if available
    if (this.multiplayerManager) {
      this.setupMultiplayer();
    }

    // Create UI
    this.createUI();

    // Initial chunk load
    this.chunkManager.updateChunks(
      this.localPlayer.sprite.x,
      this.localPlayer.sprite.y
    );
  }

  update(_time: number, delta: number): void {
    // Update player
    this.localPlayer.update(delta);

    // Update remote player
    if (this.remotePlayer) {
      this.remotePlayer.update(delta);
    }

    // Update chunks based on local player position
    this.chunkManager.updateChunks(
      this.localPlayer.sprite.x,
      this.localPlayer.sprite.y
    );

    // Check for item collection
    const pos = this.localPlayer.getPosition();
    this.itemSpawner.checkCollection(pos.x, pos.y);

    // Update item spawner
    if (this.isHost || !this.multiplayerManager) {
      this.itemSpawner.update(delta);
    }

    // Update spawn timer UI
    if (this.spawnTimerText) {
      const timeLeft = Math.ceil(this.itemSpawner.getTimeUntilSpawn());
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      this.spawnTimerText.setText(
        `Next spawn: ${minutes}:${seconds.toString().padStart(2, '0')}`
      );
    }

    // Sync position with remote player
    if (this.multiplayerManager?.isConnected()) {
      this.positionSyncTimer += delta;
      if (this.positionSyncTimer >= this.positionSyncInterval) {
        this.positionSyncTimer = 0;
        const playerData = this.localPlayer.getData();
        this.multiplayerManager.sendPosition(playerData);
      }

      // Host syncs spawn timer periodically
      if (this.isHost) {
        this.multiplayerManager.sendSpawnTimer(this.itemSpawner.getSpawnProgress() * 300000);
      }
    }
  }

  private setupMultiplayer(): void {
    if (!this.multiplayerManager) return;

    // Handle remote player position updates
    this.multiplayerManager.setOnPositionUpdate((data) => {
      if (!this.remotePlayer) {
        this.remotePlayer = new Player(
          this,
          data.x,
          data.y,
          '#E74C3C',
          'remote',
          false
        );
      } else {
        this.remotePlayer.setTargetPosition(data.x, data.y);
      }
    });

    // Handle item collection by remote player
    this.multiplayerManager.setOnItemCollected((itemId) => {
      this.itemSpawner.removeItem(itemId);
    });

    // Handle item dropped by remote player
    this.multiplayerManager.setOnItemDropped((id, type, x, y) => {
      this.itemSpawner.dropItem(type, x, y, id);
    });

    // Handle item spawned (guest receives from host)
    this.multiplayerManager.setOnItemSpawned((id, type, x, y) => {
      this.itemSpawner.spawnItem(type, x, y, id);
    });

    // Handle world sync (guest receives from host)
    this.multiplayerManager.setOnWorldSync((data) => {
      this.worldSeed = data.seed;
      this.chunkManager = new ChunkManager(this, this.worldSeed);
      this.chunkManager.updateChunks(
        this.localPlayer.sprite.x,
        this.localPlayer.sprite.y
      );

      // Sync items
      data.items.forEach((item) => {
        this.itemSpawner.spawnItem(item.type, item.x, item.y, item.id);
      });

      // Sync spawn timer
      this.itemSpawner.setSpawnTimer(data.spawnTimer);
    });

    // Handle spawn timer updates
    this.multiplayerManager.setOnSpawnTimerUpdate((time) => {
      this.itemSpawner.setSpawnTimer(time);
    });

    // Handle disconnection
    this.multiplayerManager.setOnDisconnected(() => {
      if (this.connectionStatusText) {
        this.connectionStatusText.setText('Disconnected');
        this.connectionStatusText.setColor('#ff0000');
      }
    });

    // If host, send world sync to guest when they connect
    if (this.isHost) {
      const items = this.itemSpawner.getAllItems().map((item) => ({
        id: item.id,
        type: item.type,
        x: item.x,
        y: item.y,
      }));

      setTimeout(() => {
        this.multiplayerManager?.sendWorldSync({
          seed: this.worldSeed,
          items,
          spawnTimer: this.itemSpawner.getSpawnProgress() * 300000,
        });
      }, 500);
    }
  }

  private dropItem(type: ItemType): void {
    if (this.inventory.removeItem(type)) {
      const pos = this.localPlayer.getPosition();
      const id = `drop_${Date.now()}_${Math.random()}`;
      this.itemSpawner.dropItem(type, pos.x, pos.y, id);

      // Notify remote player
      if (this.multiplayerManager?.isConnected()) {
        this.multiplayerManager.sendItemDropped(id, type, pos.x, pos.y);
      }
    }
  }

  private createUI(): void {
    // Connection status
    if (this.multiplayerManager) {
      this.connectionStatusText = this.add
        .text(10, 120, this.multiplayerManager.isConnected() ? 'Connected' : 'Connecting...', {
          fontSize: '14px',
          color: this.multiplayerManager.isConnected() ? '#00ff00' : '#ffff00',
          backgroundColor: '#000000',
          padding: { x: 5, y: 5 },
        })
        .setScrollFactor(0)
        .setDepth(100);
    }

    // Spawn timer
    this.spawnTimerText = this.add
      .text(10, this.multiplayerManager ? 145 : 120, 'Next spawn: --:--', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Controls info
    const controlsText = this.input.pointer1.active
      ? 'Touch to move | Tap items to drop'
      : 'WASD to move | Click items to drop';

    this.add
      .text(10, this.cameras.main.height - 30, controlsText, {
        fontSize: '12px',
        color: '#aaaaaa',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);
  }
}
