+++
title = "FAQ"
render = true
sort_by = "none"
template = "faq_section.html"
+++

<style>
.faq-content details {
    margin-bottom: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--bg-1);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
    scroll-margin-top: 100px;
}

.faq-content details[open] {
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.faq-content details summary {
    padding: 1rem 1.25rem;
    font-weight: 600;
    font-size: 1.05rem;
    font-family: var(--header-font);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    user-select: none;
    transition: background-color 0.2s ease;
    background: none;
    border-radius: 10px;
}

.faq-content details summary:hover {
    background-color: var(--bg-2);
    color: inherit;
}

.faq-content details summary::-webkit-details-marker {
    display: none;
}

.faq-content details summary::before {
    content: "▶";
    font-size: 0.7rem;
    color: var(--text-2);
    transition: transform 0.2s ease;
    flex-shrink: 0;
}

.faq-content details[open] summary::before {
    transform: rotate(90deg);
    color: var(--primary-color);
}

.faq-content .faq-share {
    margin-left: auto;
    background: var(--bg-2);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 0.75rem;
    color: var(--text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
    opacity: 0;
}

.faq-content details summary:hover .faq-share {
    opacity: 1;
}

.faq-content .faq-share:hover {
    background: var(--bg-1);
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.faq-content .faq-share svg {
    width: 12px;
    height: 12px;
}

.faq-content .faq-share.copied {
    color: #4CAF50;
    border-color: #4CAF50;
}

.faq-content details .faq-answer {
    padding: 0 1.25rem 1.25rem 1.25rem;
    border-top: 1px solid var(--border-color);
    margin-top: 0;
    font-size: 0.925rem;
    line-height: 1.6;
}

.faq-content details .faq-answer p:first-child {
    margin-top: 1rem;
}

.faq-content details .faq-answer table {
    width: 100%;
    margin: 0.75rem 0;
    font-size: 0.85rem;
}

.faq-content details .faq-answer table th {
    text-align: left;
    font-size: 0.85rem;
    background: var(--bg-2);
}

.faq-category {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-1);
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    font-family: var(--header-font);
    letter-spacing: -0.01em;
}

.faq-category:first-of-type {
    margin-top: 0.5rem;
}

.faq-intro {
    font-size: 1.05rem;
    color: var(--text-1);
    margin-bottom: 1.5rem;
}
</style>

<p class="faq-intro">Common questions about building, running, and developing with Wawona.</p>

<h3 class="faq-category"> Building & Installation</h3>

<details id="nix-build-time">
<summary>
    Why does the Nix build take so long?
    <button class="faq-share" onclick="copyFaqLink(event, 'nix-build-time')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

The first build is slow because Nix compiles **everything from source** — there are no pre-built binaries. Here's what it builds:

**Native C/C++ Libraries (27 packages):**

| Library | Purpose | Approx. Build Size |
|---------|---------|-------------------|
| FFmpeg | Video codec support (waypipe) | ~150 MB |
| OpenSSL | TLS/crypto | ~60 MB |
| KosmicKrisp / MoltenVK | Vulkan-over-Metal | ~200 MB |
| ANGLE | OpenGL-over-Metal | ~180 MB |
| libwayland | Wayland protocol library | ~8 MB |
| xkbcommon | Keyboard layout handling | ~12 MB |
| Weston | Nested compositor + clients | ~40 MB |
| pixman | Pixel manipulation | ~5 MB |
| zstd + lz4 | Compression (waypipe) | ~8 MB |
| freetype + fontconfig | Font rendering | ~25 MB |
| Other (15 libs) | libffi, expat, libxml2, etc. | ~50 MB |

**Rust Backend (186 crates):**

| Component | Crates | Approx. Build Size |
|-----------|--------|-------------------|
| Wayland protocol crates | ~15 | ~30 MB |
| FFI / UniFFI | ~10 | ~15 MB |
| Crypto / networking | ~20 | ~25 MB |
| Serialization / parsing | ~30 | ~20 MB |
| Core utilities | ~111 | ~40 MB |

**Platform Tooling:**

| Tool | Purpose | Approx. Size |
|------|---------|-------------|
| Rust toolchain | Compiler + std for 4 targets | ~800 MB |
| Xcode CLI tools | iOS SDK, simulator runtimes | ~5–15 GB |
| Android NDK + SDK | Cross-compilation, emulator | ~3–8 GB |

**Total first build:** ~30–60 minutes depending on your Mac's CPU and SSD speed.

**Good news:** Subsequent builds are fast (~10–30 seconds) because Nix caches every derivation. Only changed crates rebuild.

</div>
</details>

<details id="storage-space">
<summary>
    Why does Wawona require so much storage space?
    <button class="faq-share" onclick="copyFaqLink(event, 'storage-space')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

Wawona's Nix store footprint is large because it builds an entire graphics stack, compositor, and cross-compilation toolchains from source. Here's the breakdown:

**Per-Platform Storage Estimate:**

| Component | macOS | iOS | Android |
|-----------|-------|-----|---------|
| Rust toolchain (4 targets) | 800 MB | 800 MB | 800 MB |
| Native C/C++ libraries | 750 MB | 900 MB | 700 MB |
| Rust backend (186 crates) | 130 MB | 130 MB | 130 MB |
| App bundle | 60 MB | 80 MB | 120 MB |
| Graphics drivers (CTS, Mesa) | 400 MB | 400 MB | 200 MB |
| Platform SDK (Xcode / NDK) | — | 5–15 GB | 3–8 GB |
| **Subtotal** | **~2.1 GB** | **~7–17 GB** | **~5–10 GB** |

**Why so big?**

1. **No shared system libraries** — Nix builds everything hermetically. Even `zlib` and `libffi` are compiled from source rather than using system copies
2. **Multiple target triples** — iOS needs `aarch64-apple-ios` + `aarch64-apple-ios-sim`; Android needs `aarch64-linux-android`; macOS needs native. Each target has its own compiled copy of every library
3. **Graphics stacks** — MoltenVK, KosmicKrisp, ANGLE, SwiftShader are complete GPU driver implementations
4. **Weston** — a full reference compositor compiled for macOS, with all its dependencies
5. **FFmpeg** — full multimedia framework for waypipe video compression

**Mitigation:** Run `nix store gc` periodically to clean up old build artifacts. Only the current generation is kept.

</div>
</details>

<details id="why-nix">
<summary>
    Why do I have to install Nix?
    <button class="faq-share" onclick="copyFaqLink(event, 'why-nix')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

Nix is the **only dependency** you need to install — it replaces every other tool:

| Without Nix | With Nix |
|-------------|----------|
| Install Rust via rustup | Nix provides the exact Rust version |
| Install Xcode CLI tools | Nix wraps xcodebuild |
| Install Android SDK + NDK | Nix provides NDK, SDK, emulator |
| Install CMake, Meson, pkg-config | Nix provides all build tools |
| Install 27 C libraries manually | Nix builds them from source |
| Hope versions are compatible | Nix guarantees reproducibility |

**Why not Cargo alone?** Wawona depends on 27 native C/C++ libraries (libwayland, xkbcommon, FFmpeg, OpenSSL, etc.) that don't exist on macOS. Cargo can compile Rust crates, but it can't build C libraries, cross-compile for iOS/Android, or manage platform SDKs.

**Why not Homebrew?** Homebrew installs pre-built macOS binaries, but Wawona needs iOS and Android cross-compiled variants of every library. Homebrew can't cross-compile.

**Nix gives you:**
- **Reproducible builds** — same result on every Mac
- **Hermetic isolation** — doesn't pollute your system
- **Cross-compilation** — one command for macOS, iOS, and Android
- **Incremental caching** — only rebuild what changed

We recommend [**Determinate Nix**](https://determinate.systems/nix-installer/) because it enables flakes out of the box.

</div>
</details>

<details id="pre-built-binaries">
<summary>
    Why can't I just download a pre-built DMG, IPA, or APK?
    <button class="faq-share" onclick="copyFaqLink(event, 'pre-built-binaries')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

We're working on it! Pre-built binaries are planned but not available yet. Here's the status:

| Platform | Format | Status |
|----------|--------|--------|
| macOS | `.dmg` | Planned — needs code signing + notarization |
| iOS | TestFlight `.ipa` | Planned — setting up Fastlane for beta distribution |
| Android | `.apk` | Planned — needs signing key + Play Store or direct download |

**Why not yet?**

1. **Code signing** — Apple requires a paid Developer Program enrollment ($99/year) for distributing .app and .ipa files. We're a student-funded project
2. **Fastlane setup** — We're planning to integrate [Fastlane](https://fastlane.tools/) for automated TestFlight and Play Store deployment, but the CI/CD pipeline isn't configured yet
3. **Rapid development** — Wawona is still in active development (v0.2.2). Building from source ensures you always get the latest version with all protocol improvements

**For now:** `nix run` is the fastest way to build and launch. Once Fastlane is configured, beta testers will be able to install directly via TestFlight (iOS) or sideload an APK (Android).

</div>
</details>

<h3 class="faq-category"> Using Wawona</h3>

<details id="port-linux-software">
<summary>
    How do I port Linux software to macOS with Wawona?
    <button class="faq-share" onclick="copyFaqLink(event, 'port-linux-software')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

Wawona doesn't "port" Linux apps — it **runs them as-is** by implementing the Wayland protocol natively on macOS. Here's how it works:

**What Wawona does:**

1. Creates a Wayland compositor socket (`wayland-0`) on macOS
2. Any Wayland client that connects to this socket can display its windows
3. Wawona translates Wayland protocol messages into native macOS rendering (Metal) and input (NSEvent)

**How to run a Linux Wayland app on your Mac:**

| Method | How | Best For |
|--------|-----|----------|
| **Build locally** | Cross-compile the app for macOS using Nix | Apps with few dependencies |
| **Waypipe (remote)** | Run on a Linux server, display on Mac via SSH | Complex apps, no porting needed |
| **Weston (nested)** | Run inside Weston, which runs inside Wawona | Testing, development |

**Example — Running a remote Linux app:**

```bash
# On your Mac, with Wawona running:
nix run .#waypipe -- ssh user@linux-server foot
```

This runs `foot` (a Wayland terminal) on the Linux server and displays it on your Mac through Wawona. No porting required.

**Example — Building a Wayland app locally:**

If the app supports Wayland and compiles on macOS (or can be cross-compiled with Nix), you can add it as a Nix package in `dependencies/libs/` following the same pattern as Weston. The key requirements are:

1. The app must use the Wayland protocol (not X11)
2. It must link against `libwayland-client` (which Wawona builds for macOS)
3. Any Linux-specific APIs (epoll, signalfd, etc.) need shims — Wawona includes `epoll-shim` for this

</div>
</details>

<details id="protocol-support">
<summary>
    What Wayland protocols are supported?
    <button class="faq-share" onclick="copyFaqLink(event, 'protocol-support')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

Wawona registers **68 Wayland protocol globals**, but not all are fully implemented yet:

| Status | Count | Meaning |
|--------|-------|---------|
| ✓ Functional | ~10 | Full request handling, state management, events |
| ~ Partial | ~8 | Some requests work, others are incomplete |
| – Stub | ~49 | Registered but handlers only log — no state changes |

**Fully functional protocols** include: `wl_compositor`, `wl_shm`, `wl_output`, `xdg_wm_base`, and `zxdg_decoration_manager_v1`.

For the complete list, see [Protocol Support](/docs/protocols/).

</div>
</details>

<details id="intel-macs">
<summary>
    Does Wawona work on Intel Macs?
    <button class="faq-share" onclick="copyFaqLink(event, 'intel-macs')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

Currently, Wawona targets **Apple Silicon (M1, M2, M3, M4)** only. Intel Mac support is not actively tested or maintained. The Nix build system and Rust backend could theoretically compile for `x86_64-darwin`, but the Metal rendering pipeline and native libraries are only validated on ARM64.

</div>
</details>

<h3 class="faq-category"> Development</h3>

<details id="ios-signing">
<summary>
    How do I set up iOS device signing?
    <button class="faq-share" onclick="copyFaqLink(event, 'ios-signing')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

See the full walkthrough in the [Getting Started — Team ID](/docs/getting-started/) guide. The short version:

1. Run `nix run .#xcodegen` to generate the Xcode project
2. Open in Xcode → Signing & Capabilities → sign in and select your team
3. Copy the Team ID from the `.pbxproj` file
4. Save it: `echo 'export TEAM_ID="YOUR_ID"' > .envrc`
5. From now on: `nix develop` → `nix run .#xcodegen` auto-fills your signing identity

</div>
</details>

<details id="contribute-protocols">
<summary>
    How do I contribute protocol implementations?
    <button class="faq-share" onclick="copyFaqLink(event, 'contribute-protocols')" title="Copy link to this question">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link
    </button>
</summary>
<div class="faq-answer">

Protocol modules live in `src/core/wayland/` and follow a consistent pattern:

1. **Pick a stub protocol** from the [Protocol Support](/docs/protocols/) page (– status)
2. **Study the spec** at [wayland.app](https://wayland.app/) for the protocol's expected behavior
3. **Implement handlers** — turn the `tracing::debug!()` stubs into real state mutations and response events
4. **Test** with a known client that uses that protocol (e.g., `foot` for `zwp_text_input_manager_v3`)

See [Architecture](/docs/architecture/) for how the source is organized.

</div>
</details>

<script>
function copyFaqLink(event, id) {
    event.preventDefault();
    event.stopPropagation();
    
    const base = window.location.href.split('#')[0];
    const link = base + '#' + id;
    
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    
    function showSuccess() {
        btn.classList.add('copied');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalContent;
        }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(showSuccess);
    } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccess();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
    }
}

// Auto-expand and scroll to FAQ if hash is present
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const el = document.getElementById(hash);
        if (el && el.tagName === 'DETAILS') {
            el.open = true;
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

// Also handle hash changes if the user clicks a copied link while on the same page
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const el = document.getElementById(hash);
        if (el && el.tagName === 'DETAILS') {
            el.open = true;
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});
</script>

