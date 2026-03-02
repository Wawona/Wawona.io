+++
title = "Documentation"
render = true
sort_by = "weight"
template = "docs_section.html"
page_template = "page.html"
+++

<style>
.docs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 2rem;
}

.docs-grid a {
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 1.25rem;
    background: var(--bg-1);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    display: block;
    border-bottom: 1px solid var(--border-color);
}

.docs-grid a:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: var(--bg-1);
    color: inherit;
}

.docs-grid a strong {
    font-size: 1.05rem;
    display: block;
    margin-bottom: 0.35rem;
    font-family: var(--header-font);
}

.docs-grid a span {
    font-size: 0.88rem;
    color: var(--text-1);
    line-height: 1.45;
    display: block;
}

.docs-grid a .doc-icon {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    display: block;
}

.docs-section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 0.25rem;
    font-family: var(--header-font);
    color: var(--text-1);
    letter-spacing: -0.01em;
}

.docs-section-title:first-of-type {
    margin-top: 0.5rem;
}

.docs-intro p:first-child {
    font-size: 1.05rem;
    color: var(--text-1);
    margin-bottom: 1.5rem;
}
</style>

Wawona is a native Wayland compositor for macOS, iOS, and Android. Choose a section below to get started.

<h3 class="docs-section-title">🚀 Getting Started</h3>
<div class="docs-grid">
<a href="/docs/getting-started/">
<strong>Getting Started</strong>
<span>Install Nix, build and run Wawona, set up your Team ID for iOS signing</span>
</a>
<a href="/docs/usage/">
<strong>Usage Guide</strong>
<span>Run Weston, connect Wayland clients, remote apps via Waypipe</span>
</a>
<a href="/docs/compilation/">
<strong>Compilation Reference</strong>
<span>All build commands, project generators, debug builds, dev shell</span>
</a>
</div>

<h3 class="docs-section-title">🏗️ Architecture & Design</h3>
<div class="docs-grid">
<a href="/docs/architecture/">
<strong>Architecture</strong>
<span>Rust core, FFI layer, native frontends, threading model, 68 protocols</span>
</a>
<a href="/docs/macos/">
<strong>macOS Implementation</strong>
<span>Metal rendering, IOSurface zero-copy, Liquid Glass, native window management</span>
</a>
<a href="/docs/android/">
<strong>Android Architecture</strong>
<span>Kotlin/JNI frontend, Vulkan rendering, Dropbear SSH bundling</span>
</a>
</div>

<h3 class="docs-section-title">⚙️ Configuration & Features</h3>
<div class="docs-grid">
<a href="/docs/settings/">
<strong>Settings Reference</strong>
<span>All settings across macOS, iOS, and Android with platform defaults</span>
</a>
<a href="/docs/waypipe/">
<strong>Waypipe Guide</strong>
<span>Remote Wayland apps over SSH — OpenSSH, libssh2, Dropbear transports</span>
</a>
<a href="/docs/graphics/">
<strong>Graphics Drivers</strong>
<span>Vulkan/OpenGL driver selection, CTS validation, iOS static drivers</span>
</a>
</div>

<h3 class="docs-section-title">📖 Reference</h3>
<div class="docs-grid">
<a href="/docs/protocols/">
<strong>Protocol Support</strong>
<span>All 68 Wayland protocols with implementation status</span>
</a>
<a href="/docs/nix-build-system/">
<strong>Nix Build System</strong>
<span>Three-layer build pipeline, crate2nix, cross-compilation, caching</span>
</a>
<a href="/docs/debugging/">
<strong>Debugging</strong>
<span>Attach LLDB on macOS, iOS Simulator, and Android</span>
</a>
</div>
