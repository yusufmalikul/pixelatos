# Pixelatos

A multiplayer pixelated 2D collection game built with Phaser 3, TypeScript, and WebRTC.

## Features

- **Infinite Procedural Map**: Explore an endless world generated with chunk-based system
- **Multiplayer P2P**: Connect with friends using WebRTC without needing a central server
- **Mobile Support**: Fully responsive with touch controls for mobile devices
- **Item Collection**: Collect Gold, Silver, and Stone items scattered across the world
- **Procedural Graphics**: All sprites generated programmatically - no external assets needed
- **Inventory System**: Manage and drop collected items

## How to Play

### Controls

- **Desktop**: Use WASD keys to move your character
- **Mobile**: Touch anywhere on the screen to move toward that location
- **Collect**: Walk over items to automatically collect them
- **Drop**: Click/tap on items in your inventory to drop them at your position

### Multiplayer

1. **Host a Game**:
   - Click "Create Room"
   - Share the 6-digit code with your friend
   - Wait for them to join

2. **Join a Game**:
   - Click "Join Room"
   - Enter the 6-digit code from your friend
   - Start playing together!

3. **Single Player**:
   - Click "Single Player" to play alone

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Technology Stack

- **Phaser 3**: Game engine
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **PeerJS**: WebRTC wrapper for P2P connections

## Game Mechanics

### Items

- **Gold**: High value, rare (10% spawn rate)
- **Silver**: Medium value (30% spawn rate)
- **Stone**: Common resource (60% spawn rate)

### Spawning

- New items spawn every 5 minutes
- Each spawn creates 1-3 random items at random locations
- All players see the same items (synchronized)

### World Generation

- 16x16 tile chunks
- Loads 3x3 grid of chunks around each player
- Procedural terrain using noise generation
- Shared seed ensures identical worlds for all players

## Project Structure

```
/src
  /game
    - main.ts              # Phaser configuration and entry point
    - GameScene.ts         # Main game scene
    - MenuScene.ts         # Connection menu
  /systems
    - ChunkManager.ts      # Infinite map generation
    - Player.ts            # Player movement and controls
    - Inventory.ts         # Inventory management
    - ItemSpawner.ts       # Item spawning system
    - MultiplayerManager.ts # WebRTC P2P networking
  /rendering
    - SpriteGenerator.ts   # Procedural sprite generation
  /utils
    - NoiseGenerator.ts    # Terrain noise generation
```

## License

MIT
