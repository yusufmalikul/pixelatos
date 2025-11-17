import Peer, { DataConnection } from 'peerjs';
import { PlayerData } from './Player';
import { ItemType } from './Inventory';

export interface NetworkMessage {
  type: 'position' | 'item_collected' | 'item_dropped' | 'item_spawned' | 'world_sync' | 'spawn_timer';
  data: any;
}

export interface WorldSyncData {
  seed: number;
  items: Array<{ id: string; type: ItemType; x: number; y: number }>;
  spawnTimer: number;
}

export class MultiplayerManager {
  private peer?: Peer;
  private connection?: DataConnection;
  private isHost: boolean = false;
  private connected: boolean = false;
  private peerId: string = '';

  // Callbacks
  private onConnected?: () => void;
  private onDisconnected?: () => void;
  private onPositionUpdate?: (data: PlayerData) => void;
  private onItemCollected?: (itemId: string) => void;
  private onItemDropped?: (id: string, type: ItemType, x: number, y: number) => void;
  private onItemSpawned?: (id: string, type: ItemType, x: number, y: number) => void;
  private onWorldSync?: (data: WorldSyncData) => void;
  private onSpawnTimerUpdate?: (time: number) => void;

  constructor() {}

  /**
   * Initialize as host
   */
  async createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      this.peer = new Peer(code, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        this.isHost = true;
        resolve(code);
      });

      this.peer.on('connection', (conn) => {
        this.connection = conn;
        this.setupConnection();
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });
    });
  }

  /**
   * Join a room as guest
   */
  async joinRoom(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        this.isHost = false;

        // Connect to host
        this.connection = this.peer!.connect(code, {
          reliable: true,
        });

        this.setupConnection();
        resolve();
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });
    });
  }

  /**
   * Setup connection event handlers
   */
  private setupConnection(): void {
    if (!this.connection) return;

    this.connection.on('open', () => {
      this.connected = true;
      if (this.onConnected) {
        this.onConnected();
      }
    });

    this.connection.on('data', (data) => {
      this.handleMessage(data as NetworkMessage);
    });

    this.connection.on('close', () => {
      this.connected = false;
      if (this.onDisconnected) {
        this.onDisconnected();
      }
    });

    this.connection.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  /**
   * Handle incoming network message
   */
  private handleMessage(message: NetworkMessage): void {
    switch (message.type) {
      case 'position':
        if (this.onPositionUpdate) {
          this.onPositionUpdate(message.data);
        }
        break;

      case 'item_collected':
        if (this.onItemCollected) {
          this.onItemCollected(message.data.itemId);
        }
        break;

      case 'item_dropped':
        if (this.onItemDropped) {
          this.onItemDropped(
            message.data.id,
            message.data.type,
            message.data.x,
            message.data.y
          );
        }
        break;

      case 'item_spawned':
        if (this.onItemSpawned) {
          this.onItemSpawned(
            message.data.id,
            message.data.type,
            message.data.x,
            message.data.y
          );
        }
        break;

      case 'world_sync':
        if (this.onWorldSync) {
          this.onWorldSync(message.data);
        }
        break;

      case 'spawn_timer':
        if (this.onSpawnTimerUpdate) {
          this.onSpawnTimerUpdate(message.data.time);
        }
        break;
    }
  }

  /**
   * Send player position
   */
  sendPosition(data: PlayerData): void {
    this.send({ type: 'position', data });
  }

  /**
   * Send item collected event
   */
  sendItemCollected(itemId: string): void {
    this.send({ type: 'item_collected', data: { itemId } });
  }

  /**
   * Send item dropped event
   */
  sendItemDropped(id: string, type: ItemType, x: number, y: number): void {
    this.send({ type: 'item_dropped', data: { id, type, x, y } });
  }

  /**
   * Send item spawned event
   */
  sendItemSpawned(id: string, type: ItemType, x: number, y: number): void {
    this.send({ type: 'item_spawned', data: { id, type, x, y } });
  }

  /**
   * Send world sync data (host only)
   */
  sendWorldSync(data: WorldSyncData): void {
    this.send({ type: 'world_sync', data });
  }

  /**
   * Send spawn timer update
   */
  sendSpawnTimer(time: number): void {
    this.send({ type: 'spawn_timer', data: { time } });
  }

  /**
   * Send message over connection
   */
  private send(message: NetworkMessage): void {
    if (this.connection && this.connected) {
      this.connection.send(message);
    }
  }

  /**
   * Set callback handlers
   */
  setOnConnected(callback: () => void): void {
    this.onConnected = callback;
  }

  setOnDisconnected(callback: () => void): void {
    this.onDisconnected = callback;
  }

  setOnPositionUpdate(callback: (data: PlayerData) => void): void {
    this.onPositionUpdate = callback;
  }

  setOnItemCollected(callback: (itemId: string) => void): void {
    this.onItemCollected = callback;
  }

  setOnItemDropped(callback: (id: string, type: ItemType, x: number, y: number) => void): void {
    this.onItemDropped = callback;
  }

  setOnItemSpawned(callback: (id: string, type: ItemType, x: number, y: number) => void): void {
    this.onItemSpawned = callback;
  }

  setOnWorldSync(callback: (data: WorldSyncData) => void): void {
    this.onWorldSync = callback;
  }

  setOnSpawnTimerUpdate(callback: (time: number) => void): void {
    this.onSpawnTimerUpdate = callback;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Check if this is the host
   */
  isHostPlayer(): boolean {
    return this.isHost;
  }

  /**
   * Get peer ID
   */
  getPeerId(): string {
    return this.peerId;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.connection) {
      this.connection.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
    this.connected = false;
  }
}
