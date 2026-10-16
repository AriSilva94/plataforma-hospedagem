# DOMUS X — Status and Category Colors (Light + Dark)

## Scope
Shared semantic and tag guidance for `lightTheme.md` and `darkTheme.md`. These are DOMUS X curated extensions, **not a claim that these HEX values are official Radix tokens**. Preserve each color's meaning across themes. The main brand blue is defined in the theme-specific documents.

## Status tokens
| Role | Dark foreground/icon | Dark soft background | Light foreground/icon | Light soft background | Meaning |
| --- | --- | --- | --- | --- | --- |
| Success | `#49B88A` | `#19372C` | `#18794E` | `#E8F5EE` | Confirmed reservation, successful action |
| Warning | `#E3A44D` | `#3A2D1C` | `#A86413` | `#FFF3DF` | Payment pending, approaching deadline |
| Error | `#E57373` | `#412728` | `#C93636` | `#FCEBEC` | Failure, validation error, destructive action |
| Info | `#70B8FF` | `#0D2847` | `#0D74CE` | `#E6F4FE` | Neutral informational notices |

## Additional category tags
| Family | Dark foreground | Dark soft background | Light foreground | Light soft background | Example role |
| --- | --- | --- | --- | --- | --- |
| Lavender | `#B8A1D9` | `#30283C` | `#7954A1` | `#F1EBF7` | Differentiated features |
| Champagne | `#D4B68A` | `#362E25` | `#946B36` | `#F7F0E6` | Premium amenities |
| Terracotta | `#D99580` | `#392A27` | `#A9583E` | `#F8EDE8` | Comfort/room features |

## Rules
- Success, warning, error and info are for **status meaning**, not decorative categories.
- Lavender/Champagne/Terracotta are **category colors**, not status colors. Do not imply payment status or urgency through a decorative palette.
- Pair subdued backgrounds with their matching foreground; avoid glowing borders, neon saturation and full-card saturated fills.
- Statuses must also be understandable from text/icon, not color alone.
- Check final actual foreground-on-background pairs against WCAG AA for text; adjust and document any combination that fails. For buttons and non-text controls, test the actual component states and contrasts.
- Audit and reuse existing status/badge tokens, updating existing design-system documentation rather than duplicating it.
