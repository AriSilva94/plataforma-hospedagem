# DOMUS X — Dark Theme

## Objective
Build a refined, discreet, premium dark experience for a room-rental platform. Keep blue as the brand/interaction color without making the overall UI navy or monochromatically blue.

## Core color tokens
| Token | Hex | Intended use |
| --- | --- | --- |
| `background` | `#121316` | Main page background |
| `surface` | `#1D1F23` | Cards, panels, dialogs |
| `surface-elevated` | `#282B30` | Menus, popovers, raised or secondary surfaces |
| `border` | `#383B42` | Dividers, card outlines, form borders |
| `primary` | `#3478F6` | Primary CTAs, selected controls, active links |
| `text-primary` | `#F4F4F5` | Titles and body text |
| `text-secondary` | `#A5A8B0` | Secondary text and supporting labels |

## Rules
- Use charcoal and graphite for main backgrounds, panels and cards; avoid extensive navy/blue-tinted surfaces.
- Keep blue concentrated on CTAs, links, active states, focus and selected controls.
- Avoid neon greens, electric purples, glowing borders, gratuitous gradients, or saturated background panels.
- Text on primary filled buttons should be white (`#FFFFFF`), subject to contrast verification.
- Prefer semantic and tag palettes from `otherColors.md` for alerts, statuses, badges, and category chips.
- For badges, use the paired **foreground + soft background** tokens defined in `otherColors.md`, rather than full-strength fills.
- Verify actual WCAG AA contrast for text, inputs, badges and statuses, adjusting shades if required and documenting deviations.
- Centralize tokens and preserve the existing layout, spacing, typography, content, responsiveness, and behavior.
