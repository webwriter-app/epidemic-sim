# Epidemic Sim (`@webwriter/epidemic-sim@0.0.1`)
[License: MIT](LICENSE) | Version: 0.0.1

Interactive agent-based epidemic simulation (SIR/SIRS/SEIR/SIRD/SEIRD) for WebWriter explorables, with charts, quarantine, hotspots, and communities.

## What the widget does

The widget simulates how an infection spreads through a population. Learners can watch it unfold, change parameters and compare scenarios.

- **People as dots.** Every person is a dot that moves around a map. When an infected dot comes within the *infection radius* of a susceptible one, it may pass on the infection (*infection probability*). Dots are colored by their current state.
- **Epidemic models.** The model decides which states exist:

  | Model | States | Typical question |
  | :---: | :----: | :--------------- |
  | SIR | Susceptible → Infected → Recovered | Basic course of an epidemic |
  | SIRS | … → Recovered → Susceptible again | Immunity that wears off |
  | SEIR | Susceptible → Exposed → Infected → Recovered | Incubation period |
  | SIRD | … Infected → Recovered *or* Dead | Mortality |
  | SEIRD | Incubation period and mortality combined | |

- **Chart.** A line chart shows how many people are in each state on every simulated day. It updates live while the simulation runs.
- **Interventions** that learners can switch on to see their effect:
  - **Quarantine:** infected people are moved to a separate area with a given probability and stay there for a given time.
  - **Hotspots:** places where people gather (e.g. a school or a supermarket). They are placed by dragging or tapping on the map, moved by dragging, resized at their corners and removed by dragging them off the map.
  - **Communities:** the population is split into groups that only rarely mix.
- **Snapshots.** A snapshot stores the course of the curves at one moment. All snapshots can be compared in a gallery and downloaded as an image (PNG) or a table (CSV).
- **Insights.** Key figures such as the estimated R0, the herd immunity threshold, the peak of infections and the current share of each group are shown in the sidebar.
- **Fullscreen.** The whole widget can be enlarged to fill the screen. Chart and map are then shown side by side with the key figures below.

### Authors and learners

In WebWriter, authors configure the widget in its options panel: the model, all parameters and which controls learners may see. Every parameter has a matching `allow-…` attribute; only controls that are allowed appear in the learners' sidebar. Options for switched off features stay hidden until the feature is turned on.

### Time

The simulation runs in steps of 24 frames per day. Durations (incubation, recovery, quarantine, …) are stored as a number of frames in the attributes and shown in days in the interface (e.g. `120` frames = 5 days).

### Saved state

Settings are stored as attributes. Placed hotspots and snapshots are stored as JSON in the `widget-state` attribute. Snapshots only contain the data of the curves; the chart is redrawn from that data, so documents stay small.

### Languages

All texts are available in English and 31 further languages. The widget follows the language of the document.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Flatten the Curve: COVID-19 SEIRD | `@webwriter/epidemic-sim/snippets/corona-verlauf.html` |

The snippet is a ready-made task on COVID-19 (SEIRD model). Its parameters are based on published values of the Robert Koch Institute; the sources are listed in the snippet file.

## `WebwriterEpidemicSim` (`<webwriter-epidemic-sim>`)
Agent-based epidemic simulation with a live chart, a simulation map and optional interventions.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/epidemic-sim/widgets/webwriter-epidemic-sim.js"></script>
<webwriter-epidemic-sim></webwriter-epidemic-sim>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/epidemic-sim
```

```html
<script type="module" src="@webwriter/epidemic-sim/widgets/webwriter-epidemic-sim.js"></script>
<webwriter-epidemic-sim model-type="seird" population="800"></webwriter-epidemic-sim>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `modelType` (`model-type`) | `"sir" \| "sirs" \| "seir" \| "sird" \| "seird"` | The epidemic model. | `"sir"` | ✓ |
| `population` (`population`) | `number` | Number of people (dots), 50–800. | `240` | ✓ |
| `speed` (`speed`) | `number` | How fast people move, 0.2–4. | `1.6` | ✓ |
| `infectionRadius` (`infection-radius`) | `number` | Distance within which an infection can be passed on, 4–40. | `10` | ✓ |
| `infectionProbability` (`infection-probability`) | `number` | Chance of passing on the infection on contact, 0.01–1. | `0.2` | ✓ |
| `recoveryDuration` (`recovery-duration`) | `number` | Time until an infected person recovers, in frames (24 = 1 day). | `600` (25 days) | ✓ |
| `incubationDuration` (`incubation-duration`) | `number` | Time from exposure to infectiousness, in frames. SEIR and SEIRD only. | `120` (5 days) | ✓ |
| `immunityDuration` (`immunity-duration`) | `number` | Time until immunity wears off, in frames. SIRS only. | `1200` (50 days) | ✓ |
| `mortalityProbability` (`mortality-probability`) | `number` | Chance that an infected person dies, 0.001–0.5. SIRD and SEIRD only. | `0.02` | ✓ |
| `simulationDuration` (`simulation-duration`) | `number` | Maximum length of a run, in frames. The run may end earlier when the epidemic is over. | `1440` (60 days) | ✓ |
| `quarantineEnabled` (`quarantine-enabled`) | `boolean` | Turns the quarantine area on. | `false` | ✓ |
| `quarantineProbability` (`quarantine-probability`) | `number` | Chance that an infected person is put into quarantine, 0.01–1. | `0.7` | ✓ |
| `quarantineDuration` (`quarantine-duration`) | `number` | Time spent in quarantine, in frames. | `450` | ✓ |
| `hotspotsEnabled` (`hotspots-enabled`) | `boolean` | Turns hotspots on. | `false` | ✓ |
| `hotspotVisitProbability` (`hotspot-visit-probability`) | `number` | Chance that a person heads to a hotspot, 0.001–0.2. | `0.02` | ✓ |
| `hotspotStayDuration` (`hotspot-stay-duration`) | `number` | Time spent at a hotspot, in frames. | `240` | ✓ |
| `hotspotMaxAgents` (`hotspot-max-agents`) | `number` | Maximum number of people at one hotspot, 1–120. | `30` | ✓ |
| `hotspotSize` (`hotspot-size`) | `number` | Size of newly placed hotspots, 30–130. | `56` | ✓ |
| `communitiesEnabled` (`communities-enabled`) | `boolean` | Splits the population into communities. | `false` | ✓ |
| `communityLeaveProbability` (`community-leave-probability`) | `number` | Chance that a person leaves their community, 0.0001–0.01. | `0.0004` | ✓ |
| `allow…Control` (`allow-…-control`) | `boolean` | One attribute per parameter above (e.g. `allow-speed-control`, `allow-quarantine-enabled-control`). If set, learners can change this parameter in the sidebar. | `false` | ✓ |
| `widgetState` (`widget-state`) | `string` | JSON with placed hotspots and snapshots. Written by the widget. | `""` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `label` | Localized widget name (e.g. "Epidemiesimulation") |
| `description` | Localized package description |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts besides the `options` part used by WebWriter for the author options.*
