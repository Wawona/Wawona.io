+++
title = "Compilation Reference"
date = 2026-02-22
weight = 4
+++

# Compilation Reference

Wawona uses **Nix Flakes** for all builds across macOS, iOS, and Android. Nix is the only build dependency — it manages the Rust toolchain, native C/C++ libraries, and app packaging.

---

## Quick Build

```bash
# macOS app — build and launch
nix run

# iOS Simulator — build, install, and launch
nix run .#wawona-ios

# Android — build APK, install, and launch
nix run .#wawona-android
```

## Build Only (No Launch)

```bash
nix build .#wawona-macos            # macOS .app bundle
nix build .#wawona-macos-backend    # macOS Rust static library only
nix build .#wawona-ios-backend      # iOS device Rust static library
nix build .#wawona-ios-sim-backend  # iOS simulator Rust static library
nix build .#wawona-android-backend  # Android Rust shared library
```

---

## Project Generators

Generate IDE projects that reference the Nix-built libraries:

```bash
nix run .#xcodegen       # Generate Wawona.xcodeproj (iOS + macOS)
nix run .#xcodegen-ios   # iOS target only
nix run .#gradlegen      # Generate Gradle project for Android
```

After generating, open the project in your IDE:

```bash
open Wawona.xcodeproj    # Xcode
```

See [Getting Started — Team ID](/docs/getting-started/) for automatic code signing setup.

---

## Common Nix Flags

| Flag | Purpose |
|------|---------|
| `-L` | Show full build logs |
| `--show-trace` | Stack trace on Nix evaluation errors |
| `--rebuild` | Force rebuild (ignore cache) |

Example:

```bash
nix run .#wawona-ios -L --show-trace
```

---

## Debug Builds

Add `--debug` to launch under LLDB:

```bash
nix run .#wawona-macos -- --debug     # macOS — LLDB from start
nix run .#wawona-ios -- --debug       # iOS — pause at spawn, LLDB attaches
nix run .#wawona-android -- --debug   # Android — lldb-server, remote attach
```

See [Debugging Guide](/docs/debugging/) for details.

---

## Dev Shell

Enter a full development environment with all tools pre-configured:

```bash
nix develop
```

The dev shell provides:
- Rust toolchain with cross-compilation targets (iOS, Android)
- `XDG_RUNTIME_DIR` and `WAYLAND_DISPLAY` pre-set
- `TEAM_ID` loaded from `.envrc` for code signing
- All native libraries and build tools

---

## How the Build Works

The Nix build pipeline has three layers:

```
┌─────────────────────────────────────────────┐
│  Layer 3: App Packaging                     │
│  .app bundles, .xcodeproj, Gradle project   │
├─────────────────────────────────────────────┤
│  Layer 2: Rust Backend (crate2nix)          │
│  Per-crate Nix derivations for incremental  │
│  builds — only changed crates rebuild       │
├─────────────────────────────────────────────┤
│  Layer 1: Native C/C++ Libraries            │
│  libwayland, xkbcommon, ffmpeg, zstd, lz4,  │
│  openssl, libssh2, etc.                     │
└─────────────────────────────────────────────┘
```

Each crate and library is its own Nix derivation, cached independently. Changing a Rust source file only rebuilds the root `wawona` crate — all ~120 dependency crates are served from cache.

For the full Nix pipeline deep dive, see [Nix Build System](/docs/nix-build-system/).

---

## Requirements Summary

| Requirement | When Needed |
|-------------|-------------|
| Apple Silicon Mac | Always |
| Nix with flakes | Always ([Determinate Nix](https://determinate.systems/nix-installer/) recommended) |
| Xcode | iOS builds |
| `.envrc` with `TEAM_ID` | iOS device deployment |
| `adb` + Android emulator | Android builds |
