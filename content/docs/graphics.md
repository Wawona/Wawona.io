+++
title = "Graphics Drivers"
date = 2026-02-22
weight = 7
+++

# Graphics Drivers & Validation

Vulkan, OpenGL, and Metal driver configuration for Wawona across macOS, iOS, and Android.

---

## Quick Reference

| Platform | Native Vulkan? | Default Driver | Alternatives |
|----------|---------------|----------------|--------------|
| **macOS** | No (Metal) | MoltenVK | KosmicKrisp |
| **iOS** | No (Metal) | MoltenVK | KosmicKrisp |
| **Android** | Yes | System | SwiftShader, Turnip |

---

## Driver Settings

Configure graphics drivers in **Settings → Graphics**.

### Vulkan Drivers

| Platform | Options | Default |
|----------|---------|---------|
| **macOS** | None, MoltenVK, KosmicKrisp | `moltenvk` |
| **iOS** | None, MoltenVK, KosmicKrisp | `moltenvk` |
| **Android** | None, SwiftShader, Turnip, System | `system` |

- **MoltenVK** — Mature Vulkan-over-Metal implementation
- **KosmicKrisp** — Mesa-based Vulkan-on-Metal (experimental)
- **SwiftShader** — Software Vulkan renderer (fallback)
- **Turnip** — Qualcomm Adreno Vulkan driver

### OpenGL Drivers

| Platform | Options | Default |
|----------|---------|---------|
| **macOS** | None, ANGLE, MoltenGL | `angle` |
| **iOS** | None, ANGLE | `angle` |
| **Android** | None, ANGLE, System | `system` |

---

## Driver Validation (CTS)

Run Khronos Conformance Test Suites to validate your driver:

```bash
# Quick Vulkan probe (JSON output)
nix run .#graphics-smoke

# Full validation (smoke + Vulkan CTS + GL CTS)
nix run .#graphics-validate-macos

# iOS Vulkan CTS (in simulator)
nix run .#vulkan-cts-ios

# Android CTS (requires adb)
nix run .#vulkan-cts-android
nix run .#graphics-validate-android
```

### All CTS Outputs

| Output | Platform | Description |
|--------|----------|-------------|
| `graphics-smoke` | macOS | Vulkan probe, JSON output |
| `graphics-validate-macos` | macOS | Full validation suite |
| `graphics-validate-ios` | macOS host | iOS Simulator Vulkan CTS |
| `graphics-validate-android` | Any | Android CTS via adb |
| `vulkan-cts` | macOS | Khronos Vulkan CTS |
| `gl-cts` | macOS | Khronos OpenGL/GLES CTS |

Results are saved in `./graphics-validate-results/`.

---

## macOS Driver Override

Override the Vulkan driver via environment variable:

```bash
# Use MoltenVK explicitly
VK_DRIVER_FILES=/path/to/MoltenVK_icd.json nix run .#graphics-smoke
```

---

## iOS Static Drivers

All iOS graphics drivers must be **static libraries** (`.a`) — dynamic libraries are not allowed by Apple.

| Driver | Purpose |
|--------|---------|
| KosmicKrisp | Vulkan over Metal |
| MoltenVK | Vulkan over Metal |
| ANGLE | OpenGL ES over Metal |

Only one Vulkan implementation can be linked at build time.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "No Vulkan loader" | Ensure vulkan-loader in closure; use MoltenVK or KosmicKrisp |
| "deqp-vk not found" | Run `nix build .#vulkan-cts` first |
| iOS simulator not booting | Install iOS runtime via Xcode: `xcrun simctl list runtimes` |
| Android "device offline" | `adb kill-server && adb start-server` |
| GL CTS missing data | Ensure `--deqp-archive-dir` points to built archive |
