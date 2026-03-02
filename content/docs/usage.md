+++
title = "Usage Guide"
date = 2026-02-22
weight = 3
+++

# Usage Guide

How to run Wayland apps with Wawona — locally and remotely.

---

## Native Weston on macOS

Wawona includes a **native port of Weston** for macOS. No Linux, no VM — Weston runs as a nested compositor client inside Wawona.

### Weston (Full Compositor)

```bash
nix run .#weston
```

Launches the full Weston compositor as a nested client inside Wawona's Wayland session.

### Weston Terminal

```bash
nix run .#weston-terminal
```

Launches Weston Terminal — a native Wayland terminal client connected to Wawona's display.

### Other Weston Clients

```bash
nix run .#weston-debug         # Weston debug client
nix run .#weston-simple-shm    # Simple SHM test client
```

### Enable Bundled Clients From Settings

You can also enable Weston and other bundled clients to **auto-launch** when Wawona starts — no terminal needed:

1. Open **Wawona** → **Settings** → **Advanced**
2. Toggle on any combination:
   - **Enable Native Weston** — starts the full Weston nested compositor
   - **Enable Weston Terminal** — starts a weston-terminal client
   - **Enable Weston Simple SHM** — starts the simple SHM test client

This works on **macOS, iOS, and Android** — useful when you don't have terminal access (mobile) or want clients to start automatically.

---

## Connecting Wayland Clients Locally

When Wawona is running, any Wayland client can connect via the Wayland socket.

### Set Up Your Shell

```bash
export XDG_RUNTIME_DIR="/tmp/wawona-$(id -u)"
export WAYLAND_DISPLAY="wayland-0"
```

You can also find these values in **Settings → Connection** inside the Wawona app.

### Run a Client

```bash
# With the exports above, run any Wayland client:
nix run .#weston-terminal
nix run .#foot
```

---

## Waypipe: Remote Wayland Apps

Waypipe forwards Wayland applications over SSH. Run apps on a remote machine and display them on your device.

### Quick Start (macOS)

1. Make sure Wawona is running
2. Set up your shell (see above)
3. Run waypipe:

```bash
nix run .#waypipe -- ssh user@remote-host weston-terminal
```

### Quick Start (iOS / Android)

1. Open **Wawona** → **Settings** → **Waypipe**
2. Set **SSH Host**, **SSH User**, **SSH Password**
3. Set **Remote Command** (e.g., `nix run ~/Wawona#weston-terminal`)
4. Tap **Start Waypipe**

### Remote Command Examples

| Command | Description |
|---------|-------------|
| `nix run ~/Wawona#weston-terminal` | Weston Terminal (if Wawona repo on remote) |
| `weston-terminal` | Weston Terminal (if installed on remote) |
| `foot` | Foot terminal |
| `nix run ~/Wawona#weston` | Full Weston compositor |
| `gnome-calculator` | GNOME Calculator |

### Prepare a Remote Mac

If your remote host is a Mac:

```bash
bash scripts/prepare_mac_remote.sh
```

This verifies Remote Login (SSH) is enabled, Waypipe is available, and Weston Terminal is buildable.

For detailed waypipe configuration, see [Waypipe Guide](/docs/waypipe/).

---

## Platform Notes

| Platform | Local Weston | Waypipe Transport |
|----------|-------------|-------------------|
| **macOS** | `nix run .#weston`, `.#weston-terminal` | OpenSSH (process spawn) |
| **iOS** | Via Settings → Advanced toggles | libssh2 (in-process) |
| **Android** | Via Settings → Advanced toggles | Dropbear SSH (fork/exec) |

On iOS and Android, enable **Native Weston** and **Weston Terminal** in **Settings → Advanced** to auto-launch on app start.
