+++
template = "homepage.html"
+++

{{ hero(tagline="A native, high-performance Wayland compositor for macOS, iOS, and Android. Powered by Rust and built for bare-metal speed.") }}

<!-- {{ screenshot(src="/images/wawona-screenshots/wawona-screenshot-1.png", caption="Wawona compositing Wayland clients natively on macOS.", margin_top="1rem") }} -->

Wawona is a feature-rich Wayland compositor that sits underneath the host OS's native management layer—**Quartz** on macOS, **UIKit** on iOS, and **Android's WindowManager**. 

By leveraging a shared **Rust core** and platform-native rendering pipelines—**Metal (Liquid Glass)** for Apple hardware and **Vulkan** for Android—Wawona achieves direct, zero-copy display performance. It integrates seamlessly with the host desktop, using native UI frameworks to manage surfaces, input, and windowing, providing a first-class bridge for Wayland clients without the overhead of virtualization.
