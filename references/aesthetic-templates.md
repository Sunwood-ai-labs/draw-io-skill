# Aesthetic Templates

Use these templates before creating a new diagram when the user does not specify a visual style. The goal is to avoid plain default draw.io boxes while keeping diagrams readable, lintable, and easy to edit.

## Default: polished technical light

Use this for most architecture, workflow, system, and concept diagrams.

### Palette

| Token | Color | Use |
|-------|-------|-----|
| Canvas | `#F7F9FC` | optional page/background band |
| Surface | `#FFFFFF` | cards, service boxes |
| Surface alt | `#EEF4F8` | group backgrounds and lanes |
| Text primary | `#172033` | titles and labels |
| Text muted | `#56657A` | descriptions and metadata |
| Accent | `#2F80ED` | primary arrows, active states, title accent |
| Accent secondary | `#00A6A6` | secondary arrows or chips |
| Border | `#D6E0EA` | card and group borders |
| Warning | `#F2994A` | exceptions and risk notes |

### Shape Defaults

- Canvas: light neutral background or transparent export; avoid pure white-only diagrams unless the destination requires it.
- Main title: 28px, bold, `#172033`, placed outside the diagram body with a short muted subtitle when useful.
- Section/group frame: rounded rectangle, `rounded=1`, `arcSize=8`, `fillColor=#EEF4F8`, `strokeColor=#D6E0EA`, `strokeWidth=1`.
- Card/service box: rounded rectangle, `rounded=1`, `arcSize=8`, `fillColor=#FFFFFF`, `strokeColor=#C9D7E3`, `strokeWidth=1`, subtle shadow only when export quality remains clean.
- Card header: separate title text or top strip; title 16-18px bold, body 12-14px muted. Do not flatten title and body into one dense text block.
- Chips/status labels: small pill-like rounded rectangles with `fillColor=#EAF3FF`, `strokeColor=#BBD7FF`, `fontColor=#2F80ED`; keep chip text short.
- Connectors: orthogonal, rounded, `strokeColor=#2F80ED`, `strokeWidth=2`, `endArrow=block`, with 20px or more terminal run before arrowheads.
- Secondary connectors: use `#00A6A6` or dashed style. Do not encode too many meanings by color alone.

### Layout Defaults

- Use a 12px or 16px grid and align cards to it.
- Keep outer canvas margins at 48px or more.
- Keep 28-40px padding inside groups and 16-24px padding inside cards.
- Prefer 3-5 columns for left-to-right flows. For more than 8 major nodes, split into lanes or multiple pages.
- Avoid edge crossings by using lanes and explicit waypoints before adding decorative elements.
- Keep labels off connector paths; place edge labels in open gutters.
- Use one emphasis layer: title bar, accent line, or icon badge. Do not combine heavy gradients, large shadows, and many accent colors.

## Compact Dark Card Exception

Use dark cards only for a small number of high-level summary cards, not as the default for dense diagrams.

- Fill: `#172033`
- Title: `#FFFFFF`, 16-18px bold
- Body: `#DDE7F2`, 12-14px
- Accent: `#5CD6D6` or `#7DB7FF`
- Always split title and body into separate text cells or clear line breaks so `text-emphasis` lint can verify hierarchy.

## AWS Reference Style

When AWS icons are appropriate, keep the same polished light base:

- dark navy title bar or top accent only, not a full dark canvas
- white service cards with official AWS icons
- cyan/blue accent connectors
- visible note when AWS icons are used as visual metaphors for non-AWS concepts

## Generation Rule

When creating a diagram from scratch:

1. Pick one template before writing XML.
2. Declare the chosen template in your own working notes or final summary.
3. Encode colors and fonts explicitly in mxCell styles.
4. Run the normal SVG lint and visual review.
5. If the diagram still looks plain after lint passes, revise spacing, hierarchy, and color before presenting it.

## Purpose-Driven Template Set

Use these templates when the user needs a diagram that carries a specific design purpose, not merely a different color theme.

### Board Brief

Source: `assets/purpose-board-brief-template.drawio`

Existence purpose: a one-page decision premise for executives, PMs, and review owners.

Use it when the diagram must help someone decide what to approve, reject, fund, or escalate.

- Optimizes for: purpose, current signal, risk, owner, and next action.
- Deliberately excludes: implementation steps, raw logs, detailed dependency maps, and long procedural explanations.
- Structure fingerprint: decision-board grid with header band, premise column, signal column, and action contract column.
- Visual language: restrained navy, ivory, steel, and teal; minimal connectors.
- Do not turn it into: a system architecture map or timeline.

### Dependency Orbit Map

Source: `assets/purpose-dependency-orbit-template.drawio`

Existence purpose: a dependency-radius view that explains what sits at the core, what directly depends on it, and what is indirect or external.

Use it when the diagram must support impact analysis, SRE reasoning, security boundary review, or dependency communication.

- Optimizes for: center/periphery, dependency radius, boundary type, and impact surface.
- Deliberately excludes: chronology, ownership plans, project status, and detailed sequence steps.
- Structure fingerprint: central core node, orbit/ring guides, separated connector ports, and external-edge nodes.
- Visual language: dark radial canvas with purple, cyan, and amber dependency classes.
- Do not turn it into: a left-to-right flowchart or board summary.

### Incident Timeline

Source: `assets/purpose-incident-timeline-template.drawio`

Existence purpose: a fact-first incident reconstruction that separates observations, impact, and response actions in strict time order.

Use it when the diagram must support post-incident review, operational handoff, or evidence-backed recurrence prevention.

- Optimizes for: timestamp order, event owner, action, impact, and evidence ID.
- Deliberately excludes: speculation, unverified root cause, architecture inventory, and generic status summaries.
- Structure fingerprint: horizontal time axis with observation, impact, and response swimlanes.
- Visual language: white evidence surface with cyan time markers, orange impact, and green response.
- Do not turn it into: a radial dependency map or KPI dashboard.

Before accepting a new purpose-driven template, verify that its structure is recognizable without reading the title:

- Board Brief: grid/container decision board.
- Dependency Orbit Map: central node plus orbit/ring dependency structure.
- Incident Timeline: strict time axis plus event lanes.

### Hypothesis Helix

Source: `assets/purpose-hypothesis-helix-template.drawio`

Existence purpose: an experiment-design view that moves uncertain ideas through hypothesis, experiment, evidence, and decision.

Use it when the diagram must answer what should be tested next.

- Optimizes for: hypothesis clarity, experiment branch, evidence, and go/no-go decision.
- Deliberately excludes: implementation architecture, calendar timelines, and dependency topology.
- Structure fingerprint: four-stage staircase from Hypothesis to Decision, with a visible retry loop.
- Visual language: dark experiment canvas with distinct blue, amber, green, and red stage colors.
- Do not turn it into: a project roadmap or system diagram.

### Feature Value Matrix

Source: `assets/purpose-feature-value-matrix-template.drawio`

Existence purpose: a prioritization map for comparing feature candidates by impact, effort, and risk.

Use it when the diagram must answer what should be built first.

- Optimizes for: quadrant placement, relative priority, delivery risk, and tradeoff discussion.
- Deliberately excludes: detailed implementation sequence, dependency routes, and incident evidence.
- Structure fingerprint: 2x2 impact/effort matrix with feature cards and risk labels.
- Visual language: light analytical canvas with neutral grid, green/amber/red risk coding, and labeled quadrants.
- Do not turn it into: a timeline or decision board.

### Value Conversion Sheet

Source: `assets/purpose-value-conversion-sheet-template.drawio`

Existence purpose: a cross-functional mapping from user pain to touchpoint, delivered value, and measurable metric or gap.

Use it when the diagram must answer how work becomes user value.

- Optimizes for: pain-to-touchpoint traceability, value claim, metric ownership, and unresolved gaps.
- Deliberately excludes: system dependencies, experiment branching, and incident chronology.
- Structure fingerprint: four-column conversion sheet from Pain to Touchpoint to Value to Metric/Gap.
- Visual language: dark product-strategy canvas with blue touchpoints, green value, and yellow/red metric gaps.
- Do not turn it into: an architecture diagram or backlog board.
