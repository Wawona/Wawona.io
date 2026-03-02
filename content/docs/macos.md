+++
title = "macOS Implementation"
date = 2026-02-22
weight = 8
+++

# macOS Implementation

A deep dive into how Wawona achieves a native macOS experience while acting as a high-performance Wayland compositor.

---

## Native First

Wawona is not a port of a Linux compositor — it's a **re-imagining of a Wayland compositor as a native Mac application**. Every user-facing layer uses Apple's first-party frameworks:

| Component | Framework | What It Means |
|-----------|-----------|---------------|
| **Window Host** | AppKit (`NSWindow`) | Every Wayland app is a real macOS window |
| **UI** | AppKit / UIKit | Settings, About panel use standard Cocoa controls |
| **Graphics** | Metal | Apple's high-performance GPU API |
| **Input** | `NSEvent` | macOS events translate directly to Wayland keycodes |

Because Wawona uses actual `NSWindow` objects, Wayland applications get native macOS window management — snapping, resizing, Mission Control, Stage Manager, and full-screen transitions all work out of the box.

---

## The Rendering Pipeline

### Surface Management

Each Wayland client creates surfaces. In Wawona, these map directly to CoreAnimation layers:

1. **`WawonaSurfaceLayer`** — Objective-C wrapper managing the surface lifecycle
2. **`CAMetalLayer`** — Hardware-accelerated rendering layer

### Zero-Copy via IOSurface

Wawona uses `IOSurface` for high-performance buffer sharing:

1. **Client Submission**: Wayland client writes pixel data to a shared buffer
2. **Surface Wrapping**: Wawona wraps the buffer in an `IOSurfaceRef`, accessible by the GPU
3. **Zero-Copy Rendering**: Metal reads directly from the `IOSurface` — no CPU copies

This minimizes latency and battery drain.

### Metal Compositing

The final output is composited using custom Metal shaders:

- **MSL Shaders**: Handle texture sampling, alpha blending, and scaling
- **V-Sync**: `CVDisplayLink` synchronizes rendering with the display refresh rate

---

## The Rust–Apple Bridge

```
┌─────────────────────────────────────┐
│  Apple Frontend (Objective-C)       │
│  NSApplication → WawonaWindow →    │
│  CompositorView → Metal Renderer   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Bridge (UniFFI / C FFI)            │
│  WawonaCompositorBridge             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Rust Core (src/core/*)             │
│  Protocol Handler → Surface State  │
│  → Client Management               │
└─────────────────────────────────────┘
```

- **Rust Core**: Manages Wayland protocol state and client communication
- **Objective-C Frontend**: Manages window server integration, system events, and rendering
- **UniFFI**: High-speed binding between Rust and Objective-C

---

## GPU Acceleration (DMABUF via IOSurface)

For hardware-accelerated clients (e.g., Weston with GL), Wawona implements a custom zero-copy path:

1. **Allocation**: Client (via Mesa/Waypipe) allocates an `IOSurface`, sends its global ID in the modifier field of `zwp_linux_dmabuf_v1`
2. **Intercept**: Rust core detects the custom modifier, extracts the ID, creates `BufferType::Native`
3. **Scanout**: ID passed to macOS frontend via FFI
4. **Zero-Copy**: Objective-C bridge performs `IOSurfaceLookup` and assigns directly to `CAMetalLayer.contents`

---

## Window Decorations

Wawona implements `zxdg_decoration_manager_v1` with three policies:

| Policy | Behavior |
|--------|----------|
| **Prefer Client** | Client draws its own titlebar (CSD) |
| **Prefer Server** | Wawona draws macOS-native titlebar (SSD) |
| **Force Server** | Always use macOS titlebar, regardless of client preference |

When Force SSD is enabled, the compositor sends `configure(server_side)` and the host draws the only window chrome. Clients must not draw CSD.

Configure in **Settings → Display → Force Server-Side Decorations**.

---

## Liquid Glass

Wawona implements Apple's **Liquid Glass** design language using `NSVisualEffectView`, providing vibrant, translucent, depth-aware window chrome that adapts to content behind it.

---

## Performance Benefits

- **Low Latency**: `IOSurface` + Metal bypass traditional buffer copy bottlenecks
- **Battery Efficiency**: Native hardware acceleration reduces CPU overhead
- **System Integration**: Full support for Mission Control, Stage Manager, keyboard shortcuts
- **Retina**: Automatic HiDPI scaling via the compositor's Auto Scale setting
