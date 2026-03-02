+++
title = "Android Architecture"
date = 2026-02-22
weight = 10
+++

# Android Architecture

How Wawona runs on Android — Kotlin frontend, JNI bridge, Vulkan rendering, and SSH binary bundling.

---

## Platform Frontend

```
java/com/aspauldingcode/wawona/
├── MainActivity.kt         # Jetpack Compose host, EdgeToEdge, safe area
├── WawonaSurfaceView.kt    # Touch/key capture, IME InputConnection
├── WawonaNative.kt         # JNI external declarations
├── FabMenu.kt              # Material 3 FAB — Settings, Waypipe actions
├── SettingsScreen.kt       # SSH host/user/command config
└── Theme.kt                # Material 3 Expressive theming
```

The native side (`android_jni.c`) handles Vulkan init, render threading, input dispatch, waypipe threads, and SSH binary resolution.

---

## Data Flow

### Input

```
MotionEvent / KeyEvent
  → WawonaSurfaceView (Kotlin)
    → JNI (nativeTouchDown / nativeKeyEvent)
      → WWNCoreInjectTouch* / WWNCoreInjectKey (Rust FFI)
        → Wayland protocol handlers → surface commits
```

### Rendering

```
Render loop (C pthread in android_jni.c):
  WWNCoreProcessEvents
    → WWNCoreGetRenderScene
      → iterate CRenderNode[]
        → Vulkan textured quad draw (SHM → VkImage upload)
          → WWNCoreNotifyFramePresented per node
            → WWNRenderSceneFree
```

### Waypipe + SSH

```
SharedPreferences → nativeRunWaypipe
  → resolve_ssh_binary_paths()
    → dladdr() finds native lib dir
      → waypipe_main(argc, argv) [Rust entry point]
        → SSH bridge thread: fork() → exec(ssh_bin_path) [Dropbear]
          → SSHPASS env var → remote waypipe server
```

---

## SSH Binary Bundling

Android doesn't ship with SSH tools. Wawona bundles **Dropbear SSH** and **sshpass** as static ARM64 executables:

| Step | What Happens |
|------|-------------|
| **Build-time** | Nix cross-compiles Dropbear and sshpass for `aarch64-linux-android` |
| **APK bundling** | Binaries packaged as `libssh_bin.so` / `libsshpass_bin.so` in `jniLibs/arm64-v8a/` |
| **Runtime** | `AndroidManifest.xml` sets `extractNativeLibs="true"` so Android extracts to `/data/app/.../lib/arm64/` |
| **Path resolution** | `resolve_ssh_binary_paths()` uses `dladdr()` to find the native lib directory |
| **Execution** | SSH bridge thread uses `exec()` with absolute paths to the extracted binaries |

---

## Android-Specific Dependencies

| Library | Purpose |
|---------|---------|
| xkbcommon | Keyboard keymaps (XKB) |
| openssl | TLS/crypto (Dropbear, waypipe) |
| Dropbear SSH | Lightweight SSH client (fork/exec) |
| sshpass | Password automation (optional) |
| libwayland | Wayland protocol library |
| pixman | Pixel manipulation |
| zstd / lz4 | Waypipe compression |

---

## Modifier Accessory Bar

Android includes a **Modifier Accessory Bar** (`ModifierAccessoryBar.kt`) with 1:1 parity to iOS:

**Row 1:** ESC, `` ` ``, TAB, `/`, `—`, HOME, ↑, END, PGUP

**Row 2:** ⇧, CTRL, ALT, ⌘, ←, ↓, →, PGDN, ⌨↓

All modifier keys are sticky (tap to toggle).

---

## Nix Build Pipeline

1. **Cross-compile C deps** — xkbcommon, openssl, libwayland, pixman, etc. for `aarch64-linux-android`
2. **Cross-compile SSH tools** — Dropbear, sshpass as static ARM64 executables
3. **Rust backend** — `libwawona.a` for `aarch64-linux-android` with waypipe
4. **JNI C compilation** — `android_jni.c` compiled and linked with all static deps into `libwawona.so`
5. **APK assembly** — Gradle builds the final APK with Kotlin sources + native libraries
6. **Deploy** — `nix run .#wawona-android` installs via `adb install -r` and launches
