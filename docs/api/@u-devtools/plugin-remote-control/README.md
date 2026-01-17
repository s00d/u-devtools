[**Universal DevTools Kit SDK**](../../README.md)

***

[Universal DevTools Kit SDK](../../packages.md) / @u-devtools/plugin-remote-control

# Remote Control Plugin

Remote Control plugin for Universal DevTools using optimized screenshot streaming with full mouse emulation and visual feedback.

## Features

- **Live Screenshot Streaming**: Real-time pixel-perfect screenshots of the remote page using `html-to-image`
- **Adaptive FPS**: Smart frame rate control - only captures when page changes (MutationObserver) or after previous frame is sent
- **Interactive Control**: Full mouse emulation (pointerdown, mousedown, pointerup, mouseup, click) for compatibility with React/Vue components
- **Visual Feedback**: 
  - Phantom cursor (red with "Admin" label) on remote screen
  - Ripple effect on clicks
  - Local cursor always visible in viewer
- **Smart Click Detection**: Automatically finds interactive parent elements (buttons, links) even when clicking on nested elements
- **Quality Settings**: Adjustable quality (Low/Medium/High) for performance vs quality trade-off
- **Real-time Statistics**: FPS counter and frame size display
- **Mouse Movement Tracking**: Throttled mouse position updates (50ms) for smooth cursor following

## How it works

### Architecture

1. **Broadcast Mode (Share)**: The target page captures screenshots and streams them to all connected viewers
2. **View Mode (View)**: Connects to a broadcaster and displays the remote screen with full control

### Technical Implementation

- **Server Side (app.ts)**: 
  - Uses `html-to-image` (toJpeg) for screenshot capture
  - MutationObserver tracks DOM changes
  - Only captures when changes detected or as heartbeat
  - Adaptive frame rate (max 10 FPS by default)
  - Phantom cursor rendering on remote screen
  
- **Client Side (RemoteControlPanel.vue)**: 
  - Displays screenshots with local cursor overlay
  - Handles user interactions (click, scroll, type, mousemove)
  - Sends percentage-based coordinates (0.0-1.0) for screen-size independence
  - Quality selector for dynamic adjustment
  
- **Server Relay (server.ts)**: 
  - Broadcasts frames and input events to all connected clients
  - Ensures all viewers receive the same stream

## Usage

### Starting Remote Control

1. **Share This Tab**: Click "Share" to start broadcasting your current page
2. **View Remote**: Click "View" to connect to a remote broadcaster
3. Enter WebSocket URL (default: `ws://localhost:5173/__u-devtools-ws`)

### Controls

- **Click**: Click anywhere on the screenshot to interact with the remote page
  - Smart detection finds interactive parents (buttons, links) automatically
  - Full event sequence emulation for React/Vue compatibility
  
- **Mouse Movement**: Move mouse over screenshot to control remote cursor
  - Local cursor (crosshair) moves instantly
  - Remote cursor (red "Admin") follows with network delay
  
- **Type**: Enter text in the input field and press Enter or click send button
  - Text is sent to active input/textarea on remote page
  - React/Vue compatible value setting
  
- **Scroll**: Use mouse wheel over the screenshot to scroll the remote page

### Quality Settings

- **Low (Fast)**: 30% quality, 40% scale - Best for slow connections
- **Medium (Balanced)**: 60% quality, 50% scale - Default, good balance
- **High (Sharp)**: 80% quality, 80% scale - Best quality, higher bandwidth

## Protocol

### Stream: Frame (Broadcaster → Server → Viewers)

```typescript
'stream:frame': (payload: { 
  image: string;  // Base64 JPEG
  w: number;      // Viewport width
  h: number;      // Viewport height
}) => { ok: boolean };
```

### Stream: Input (Viewer → Server → Broadcaster)

```typescript
'stream:input': (payload: {
  type: 'click' | 'type' | 'scroll' | 'config' | 'mousemove';
  x?: number;     // 0.0-1.0 percentage
  y?: number;     // 0.0-1.0 percentage
  dx?: number;    // Scroll delta X
  dy?: number;    // Scroll delta Y
  text?: string;  // Text to type
  quality?: number; // 0.1-1.0
  scale?: number;   // 0.1-1.0
}) => { ok: boolean };
```

## Performance Optimizations

### Adaptive Frame Rate
- **MutationObserver**: Only captures when DOM changes detected
- **Request/Response Loop**: Next frame only sent after previous one completes
- **Heartbeat**: Checks for updates every 200ms even if no changes detected
- **Max FPS Limit**: Configurable (default: 10 FPS)

### Network Optimization
- **JPEG Compression**: Adjustable quality (30-80%)
- **Scale Reduction**: Canvas rendered at lower resolution (40-80%)
- **Throttled Mouse Events**: Mouse movement updates limited to 50ms intervals
- **No Frame Updates on Mouse Move**: Cursor movement doesn't trigger screenshot capture

### Smart Click Detection
- Finds nearest interactive parent (`button`, `a`, `input`, `[role="button"]`, `[onclick]`)
- Works with nested elements (e.g., `<span>` inside `<button>`)
- Full event sequence: `pointerdown` → `mousedown` → `pointerup` → `mouseup` → `click`

## Visual Features

### Phantom Cursor
- Red cursor with "Admin" label on remote screen
- Smooth transitions (0.1s linear)
- Automatically hidden during screenshot capture
- Filtered from screenshot output

### Ripple Effect
- Blue ripple animation on clicks
- 400ms animation duration
- Visual feedback for remote interactions

### Statistics Display
- **FPS Counter**: Real-time frame rate (updates every second)
- **Frame Size**: Current frame size in KB
- Color-coded badges (green/yellow for FPS)

## Technical Details

- **Library**: `html-to-image` (toJpeg) for screenshot capture
- **Transport**: WebSocket via `@u-devtools/bridge` (ViteRpcClient/Server)
- **Event Emulation**: Full PointerEvent and MouseEvent sequence
- **React/Vue Compatibility**: Native value setter for input fields
- **Coordinate System**: Percentage-based (0.0-1.0) for screen-size independence

## Performance Metrics

### Default Settings (Medium Quality)
- **Frame Rate**: Adaptive (0-10 FPS depending on changes)
- **Image Quality**: JPEG 60% quality, 50% scale
- **Network**: ~20-100KB per frame (depending on page complexity)
- **Mouse Update Rate**: 20 updates/second (50ms throttle)

### Low Quality Mode
- **Image Quality**: JPEG 30% quality, 40% scale
- **Network**: ~10-50KB per frame
- **Best for**: Slow connections, mobile networks

### High Quality Mode
- **Image Quality**: JPEG 80% quality, 80% scale
- **Network**: ~50-200KB per frame
- **Best for**: Fast connections, detailed UI inspection

## Limitations

- Some external images may not render due to CORS restrictions
- Complex animations may appear choppy at lower FPS
- Large pages may take longer to capture
- Network latency affects cursor synchronization
- CSS `oklch` color functions not supported by html-to-image (handled gracefully)

## License

MIT

## Modules

- [](README.md)
- [src/server](src/server/README.md)
