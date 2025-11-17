import Phaser from 'phaser';
import { MultiplayerManager } from '../systems/MultiplayerManager';

export class MenuScene extends Phaser.Scene {
  private multiplayerManager: MultiplayerManager;
  private statusText?: Phaser.GameObjects.Text;
  private roomCodeText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
    this.multiplayerManager = new MultiplayerManager();
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    this.add
      .text(width / 2, height / 4, 'PIXELATOS', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 4 + 50, 'Multiplayer Collection Game', {
        fontSize: '20px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    // Host button
    const hostButton = this.add
      .rectangle(width / 2, height / 2 - 50, 200, 50, 0x4a90e2)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height / 2 - 50, 'Create Room', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    hostButton.on('pointerdown', () => this.createRoom());
    hostButton.on('pointerover', () => hostButton.setFillStyle(0x5aa0f2));
    hostButton.on('pointerout', () => hostButton.setFillStyle(0x4a90e2));

    // Join button
    const joinButton = this.add
      .rectangle(width / 2, height / 2 + 20, 200, 50, 0xe74c3c)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height / 2 + 20, 'Join Room', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    joinButton.on('pointerdown', () => this.joinRoom());
    joinButton.on('pointerover', () => joinButton.setFillStyle(0xf75c4c));
    joinButton.on('pointerout', () => joinButton.setFillStyle(0xe74c3c));

    // Single player button
    const singleButton = this.add
      .rectangle(width / 2, height / 2 + 90, 200, 50, 0x555555)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height / 2 + 90, 'Single Player', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    singleButton.on('pointerdown', () => this.startSinglePlayer());
    singleButton.on('pointerover', () => singleButton.setFillStyle(0x666666));
    singleButton.on('pointerout', () => singleButton.setFillStyle(0x555555));

    // Status text
    this.statusText = this.add
      .text(width / 2, height - 100, '', {
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Room code text
    this.roomCodeText = this.add
      .text(width / 2, height - 60, '', {
        fontSize: '20px',
        color: '#FFD700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  private async createRoom(): Promise<void> {
    this.statusText?.setText('Creating room...');

    try {
      const code = await this.multiplayerManager.createRoom();
      this.statusText?.setText('Room created! Share this code:');
      this.roomCodeText?.setText(code);

      // Setup connection handlers
      this.multiplayerManager.setOnConnected(() => {
        this.statusText?.setText('Player connected! Starting game...');
        setTimeout(() => {
          this.startGame(true);
        }, 1000);
      });
    } catch (error) {
      this.statusText?.setText('Failed to create room. Please try again.');
      console.error(error);
    }
  }

  private async joinRoom(): Promise<void> {
    // Prompt for room code
    const code = prompt('Enter room code:');
    if (!code || code.length !== 6) {
      this.statusText?.setText('Invalid room code');
      return;
    }

    this.statusText?.setText('Joining room...');

    try {
      await this.multiplayerManager.joinRoom(code);

      this.multiplayerManager.setOnConnected(() => {
        this.statusText?.setText('Connected! Starting game...');
        setTimeout(() => {
          this.startGame(false);
        }, 1000);
      });

      this.multiplayerManager.setOnDisconnected(() => {
        this.statusText?.setText('Connection lost. Please try again.');
      });
    } catch (error) {
      this.statusText?.setText('Failed to join room. Please check the code.');
      console.error(error);
    }
  }

  private startSinglePlayer(): void {
    this.startGame(true, false);
  }

  private startGame(isHost: boolean, multiplayer: boolean = true): void {
    // Pass data to game scene
    this.scene.start('GameScene', {
      multiplayerManager: multiplayer ? this.multiplayerManager : null,
      isHost,
    });
  }
}
