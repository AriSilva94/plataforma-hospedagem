# DOMUS X — Light Theme (Radix-inspired)

## Reference and scope
- Visual direction: user-selected **image 5** from a prior Radix reference gallery. Exact screenshot sampling was **not verified**; this spec uses published **Slate Light + Blue Light** scales as a tested starting direction, not an exact recreation of that image.
- Official references: https://www.radix-ui.com/colors and https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- Intent: airy, modern and polished hospitality interface with more character than flat gray-on-white. Let subtle cool surfaces and restrained blue accents create depth.

## Main semantic mapping
| Existing role to map | Hex | Radix source | Purpose |
| --- | --- | --- | --- |
| `background` | `#FCFCFD` | Slate Light 1 | Main page background |
| `surface` | `#FFFFFF` | Custom white | Cards and dialogs |
| `surface-secondary` | `#F9F9FB` | Slate Light 2 | Header, sidebar, grouped areas |
| `surface-hover` | `#F0F0F3` | Slate Light 3 | Neutral hover/active areas |
| `surface-elevated` | `#E8E8EC` | Slate Light 4 | Subtle neutral emphasis |
| `border-subtle` | `#D9D9E0` | Slate Light 6 | Dividers and card outlines |
| `border-interactive` | `#B9BBC6` | Slate Light 8 | Interactive outlines |
| `text-primary` | `#1C2024` | Slate Light 12 | Main text |
| `text-secondary` | `#60646C` | Slate Light 11 | Supporting text |
| `primary` | `#0D74CE` | Blue Light 11 | CTA fill with white foreground, links; verify component contrast |
| `primary-hover` | `#005CA9` | Custom darker hover | Primary filled CTA hover; verify |
| `primary-soft` | `#E6F4FE` | Blue Light 3 | Subtle selected/interactive surface |
| `primary-soft-hover` | `#D5EFFF` | Blue Light 4 | Soft hover |
| `primary-border` | `#8EC8F6` | Blue Light 7 | Accent outlines |
| `primary-text` | `#0D74CE` | Blue Light 11 | Blue link/label text |
| `brand-bright` | `#0090FF` | Blue Light 9 | Branded graphical accent, not small white-on-blue labels |

## Visual usage
- Light must not be lifeless: preserve refined blue accents, subtle grouped surfaces and clear depth between page, cards and interactive controls.
- Do **not** fill the entire interface with pale-blue cards; reserve Blue 3/4 for selected controls, supporting accents and purposeful highlights.
- Cards and navigation may alternate between Slate 1/2 and white when this helps hierarchy; avoid unnecessary borders on every layer.
- Keep semantic/status/category colors consistent with `otherColors.md`.
- Do not assume any accent/foreground pairing is accessible without checking actual usage; use WCAG AA for normal text and UI states.

## Implementation discipline
- Reuse existing theme variables and components; update **only** existing token mappings where possible.
- Preserve layout, content, typography, behavior, accessibility semantics and responsiveness.
- Synchronize the existing design-system documentation with final implemented tokens.
