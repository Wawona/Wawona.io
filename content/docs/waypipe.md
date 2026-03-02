+++
title = "Waypipe Guide"
date = 2026-02-22
weight = 6
+++

# Waypipe Guide

Waypipe forwards Wayland applications over SSH. Run apps on a remote Linux or Mac machine and display them on your device running Wawona.

---

## Platform Overview

| Platform | SSH Transport | Buffer Path | Status |
|----------|--------------|-------------|--------|
| **macOS** | OpenSSH (process spawn) | IOSurface → Metal | Working |
| **iOS** | libssh2 (in-process) | IOSurface → Metal | Working |
| **Android** | Dropbear SSH (fork/exec) | SHM → Vulkan | Working |

---

## Quick Start

### macOS (Command Line)

With Wawona running:

```bash
export XDG_RUNTIME_DIR="/tmp/wawona-$(id -u)"
export WAYLAND_DISPLAY="wayland-0"

nix run .#waypipe -- ssh user@remote-host weston-terminal
```

### iOS / Android (In-App)

1. Open **Wawona** → **Settings** → **Waypipe** (or **SSH**)
2. **SSH Host**: IP address or hostname of the remote machine
3. **SSH User**: Your username on the remote
4. **SSH Password**: Your login password (or configure Public Key auth)
5. **Remote Command**: The app to run, e.g., `nix run ~/Wawona#weston-terminal`
6. Tap **Start Waypipe**

### Prepare a Remote Mac

```bash
bash scripts/prepare_mac_remote.sh
```

This checks that Remote Login (SSH) is enabled, Python 3 is installed, and Waypipe is available.

---

## Remote Command Examples

| Command | Description |
|---------|-------------|
| `nix run ~/Wawona#weston-terminal` | Weston Terminal (Wawona repo on remote) |
| `weston-terminal` | Weston Terminal (if installed) |
| `foot` | Foot terminal |
| `nix run ~/Wawona#weston` | Full Weston compositor |
| `geary` | Geary email client |
| `gnome-calculator` | GNOME Calculator |

---

## How It Works

### macOS

Waypipe runs as a local process that connects to Wawona's Wayland socket, then spawns an SSH connection to the remote host. The remote waypipe server captures Wayland protocol data and forwards it through the SSH tunnel.

Buffer sharing uses **IOSurface** for zero-copy Metal rendering.

### iOS — libssh2 + Streamlocal

iOS can't spawn processes, so Wawona uses **libssh2** in-process with `streamlocal-forward@openssh.com`:

```
iOS App                        SSH                          Remote
──────────────────────────────────────────────────────────────────
1. connect_ssh2()
   ├── TCP connect + handshake + auth
   ├── streamlocal-forward  ──────►  sshd creates
   │   (path=/tmp/wp-XXX.sock)       /tmp/wp-XXX.sock
   │
   ├── exec channel:  ──────────►  waypipe --socket
   │   waypipe server -- <app>       /tmp/wp-XXX.sock
   │                                 server -- <app>
   │
   └── bridge thread: pumps data
       forwarded channel ↔ local socket
```

**Remote requirements:** Stock waypipe + OpenSSH ≥ 6.7. No socat, nc, or patched tools needed.

### Android — Dropbear SSH

Android bundles **Dropbear SSH** (lightweight SSH client) as a static ARM64 executable:

1. SSH binaries packaged as `libssh_bin.so` / `libsshpass_bin.so` in the APK
2. Android extracts them at install time
3. Waypipe Rust backend exposes `waypipe_main()` for JNI
4. SSH bridge thread: `fork()` → `exec(dbclient)` with `SSHPASS` env

---

## Compression

| Option | Speed | Ratio | Use Case |
|--------|-------|-------|----------|
| **none** | Fastest | 1:1 | Local network |
| **lz4** (default) | Fast | Good | General use |
| **zstd** | Slower | Better | Slow connections |

Configure in **Settings → Waypipe → Compression**.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "streamlocal-forward failed" | Check `AllowStreamLocalForwarding` in `sshd_config` (default: yes) |
| "Timed out waiting for channel" | Verify waypipe is installed and in PATH on remote |
| "Missing Wayland socket" | Start a Wayland compositor on the remote first |
| Remote command not found | Use full path: `nix run ~/Wawona#weston-terminal` |
| Black screen after connect | Check that the remote app supports Wayland |
