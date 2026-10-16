# DOMUS X — Dark Theme (Radix-inspired)

## Reference and scope
- Visual direction: user-selected **image 2** from a prior Radix reference gallery. The exact screenshot's color sampling was **not verified**; this specification uses published Radix Colors **Slate Dark + Blue Dark** scales as an implementation starting point, not an exact extraction from that image.
- Official references: https://www.radix-ui.com/colors and https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- Intent: lively, elegant hospitality UI; dark with *controlled coolness*, not flat black or uniformly navy. Blue is the identity and can appear subtly on interaction surfaces.

## Main semantic mapping
| Existing role to map | Hex | Radix source | Purpose |
| --- | --- | --- | --- |
| `background` | `#111113` | Slate Dark 1 | Main app background |
| `surface` | `#18191B` | Slate Dark 2 | Cards, header, navigation and dialogs |
| `surface-hover` | `#212225` | Slate Dark 3 | Card hover, selection-neutral |
| `surface-elevated` | `#272A2D` | Slate Dark 4 | Popovers, grouped or raised surfaces |
| `border-subtle` | `#363A3F` | Slate Dark 6 | Passive borders |
| `border-interactive` | `#5A6169` | Slate Dark 8 | Interactive boundaries when needed |
| `text-primary` | `#EDEEF0` | Slate Dark 12 | Main text |
| `text-secondary` | `#B0B4BA` | Slate Dark 11 | Supporting text |
| `primary` | `#0090FF` | Blue Dark 9 | Brand/active indicator (verify foreground contrast) |
| `primary-hover` | `#3B9EFF` | Blue Dark 10 | Hover accents where contrast is sufficient |
| `primary-soft` | `#0D2847` | Blue Dark 3 | Selected chip or subtle interactive container |
| `primary-soft-hover` | `#003362` | Blue Dark 4 | Soft hover |
| `primary-border` | `#205D9E` | Blue Dark 7 | Accent outlines |
| `primary-text` | `#70B8FF` | Blue Dark 11 | Blue text on dark neutral surfaces |
| `primary-solid-accessible` | `#0D74CE` | Blue Light 11 | Optional filled CTA with white text; verify contrast |

## Visual usage
- Dark does **not** mean removing all colored surfaces. Use Slate Dark layers for depth, with restrained Blue 3/4 on genuinely selected/interactive elements.
- Do not tint every card blue. Use a single clear CTA hierarchy and limited accent density.
- Add dimension with appropriate border contrast, hover states, photos, and meaningful status badges, not neon glows.
- Use `otherColors.md` for status/tag combinations, preserving foreground/background pairs.
- Keep blues as explicit token mappings within the **existing** token/theme architecture; do not create a new styling system.
- Verify WCAG AA text contrast on every actual color combination, especially white over Blue 9 (`#0090FF`), which must not be assumed accessible for normal text. Choose an appropriate accessible filled variant as needed.

## Implementation discipline
- Audit existing semantic token names first; **map these roles** to existing variables rather than introducing duplicate theme definitions.
- Keep layouts, typography, spacing, business rules, interactions and responsiveness unchanged.
- Document changes in the existing design-system documentation (`DESIGN.md` or equivalent).
