+++
title = "Settings Reference"
date = 2026-02-22
weight = 5
+++

# Settings Reference

All configurable settings in Wawona, organized by category. Settings are available on macOS, iOS, and Android unless noted otherwise.

---

## Display

| Setting | Default | Platforms | Description |
|---------|---------|-----------|-------------|
| **Force Server-Side Decorations** | Off (macOS/iOS), On (Android) | All | Compositor draws window borders; clients don't draw their own titlebar |
| **Auto Scale** | On | All | Match platform UI scaling (Retina, Android density) |
| **Respect Safe Area** | On | All | Avoid notches, Dynamic Island, display cutouts |
| **Show macOS Cursor** | Off | macOS | Toggle visibility of the macOS system cursor |

---

## Graphics

| Setting | Default | Platforms | Description |
|---------|---------|-----------|-------------|
| **Vulkan Driver** | `moltenvk` (macOS/iOS), `system` (Android) | All | Vulkan implementation. macOS/iOS: None, MoltenVK, KosmicKrisp. Android: None, SwiftShader, Turnip, System |
| **OpenGL Driver** | `angle` (macOS/iOS), `system` (Android) | All | OpenGL/GLES implementation. macOS: None, ANGLE, MoltenGL. iOS: None, ANGLE. Android: None, ANGLE, System |
| **DmaBuf Support** | On | All | Zero-copy texture sharing between clients |

---

## Input

| Setting | Default | Platforms | Description |
|---------|---------|-----------|-------------|
| **Touch Input Type** | Multi-Touch | iOS | Multi-Touch (direct) or Touchpad mode (1-finger = pointer, tap = click, 2-finger = scroll) |
| **Touchpad Mode** | Off | Android | Same behavior as Touchpad on iOS |
| **Swap CMD with ALT** | On | macOS, iOS | Swap Command and Alt keys for Wayland clients |
| **Universal Clipboard** | On | All | Sync clipboard with host platform |
| **Enable Text Assist** | Off | All | Autocorrect, suggestions, smart punctuation |
| **Enable Dictation** | Off | All | Voice dictation to focused Wayland client |

---

## Connection

*macOS and iOS only.*

| Setting | Description |
|---------|-------------|
| **XDG_RUNTIME_DIR** | Runtime directory for Wayland socket (read-only) |
| **WAYLAND_DISPLAY** | Socket name, e.g. `wayland-0` (read-only) |
| **Socket Path** | Full path to Wayland socket (read-only) |
| **Shell Setup** | Copy-paste `export` commands for your terminal (read-only) |
| **TCP Port** | Port for TCP listener (default: 6000) |

---

## Advanced

| Setting | Default | Platforms | Description |
|---------|---------|-----------|-------------|
| **Color Operations** | Off (macOS/iOS), On (Android) | All | Color profiles, HDR requests |
| **Nested Compositors** | On | All | Support nested Wayland compositors |
| **Multiple Clients** | On (macOS), Off (mobile) | All | Allow multiple Wayland clients simultaneously |
| **Enable Launcher** | Off | All | Start built-in Wayland shell |
| **Enable Native Weston** | Off | All | Start full Weston compositor on launch |
| **Enable Weston Terminal** | Off | All | Start weston-terminal on launch |
| **Enable Weston Simple SHM** | Off | All | Start weston-simple-shm on launch |

---

## Waypipe

| Setting | Default | Description |
|---------|---------|-------------|
| **Display Number** | 0 | Display number (0 = wayland-0) |
| **Socket Path** | Platform-specific | Unix socket path |
| **Compression** | lz4 | none, lz4, zstd |
| **Compression Level** | 7 | Zstd level (1–22) |
| **Threads** | 0 (auto) | Worker thread count |
| **Video Compression** | none | none, h264, vp9, av1 |
| **Remote Command** | — | Command to run remotely (e.g. `weston-terminal`) |
| **Debug Mode** | Off | Verbose waypipe logging |
| **Disable GPU** | Off | Force software rendering |
| **One-shot** | Off | Exit when client disconnects |
| **Login Shell** | Off | Run in login shell on remote |

---

## SSH

| Setting | Default | Description |
|---------|---------|-------------|
| **SSH Host** | — | Remote host IP or hostname |
| **SSH User** | — | SSH username |
| **Auth Method** | Password | Password or Public Key |
| **Password** | — | SSH password |
| **Key Path** | `~/.ssh/id_ed25519` | Path to private key |
| **Key Passphrase** | — | Passphrase for encrypted key |

---

## Platform Defaults Summary

| Setting | macOS | iOS | Android |
|---------|-------|-----|---------|
| Force SSD | Off | Off | On |
| Multiple Clients | On | Off | Off |
| Vulkan Driver | moltenvk | moltenvk | system |
| OpenGL Driver | angle | angle | system |

---

## Storage

- **macOS / iOS**: `NSUserDefaults` (UserDefaults)
- **Android**: `SharedPreferences`
