# DOMUS X — Semantic and Tag Colors

This palette complements `lightTheme.md` and `darkTheme.md`. It does **not** replace the primary blue or neutral surfaces. Color meaning should be consistent between themes.

## Semantic foreground tokens
| Meaning | Dark | Light | Use |
| --- | --- | --- | --- |
| `success` | `#49B88A` | `#18794E` | Confirmations, successful actions, confirmed bookings |
| `warning` | `#E3A44D` | `#A86413` | Approaching deadlines, attention and warnings |
| `error` | `#E57373` | `#C93636` | Validation errors, failures, destructive actions |
| `info` | `#73A7F7` | `#155EEF` | Informational notices and instructions |

## Additional tag palettes
| Tag family | Dark text/icon | Dark soft background | Light text/icon | Light soft background | Suggested role |
| --- | --- | --- | --- | --- | --- |
| `lavender` | `#B8A1D9` | `#30283C` | `#7954A1` | `#F1EBF7` | Exclusive categories and special highlights |
| `champagne` | `#D4B68A` | `#362E25` | `#946B36` | `#F7F0E6` | Premium suites and distinctive amenities |
| `terracotta` | `#D99580` | `#392A27` | `#A9583E` | `#F8EDE8` | Room environment and comfort characteristics |

## Usage guidelines
- Reserve semantic colors for their meanings. Do not use red for ordinary decorative categories or green for unrelated amenities.
- Additional tag colors express *categories*, not status, urgency or validation. A tag color must never be the only way its meaning is communicated.
- Use soft tag backgrounds with matching foreground text/icons; avoid neon tones, glows and large saturated fills.
- Give status labels descriptive text and, when helpful, an icon; don't rely on color alone.
- For success/warning/error/info banners or badges, derive soft theme-specific backgrounds and borders that pass contrast checks; **do not assume the foreground hex is suitable as a solid background**.
- Hover/active/focus/disabled states must be checked separately against WCAG AA. WCAG AA target: at least 4.5:1 for normal text, 3:1 for large text and meaningful UI boundaries where applicable.
- If a listed foreground/background pair fails the target for its actual text size, adjust the specific shade and record why rather than blindly hard-coding a failing combination.
- Keep this file as the single reference for semantic and category tag colors in both themes.
