![Wawona Preview](static/images/wawona-screenshots/SplitPreviewWawonaio.png)

Uses [Zola](https://www.getzola.org/) to generate the static site.

### Prerequisites

- [Zola](https://www.getzola.org/) (Follow the [official installation guide](https://www.getzola.org/documentation/getting-started/installation/) for your platform)

### Using Nix (Recommended)

If you have [Nix](https://nixos.org/) installed with flakes enabled, you don't need to manually install Zola. Nix will handle all dependencies and environment setup.

**Start the development server:**
```bash
nix run
```
This command will:
1. Automatically fetch and set up Zola.
2. Start the development server at `http://127.0.0.1:1111`.
3. Provide a network-accessible URL for testing on other devices on your local network.

**Enter the development environment:**
```bash
nix develop
```
This drops you into a shell with Zola available, allowing you to run standard `zola` commands.

### Build Instructions without Nix

**Build the site:**
```bash
zola build
```

**Serve the site locally:**
```bash
zola serve
```

#### If you're using zola via flatpak:

**Build the site:**
```bash
flatpak run org.getzola.zola build
```

**Serve the site locally:**
```bash
flatpak run org.getzola.zola serve
```

### Cleaning the build directory

```bash
rm -rf public/
```