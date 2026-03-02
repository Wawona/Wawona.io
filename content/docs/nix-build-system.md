+++
title = "Nix Build System"
date = 2026-02-22
weight = 11
+++

# Nix Build System

How Nix compiles everything in Wawona — from native C libraries to Rust backends to final app bundles for macOS, iOS, and Android.

---

## Why Nix?

Nix provides **hermetic, reproducible builds** with a single dependency. No vendored source code, no global system pollution. Every artifact is content-addressed and cached independently.

---

## Three-Layer Architecture

```
┌──────────────────────────────────────────────────┐
│  Layer 3: App Packaging                          │
│  .app bundles, Xcode projects, Gradle projects   │
├──────────────────────────────────────────────────┤
│  Layer 2: Rust Backend (crate2nix)               │
│  Per-crate Nix derivations for incremental       │
│  builds — only changed crates rebuild            │
├──────────────────────────────────────────────────┤
│  Layer 1: Native C/C++ Libraries                 │
│  libwayland, xkbcommon, ffmpeg, zstd, lz4,       │
│  openssl, libssh2, mbedtls, etc.                 │
└──────────────────────────────────────────────────┘
```

---

## Layer 1: Native Libraries

Each library has per-platform `.nix` files in `dependencies/libs/`:

```
dependencies/libs/
├── ffmpeg/        # android.nix, ios.nix, macos.nix
├── libssh2/       # android.nix, ios.nix
├── libwayland/    # android.nix, ios.nix, macos.nix
├── lz4/           # android.nix, ios.nix, macos.nix
├── openssl/       # android.nix, ios.nix
├── waypipe/       # ios.nix, macos.nix, android.nix
├── xkbcommon/     # android.nix, ios.nix, macos.nix
├── zstd/          # android.nix, ios.nix, macos.nix
└── ...
```

The `dependencies/toolchains/default.nix` dispatcher exports:
- `buildForIOS name entry` — dispatches to `libs/<name>/ios.nix`
- `buildForMacOS name entry` — dispatches to `libs/<name>/macos.nix`
- `buildForAndroid name entry` — dispatches to `libs/<name>/android.nix`

Each library is a standalone Nix derivation. Changing `zstd` does not rebuild `openssl`.

---

## Layer 2: Rust Backend (crate2nix)

### Why crate2nix?

The previous `buildRustPackage` approach treated the entire workspace as a single derivation — any Rust change forced a full rebuild.

**crate2nix** generates a separate Nix derivation for every crate in `Cargo.lock`. Nix caches each independently. Changing one crate only rebuilds that crate and its reverse dependencies.

### The Pipeline

```
Cargo.toml + Cargo.lock
        │
        ▼
crate2nix generates Cargo.nix
        │
        ▼
Per-crate Nix derivations (~120 crates)
        │
        ▼
Final libwawona.a / libwawona.so
```

### Cross-Compilation

| Platform | Cargo Target | Strategy |
|----------|-------------|----------|
| macOS | Native (no `--target`) | Direct build |
| iOS device | `aarch64-apple-ios` | Override `stdenv.hostPlatform` |
| iOS simulator | `aarch64-apple-ios-sim` | Override `stdenv.hostPlatform` |
| Android | `aarch64-linux-android` | NDK toolchain via override |

For iOS/Android, Nix overrides `stdenv.hostPlatform` so that `buildRustCrate` correctly sets `TARGET`, `CARGO_CFG_TARGET_OS`, and the `--target` flag.

### Features by Platform

| Platform | Enabled Features | Why |
|----------|-----------------|-----|
| macOS | (none) | No waypipe in macOS backend |
| iOS | `waypipe-ssh` | In-process waypipe with static libssh2 |
| Android | `waypipe` | In-process waypipe |

---

## Layer 3: App Packaging

### macOS

Standard `mkDerivation` that compiles Obj-C sources and links against the Rust backend. Produces a `.app` bundle.

### iOS

Two stages:
1. **Nix build**: Compiles Obj-C, links `libwawona.a` + native C libs into `.app`
2. **Simulator automation**: Generates Xcode project via `xcodegen.nix`, builds with `xcodebuild`, installs, launches, attaches LLDB

### Android

Compiles JNI C code, links native libraries, bundles SSH binaries, and uses Gradle for final APK assembly.

### Project Generators

| Generator | Nix Module | Output |
|-----------|-----------|--------|
| XcodeGen | `dependencies/generators/xcodegen.nix` | `Wawona.xcodeproj` |
| GradleGen | `dependencies/generators/gradlegen.nix` | Gradle project files |

---

## Caching Behavior

| Change | Rebuild Scope |
|--------|--------------|
| Rust source in `src/` | Only `wawona` crate + final assembly |
| Waypipe source | `waypipe` crate + `wawona` crate |
| Native C library (e.g. zstd) | That library + crates linking it |
| `flake.nix` or `rust-backend-c2n.nix` | May invalidate crate2nix generation (full rebuild) |
| Switch platform (e.g. iOS sim → device) | Full rebuild (target triple change) |

---

## Build Commands

| Command | Description |
|---------|-------------|
| `nix run` | macOS app (build + launch) |
| `nix run .#wawona-ios` | iOS Simulator (xcodegen + build + run) |
| `nix run .#wawona-android` | Android app |
| `nix build .#wawona-macos-backend` | macOS Rust static library |
| `nix build .#wawona-ios-backend` | iOS device Rust static library |
| `nix build .#wawona-ios-sim-backend` | iOS sim Rust static library |
| `nix build .#wawona-android-backend` | Android Rust shared library |
| `nix run .#xcodegen` | Generate Xcode project (iOS + macOS) |
| `nix run .#xcodegen-ios` | Generate Xcode project (iOS only) |
| `nix run .#gradlegen` | Generate Gradle project |

---

## Flake Inputs

| Input | Purpose |
|-------|---------|
| `nixpkgs` | Base package set (unstable) |
| `rust-overlay` | Rust toolchain with iOS/Android targets |
| `crate2nix` | Per-crate Nix derivation generator |

---

## Key Files

| File | Role |
|------|------|
| `flake.nix` | Top-level: inputs, overlays, all packages |
| `dependencies/wawona/rust-backend-c2n.nix` | crate2nix Rust backend |
| `dependencies/wawona/workspace-src.nix` | Cargo workspace assembly |
| `dependencies/wawona/ios.nix` | iOS app bundle + simulator automation |
| `dependencies/wawona/macos.nix` | macOS app bundle |
| `dependencies/wawona/android.nix` | Android project |
| `dependencies/toolchains/default.nix` | Platform dispatcher |
| `dependencies/generators/xcodegen.nix` | Xcode project generator |
| `dependencies/generators/gradlegen.nix` | Gradle project generator |
