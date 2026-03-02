+++
title = "Getting Started"
date = 2026-02-22
weight = 1
+++

# Getting Started with Wawona

Wawona is a native Wayland compositor for **macOS**, **iOS**, and **Android**. Whether you want to run Wayland apps on your Mac or contribute to the project, this guide will get you up and running.

---

## For Users

### What You Need

- An **Apple Silicon Mac** (M1 or later)
- **Nix** package manager with flakes enabled

### Install Nix

We recommend [**Determinate Nix**](https://determinate.systems/nix-installer/) — it enables flakes out of the box, so there's no extra configuration:

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

### Run Wawona

Clone the repository and run:

```bash
git clone https://github.com/aspauldingcode/Wawona
cd Wawona
nix run
```

That's it — Nix handles all dependencies. The macOS app will build and launch automatically.

### Run Wayland Apps

Once Wawona is running, you can launch Wayland clients:

```bash
# Weston terminal (built from source via Nix)
nix run .#weston-terminal

# Full Weston compositor (nested inside Wawona)
nix run .#weston
```

For remote apps over SSH, see the [Waypipe guide](/docs/waypipe/).

---

## For Developers

### Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Apple Silicon Mac** | M1, M2, M3, or M4 |
| **Nix** (with flakes) | [Determinate Nix](https://determinate.systems/nix-installer/) recommended |
| **Xcode** | Required for iOS builds and code signing |

### Build & Run

| Command | What it does |
|---------|-------------|
| `nix run` | Build + launch macOS app |
| `nix run .#wawona-ios` | Build + launch on iOS Simulator |
| `nix run .#wawona-android` | Build + install on Android device/emulator |

### Build Only (No Launch)

```bash
nix build .#wawona-macos          # macOS .app bundle
nix build .#wawona-ios-backend    # iOS Rust static library
nix build .#wawona-android-backend # Android Rust shared library
```

### Generate Xcode Project

To open the project in Xcode (for debugging, profiling, or deploying to a physical device):

```bash
nix run .#xcodegen       # Generate Wawona.xcodeproj (iOS + macOS targets)
nix run .#xcodegen-ios   # iOS target only
open Wawona.xcodeproj
```

### Generate Gradle Project (Android)

```bash
nix run .#gradlegen
```

---

## Setting Up Your Team ID (iOS Device Deployment)

To deploy Wawona to a physical iOS device, you need an Apple Development Team ID for code signing. Here's the workflow:

### 1. Find Your Team ID

If you don't know your Team ID, the easiest way to find it:

1. Run `nix run .#xcodegen` to generate the Xcode project
2. Open `Wawona.xcodeproj` in Xcode
3. Go to **Signing & Capabilities** for the Wawona-iOS target
4. Sign in with your Apple ID and select your development team
5. Xcode writes your Team ID into the `.xcodeproj` — you can find it there (look for `DEVELOPMENT_TEAM` in the `.pbxproj` file)

### 2. Save Your Team ID

Create a `.envrc` file in the project root (this file is gitignored):

```bash
echo 'export TEAM_ID="YOUR_TEAM_ID_HERE"' > .envrc
```

Replace `YOUR_TEAM_ID_HERE` with the Team ID you found (e.g., `G6EJA4DJKW`).

### 3. Use the Dev Shell

Enter the Nix development shell, which automatically reads your Team ID from `.envrc`:

```bash
nix develop
```

You'll see `Loaded TEAM_ID from .envrc.` confirming it worked.

### 4. Generate With Signing

Now, from inside the dev shell, run xcodegen:

```bash
nix run .#xcodegen
```

Your Team ID is automatically injected into the generated `.xcodeproj` — no need to manually navigate to Signing & Capabilities in Xcode every time. Just open the project and build to your device.

> **Tip:** Once your `.envrc` is set up, the workflow is just `nix develop` → `nix run .#xcodegen` → open in Xcode → build to device. Your signing identity is preserved across project regenerations.

---

## Dev Shell

The Nix dev shell provides a complete development environment with all tools and environment variables pre-configured:

```bash
nix develop
```

This gives you:
- Rust toolchain with iOS, macOS, and Android cross-compilation targets
- `XDG_RUNTIME_DIR` and `WAYLAND_DISPLAY` set for local testing
- Your `TEAM_ID` loaded from `.envrc` for code signing
- All native dependencies available

---

## Useful Nix Flags

| Flag | Purpose |
|------|---------|
| `-L` | Show full build logs |
| `--show-trace` | Stack trace on Nix evaluation errors |
| `--rebuild` | Force rebuild (ignore cache) |

---

## Next Steps

- [Usage Guide](/docs/usage/) — run Weston, waypipe, connect clients
- [Architecture](/docs/architecture/) — understand the Rust core + native frontend design
- [Compilation Reference](/docs/compilation/) — deep dive into the Nix build system
- [Settings Reference](/docs/settings/) — all configurable options