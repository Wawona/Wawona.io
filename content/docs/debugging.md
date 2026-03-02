+++
title = "Debugging"
date = 2026-02-22
weight = 9
+++

# Debugging

Launch Wawona under LLDB on macOS, iOS, or Android using the `--debug` flag.

---

## Quick Reference

```bash
nix run .#wawona-macos -- --debug     # macOS
nix run .#wawona-ios -- --debug       # iOS Simulator
nix run .#wawona-android -- --debug   # Android
```

---

## macOS

```bash
nix run .#wawona-macos -- --debug
```

- Wawona starts **under LLDB** from the beginning
- You can set breakpoints before typing `run`
- On exit, LLDB prints a full backtrace (`bt all`)
- **Alternative:** `WAWONA_LLDB=1 nix run .#wawona-macos`

---

## iOS Simulator

```bash
nix run .#wawona-ios -- --debug
```

1. Simulator boots and Wawona.app is installed
2. App launches with `--wait-for-debugger` (paused at spawn)
3. LLDB attaches to the app PID
4. dSYM is loaded for symbols (if present)
5. Simulator logs stream in the background

Type `continue` in LLDB to resume execution.

---

## Android

```bash
nix run .#wawona-android -- --debug
```

1. Emulator starts (or uses existing device)
2. App launches with `am start -D` (waits for debugger)
3. `lldb-server` is pushed to the device and started
4. LLDB connects via `gdb-remote` on port 5039
5. Java VM resumes after ~4 seconds; native code runs under LLDB

**Requirements:** `adb` and `emulator` in PATH; device/emulator with USB debugging enabled.

On crash, LLDB stops and gives an interactive prompt. Use `bt` for backtrace.
