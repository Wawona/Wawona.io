+++
title = "Protocol Support"
date = 2026-02-22
weight = 12
+++

# Wayland Protocol Support

Wawona registers **68 protocol globals** at compositor startup. This page documents the implementation status of each protocol.

---

## Status Legend

| Status | Meaning |
|--------|---------|
| 🟢 **Functional** | Handles requests, mutates state, sends proper events |
| 🟡 **Partial** | Global registered, some requests handled, incomplete semantics |
| 🔴 **Stub** | Global registered, request handlers log only (no state changes) |

**Summary:** ~10 Functional, ~8 Partial, ~49 Stub

---

## Core Protocols (6)

| Protocol | Status | Notes |
|----------|--------|-------|
| `wl_compositor` v6 | 🟢 Functional | Surface creation, commit, frame callbacks |
| `wl_shm` v1 | 🟢 Functional | Pool creation, buffer creation, mmap |
| `wl_seat` v8 | 🟡 Partial | Keyboard/pointer/touch binding works; XKB uses hardcoded minimal keymap fallback |
| `wl_output` v3 | 🟢 Functional | Mode, geometry, scale, done events |
| `wl_subcompositor` v1 | 🟡 Partial | Subsurface creation tracked; z-order and sync/desync partially implemented |
| `wl_data_device_manager` v3 | 🟡 Partial | Data source/device creation; selection and DnD logic incomplete |

---

## XDG Protocols (9)

| Protocol | Status | Notes |
|----------|--------|-------|
| `xdg_wm_base` v5 | 🟢 Functional | Surface/toplevel/popup lifecycle, configure/ack, ping/pong |
| `zxdg_decoration_manager_v1` | 🟢 Functional | CSD/SSD negotiation, mode switching, Force SSD support |
| `zxdg_output_manager_v1` | 🟡 Partial | Logical position/size sent; updates on output change incomplete |
| `xdg_activation_v1` | 🔴 Stub | |
| `xdg_wm_dialog_v1` | 🔴 Stub | |
| `xdg_toplevel_drag_manager_v1` | 🔴 Stub | |
| `xdg_toplevel_icon_manager_v1` | 🔴 Stub | |
| `zxdg_exporter_v2` | 🔴 Stub | |
| `zxdg_importer_v2` | 🔴 Stub | |

---

## wlroots Protocols (10)

| Protocol | Status | Notes |
|----------|--------|-------|
| `zwlr_layer_shell_v1` | 🟡 Partial | Layer surface creation tracked; anchor/margin/exclusive zone stored |
| `zwlr_output_management_v1` | 🔴 Stub | |
| `zwlr_output_power_management_v1` | 🔴 Stub | |
| `zwlr_foreign_toplevel_management_v1` | 🔴 Stub | |
| `zwlr_screencopy_manager_v1` | 🔴 Stub | |
| `zwlr_gamma_control_manager_v1` | 🔴 Stub | |
| `zwlr_data_control_manager_v1` | 🔴 Stub | |
| `zwlr_export_dmabuf_manager_v1` | 🔴 Stub | |
| `zwlr_virtual_pointer_manager_v1` | 🔴 Stub | |
| `zwp_virtual_keyboard_v1` | 🔴 Stub | |

---

## Buffer & Sync (5)

| Protocol | Status | Notes |
|----------|--------|-------|
| `zwp_linux_dmabuf_v1` v4 | 🟡 Partial | Params creation tracked; IOSurface path for macOS exists; feedback stubbed |
| `zwp_linux_explicit_synchronization_v1` | 🔴 Stub | |
| `wp_single_pixel_buffer_manager_v1` | 🔴 Stub | |
| `wp_linux_drm_syncobj_manager_v1` | 🔴 Stub | |
| `wp_drm_lease_device_v1` | 🔴 Stub | |

---

## Input & Interaction (10)

| Protocol | Status | Notes |
|----------|--------|-------|
| `zwp_relative_pointer_manager_v1` | 🔴 Stub | |
| `zwp_pointer_constraints_v1` | 🔴 Stub | |
| `zwp_pointer_gestures_v1` | 🔴 Stub | |
| `zwp_tablet_manager_v2` | 🔴 Stub | |
| `zwp_text_input_manager_v3` | 🔴 Stub | |
| `zwp_keyboard_shortcuts_inhibit_manager_v1` | 🔴 Stub | |
| `wp_cursor_shape_manager_v1` | 🔴 Stub | |
| `zwp_primary_selection_device_manager_v1` | 🔴 Stub | |
| `zwp_input_timestamps_manager_v1` | 🔴 Stub | |
| `wp_pointer_warp_v1` | 🔴 Stub | |

---

## Presentation & Timing (8)

| Protocol | Status | Notes |
|----------|--------|-------|
| `wp_presentation` | 🟡 Partial | Feedback collection exists; presentation events incomplete |
| `wp_viewporter` | 🔴 Stub | |
| `wp_fractional_scale_manager_v1` | 🔴 Stub | |
| `wp_fifo_manager_v1` | 🔴 Stub | |
| `wp_tearing_control_manager_v1` | 🔴 Stub | |
| `wp_commit_timing_manager_v1` | 🔴 Stub | |
| `wp_content_type_manager_v1` | 🔴 Stub | |
| `wp_color_representation_manager_v1` | 🔴 Stub | |

---

## Session & Security (5)

| Protocol | Status | Notes |
|----------|--------|-------|
| `zwp_idle_inhibit_manager_v1` | 🔴 Stub | |
| `ext_session_lock_manager_v1` | 🔴 Stub | |
| `ext_idle_notifier_v1` | 🔴 Stub | |
| `wp_security_context_manager_v1` | 🔴 Stub | |
| `ext_transient_seat_manager_v1` | 🔴 Stub | |

---

## Desktop Integration (4)

| Protocol | Status | Notes |
|----------|--------|-------|
| `wp_alpha_modifier_v1` | 🔴 Stub | |
| `ext_foreign_toplevel_list_v1` | 🔴 Stub | |
| `ext_workspace_manager_v1` | 🔴 Stub | |
| `ext_background_effect_manager_v1` | 🔴 Stub | |

---

## Screen Capture & XWayland (4)

| Protocol | Status | Notes |
|----------|--------|-------|
| `ext_output_image_capture_source_manager_v1` | 🔴 Stub | |
| `ext_image_copy_capture_manager_v1` | 🔴 Stub | |
| `zwp_xwayland_keyboard_grab_manager_v1` | 🔴 Stub | |
| `xwayland_shell_v1` | 🔴 Stub | |

---

## KDE / Plasma Protocols (7)

| Protocol | Status | Notes |
|----------|--------|-------|
| `org_kde_kwin_server_decoration_manager` | 🔴 Stub | |
| Blur manager | 🔴 Stub | |
| Contrast manager | 🔴 Stub | |
| Shadow manager | 🔴 Stub | |
| DPMS manager | 🔴 Stub | |
| Idle timeout | 🔴 Stub | |
| Slide manager | 🔴 Stub | |

---

## Notes

All 68 protocol globals are registered correctly at compositor startup. The issue for stub protocols is not registration — it's that request handlers need semantic implementation (state mutations, response events, error handling). Currently, stub handlers log incoming requests via `tracing::debug!()` but do not implement protocol semantics.

Contributing protocol implementations is one of the most impactful ways to help Wawona. See the [Architecture](/docs/architecture/) page for how protocol modules are structured.
