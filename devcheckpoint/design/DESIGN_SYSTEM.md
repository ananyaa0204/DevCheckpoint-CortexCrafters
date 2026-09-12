# DevCheckpoint Design System

## 1. Design Direction

DevCheckpoint uses a **premium dark developer-tool interface** inspired by the visual quality of Linear, Vercel, GitHub, and modern IDEs, without copying any one product.

The interface should feel:

- Fast
- Calm
- Technical
- Minimal
- Dense but readable
- Professional
- Local-first
- Built for developers

Avoid:

- Heavy gradients everywhere
- Large decorative illustrations inside product screens
- Excessive glassmorphism
- Cartoonish UI
- Oversized marketing-style cards
- Unnecessary animations
- Bright neon backgrounds
- Rounded-everything mobile-app styling

---

## 2. Core Theme

### Base Colors

```text
App Background        #070B11
Sidebar Background    #090E15
Surface 1             #0D131C
Surface 2             #111923
Surface 3             #151E2A
Border                #202A36
Border Subtle         #18212C
```

### Text

```text
Primary Text          #F4F7FB
Secondary Text        #A6B0BF
Muted Text            #738094
Disabled Text         #505B6B
```

### Brand / Accent

```text
Primary Blue          #2F74FF
Primary Blue Hover    #4383FF
Primary Blue Soft     rgba(47,116,255,0.14)

Cyan Accent           #38BDF8
Purple Accent         #8B5CF6
Green Accent          #22C55E
Orange Accent         #F59E0B
Red Accent            #EF4444
```

### Status Colors

```text
Success               #22C55E
Warning               #F59E0B
Danger                #EF4444
Info                   #3B82F6
Neutral                #64748B
```

---

## 3. Typography

### Primary Font

Use:

```text
Inter
```

Fallback:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Monospace Font

Use:

```text
JetBrains Mono
```

Fallback:

```css
font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

### Type Scale

```text
Display / Page Title      30–34px / 700
Section Title             20–24px / 650
Card Title                15–17px / 600
Body                      14px / 400
Small Body                13px / 400
Metadata                  12px / 400
Label                     12–13px / 500
Code                      12–13px / 400
```

Use compact line heights.

```text
Headings: 1.2–1.3
Body: 1.45–1.55
Code: 1.5
```

---

## 4. Spacing System

Use an 8px-based spacing system.

```text
4px   micro spacing
8px   compact spacing
12px  control spacing
16px  standard internal spacing
20px  card spacing
24px  section spacing
32px  page section spacing
40px  large separation
```

### Page Layout

```text
Sidebar width:      248px
Topbar height:       64px
Page horizontal:     24–28px
Page vertical:       24px
Main content gap:    16–20px
```

---

## 5. Border Radius

Keep radius restrained.

```text
Small controls       6px
Inputs / Buttons     7px
Cards                9px
Large panels         10px
Pills                999px
```

Do not use large 16–24px rounded cards.

---

## 6. Shadows

Keep shadows very subtle.

```css
box-shadow:
  0 1px 2px rgba(0,0,0,0.22),
  0 8px 24px rgba(0,0,0,0.16);
```

Most panels should rely on borders instead of strong shadows.

---

## 7. Sidebar

The sidebar is persistent across all main screens.

### Structure

```text
DevCheckpoint logo
Context. Saved.

Dashboard
Projects
Tasks
Checkpoints
Handoffs
Analytics
Settings

[Bottom promo/info card]

User avatar
Name
Email
```

### Sidebar Rules

- Darker than main content area
- 248px fixed width on desktop
- Active item has blue icon/text and subtle blue background
- Icons: Lucide
- Section rows: 40–44px height
- Keep labels left aligned
- Profile stays pinned near bottom

---

## 8. Top Bar

Top bar contains:

```text
Global search
Keyboard shortcut hint
Theme / utility icon
Notifications
User avatar / menu
```

Optional page actions can sit on the far right.

### Search

Placeholder:

```text
Search projects, tasks, checkpoints...
```

Use:

```text
⌘ K
```

as shortcut indicator on macOS.

---

## 9. Buttons

### Primary

- Blue background
- White text
- 36–40px height
- 7px radius
- Hover slightly brighter

Example:

```text
Save Checkpoint
Resume Development
Create Handoff
Start Task
```

### Secondary

- Surface background
- Border
- Primary text

### Ghost

- Transparent
- Muted text
- Hover surface

### Danger

- Dark red tinted background or outline
- Red text

---

## 10. Inputs

Inputs should feel like developer tools.

```text
Background: Surface 2
Border: Border
Height: 38–42px
Radius: 7px
Padding: 10–12px
```

Focus state:

```text
border-color: #2F74FF
box-shadow: 0 0 0 2px rgba(47,116,255,0.12)
```

Textareas:

- Same surface
- 100–160px default height
- Monospace only when displaying technical content

---

## 11. Cards / Panels

Panels should have:

```text
Background: Surface 1 or Surface 2
Border: 1px solid #202A36
Radius: 9px
Padding: 16–20px
```

Avoid floating isolated cards when a table/list would be more efficient.

Use cards for:

- Summary
- AI output
- Project metadata
- Quick actions
- Status
- Context sections

---

## 12. Tables and Lists

Developer tools should feel data-dense.

Use:

- Thin separators
- 44–52px list row heights
- Hover states
- Small metadata text
- Status badges
- Right aligned timestamps/actions

Examples:

```text
Recent Checkpoints
Projects
Tasks
Handoffs
Files Changed
Recent Activity
```

---

## 13. Badges

Use small compact badges.

Examples:

```text
In Progress
Completed
Blocked
Feature
Bug
Backend
Frontend
Local
```

Badge style:

```text
font-size: 11–12px
padding: 3px 7px
radius: 999px
```

Tint background, not full-saturation.

---

## 14. Code Diff Styling

This is one of the most important visual systems.

### Removed Code

```text
Background: rgba(239,68,68,0.15)
Text accent: #F87171
```

### Added Code

```text
Background: rgba(34,197,94,0.14)
Text accent: #4ADE80
```

### Code Panel

```text
Background: #080D13
Font: JetBrains Mono
Line numbers: muted
Selected line: subtle blue tint
```

Support:

```text
Side by Side
Unified
```

---

## 15. Terminal Styling

```text
Background: #070B10
Font: JetBrains Mono
Text: #D8DEE9
Success: green
Warning: amber
Error: red
Prompt: muted / blue
```

Terminal should feel native to the product rather than decorative.

---

## 16. AI Summary Visual Language

AI-generated context should use structured sections, not chat bubbles.

Recommended sections:

```text
What you're working on
What changed
Current blocker
What you've already tried
Important files
Next recommended step
```

Each section may use a compact icon and accent color.

Example:

```text
Current blocker        red
Next recommended step  green
Important files        purple
What changed           cyan/green
```

Do not make the interface feel like a generic chatbot.

---

## 17. Icon System

Use:

```text
lucide-react
```

Recommended icons:

```text
LayoutDashboard
FolderGit2
ListTodo
BookmarkCheck
GitBranch
Users
BarChart3
Settings
Search
Bell
Play
Save
FileCode2
Terminal
AlertTriangle
ArrowRight
GitCommit
CheckCircle2
Circle
Share2
ExternalLink
```

Icon sizes:

```text
Sidebar: 18px
Buttons: 16px
Section icons: 18–20px
Large status icons: 22–26px
```

---

## 18. Animation

Keep animations minimal.

Allowed:

```text
150–200ms color transitions
small opacity fades
dropdown / dialog transitions
loading spinners
progress bar movement
```

Avoid:

```text
large page transitions
parallax
3D motion
animated backgrounds
constant glowing effects
```

---

## 19. Responsive Behavior

Primary target:

```text
Desktop: 1440px+
```

Secondary:

```text
Laptop: 1280px
```

Behavior:

- Sidebar may collapse below ~1180px
- Right info panel can move below primary content
- Tables may horizontally scroll
- Never hide core checkpoint information

Mobile is not required for the first desktop MVP.

---

## 20. Visual Product Principle

The UI should communicate:

> This is a serious developer tool that happens to use AI.

Not:

> This is an AI chatbot with developer features.

The code, task state, Git context, checkpoints, and workflow should remain visually dominant.
