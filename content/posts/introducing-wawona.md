+++
title = "Introducing Wawona: A Nested Wayland Compositor for macOS"
date = 2026-02-22
[extra]
author = "The Wawona Team"
+++

Wawona isn’t just another display server—it is a native Wayland substrate designed from the ground up for the Apple and Android ecosystems. We are bringing high-performance, bare-metal Wayland execution to the hardware where it was previously impossible.

## Why Wawona?

For years, running Wayland applications on a Mac meant living in a Virtual Machine or a slow emulation layer. Wawona changes that. By implementing a native Wayland compositor in Rust and targeting platform-native graphics APIs, we provide a bridge between the Linux ecosystem and Apple/Android hardware without the overhead of a guest OS.

## High-Performance Architecture

Wawona is built on three core pillars that ensure it feels like a first-class citizen on every platform it touches:

### 1. The Rust Core
The heart of Wawona is a shared Rust backend managing the complex state of a Wayland compositor. With over **186 Rust crates** integrated into our core, we handle everything from protocol registration to internal surface management with memory safety and high concurrency.

### 2. Native Graphics Frontends
We don't rely on generic abstraction layers.
- **Liquid Glass (macOS & iOS)**: A bespoke Metal-based rendering engine that leverages **zero-copy IOSurface integration** for near-instant frame delivery.
- **Android Vulkan**: A specialized Vulkan frontend designed for the mobile GPU pipeline.

### 3. The Nix Build System
Developing across Three platforms (macOS, iOS, Android) usually requires a nightmare of SDK management. Wawona uses **Nix** to provide a hermetic, reproducible environment. We cross-compile **27 native C/C++ libraries** (like FFmpeg, OpenSSL, and Weston) for every target automatically.

## Beyond macOS

While Wawona started as a macOS project, our vision is multi-platform. 
- **iOS**: A native iPadOS/iOS app that turns your mobile device into a portable Wayland workstation.
- **Android**: A Kotlin/JNI frontend that bundles its own Dropbear SSH and Vulkan rendering stack.

## Getting Started

Wawona is currently in active development (v0.2.x). Whether you are looking to run remote apps via **Waypipe** or test native Wayland clients locally, we are building the fastest way to bridge your Linux-style workflows into the hardware you love.

[Read our Documentation](/docs/getting-started/) to start building, or check the [FAQ](/faq/) for deep-dives into our architecture.
