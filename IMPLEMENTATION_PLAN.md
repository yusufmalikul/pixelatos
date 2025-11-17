Multiplayer Pixelated 2D Collection Game - Implementation Plan
Technology Stack
Phaser 3 (TypeScript) - Works great on mobile browsers, touch support
Vite - Fast build tool
WebRTC (PeerJS or simple-peer) - P2P multiplayer without central server
Procedural graphics - Generate all sprites via Canvas API (no external assets)
Core Features
1. Project Setup & Mobile Support
Configure Phaser for responsive mobile display
Touch controls: Virtual joystick or touch-drag for movement
Responsive canvas that adapts to screen size
Prevent page scrolling/zooming on mobile
2. Game Mechanics
Movement: WASD (desktop) + touch controls (mobile)
Collection: Walk over items to auto-collect
Drop items: Tap/click inventory item to drop at player position
Resources: Gold (high value), Silver (medium), Stone (common)
Inventory system: Visual grid showing collected items
Item spawning: Every 5 minutes, spawn 1-3 random items at random positions
3. Infinite Map Generation
Chunk-based: 16x16 tiles per chunk, generate in 3x3 grid around players
Smooth transitions: Pre-load adjacent chunks when player approaches edge
Sync between players: Shared seed ensures same map for both players
Procedural terrain: Simple grass/dirt variations using noise
4. Peer-to-Peer Multiplayer (No Central Server)
Connection flow:
Host creates room → gets connection code (6-digit)
Guest enters code → connects via WebRTC
Use Google's free STUN server for NAT traversal
State synchronization:
Share player positions (interpolate for smooth movement)
Share item collections/drops (remove/add items)
Share world seed (same map generation)
Share spawn timer (synchronized item spawns)
Connection display: Show if connected/disconnected
5. Procedurally Generated Graphics (No External Assets)
Terrain tiles: Generate colored squares via Canvas (greens, browns)
Player sprites: Simple colored circles/squares (Player 1: blue, Player 2: red)
Items:
Gold: Yellow/gold circle with shine
Silver: Gray/white circle
Stone: Dark gray square
UI elements: Text and simple shapes
File Structure
/src
  /game
    - main.ts (Phaser config, mobile setup)
    - GameScene.ts (main game scene)
    - MenuScene.ts (connection UI)
  /systems
    - ChunkManager.ts (infinite map generation)
    - Player.ts (movement, mobile controls)
    - Inventory.ts (collect/drop items)
    - ItemSpawner.ts (5-min spawn timer)
    - MultiplayerManager.ts (WebRTC P2P)
  /rendering
    - SpriteGenerator.ts (procedural sprites)
  /utils
    - NoiseGenerator.ts (terrain generation)
/public
  - index.html
package.json, tsconfig.json, vite.config.ts
Implementation Order
Setup: Phaser 3 + TypeScript + Vite, mobile viewport config
Graphics: Procedural sprite generation system
Movement: Player controller with touch support
Map: Chunk-based infinite generation with shared seed
Items: Spawning (5-min timer) + collection + drop mechanics
Inventory: UI overlay for mobile
Multiplayer: WebRTC P2P with connection code system
Sync: Player positions, items, spawn events
Polish: Smooth chunk loading, connection status UI
Key Technical Solutions
Smooth map loading: Chunk buffering with fade-in
Mobile performance: Limit visible chunks, efficient rendering
P2P sync: Delta compression for positions, event-based for items
Seed sharing: Host generates seed, guest receives it on connect
Connection resilience: Auto-reconnect attempts, disconnection handling
