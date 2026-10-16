# DOMUS X — Light Theme

## Objective
Build a refined, discreet, welcoming light experience for a room-rental platform. Blue remains the primary brand/interaction color; page and card surfaces should be neutral, not blue-tinted.

## Core color tokens
| Token | Hex | Intended use |
| --- | --- | --- |
| `background` | `#F7F7F5` | Main page background |
| `surface` | `#FFFFFF` | Cards, panels, dialogs |
| `surface-secondary` | `#F0F1F2` | Secondary sections and subtle raised or grouped areas |
| `border` | `#E1E2E5` | Dividers, card outlines, form borders |
| `primary` | `#155EEF` | Primary CTAs, selected controls, active links |
| `text-primary` | `#202127` | Titles and body text |
| `text-secondary` | `#60646D` | Secondary text and supporting labels |

## Rules
- Neutral light surfaces are the default. Do not tint every card, navbar, or section blue.
- Use `primary` with restraint for actionable and selected elements, not as a generic container fill.
- Preserve visual hierarchy through whitespace, typography and modest surface contrast.
- Text on primary filled buttons should be white (`#FFFFFF`), subject to contrast verification.
- Prefer semantic and tag palettes from `otherColors.md` for alerts, statuses, badges, and category chips.
- For badges, use the paired **foreground + soft background** tokens defined in `otherColors.md`, rather than full-strength fills.
- Check text and non-text contrast against WCAG AA in actual component combinations; adjust token shades when necessary and document deviations.
- Define tokens centrally and apply consistently; do not scatter literal colors across components.
- Do not change existing layout, spacing, typography, content, responsiveness, or behaviors as part of color implementation.
