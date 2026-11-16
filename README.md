# Epidemic Sim (`@webwriter/epidemic-sim@2.0.0`)
[License: MIT](LICENSE) | Version: 2.0.0

Interactive agent-based epidemic simulation (SIR/SIRS/SEIR/SIRD/SEIRD) for WebWriter explorables, with charts, quarantine, hotspots, and communities.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Corona Verlauf | `@webwriter/epidemic-sim/snippets/corona-verlauf.html` |



## `WebwriterEpidemicSim` (`<webwriter-epidemic-sim>`)
Agent-based epidemic simulation with a live chart, a simulation map and optional interventions.

People are dots on a map; an infected dot within the infection radius of a susceptible one may infect it.
The model (SIR, SIRS, SEIR, SIRD, SEIRD) decides which states exist. Learners can switch on quarantine,
hotspots (places where people gather) and communities, save snapshots of the curves and read key figures
such as R0 in the insights panel. Authors set the parameters in the options panel; each has an
`allow-...-control` attribute that shows it in the learners' sidebar.

The simulation runs 24 frames per day. Durations are stored in frames and shown in days (120 frames are 5 days).
Settings are attributes. Hotspots and snapshots are JSON in a direct data block (`<script slot="data">`);
snapshots hold only the curve data, so documents stay small.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/epidemic-sim/widgets/webwriter-epidemic-sim.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/epidemic-sim/widgets/webwriter-epidemic-sim.js"></script>
<webwriter-epidemic-sim></webwriter-epidemic-sim>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/epidemic-sim
```

```html
<link href="@webwriter/epidemic-sim/widgets/webwriter-epidemic-sim.css" rel="stylesheet">
<script type="module" src="@webwriter/epidemic-sim/widgets/webwriter-epidemic-sim.js"></script>
<webwriter-epidemic-sim></webwriter-epidemic-sim>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterEpidemicSim.scopedElements` | `object` | - | `{ "sl-button": SlButton, "sl-card": SlCard, "sl-details": SlDetails, "sl-dropdown": SlDropdown, "sl-icon": SlIcon, "sl-menu": SlMenu, "sl-menu-item": SlMenuItem, "sl-range": SlRange, "sl-switch": SlSwitch, "sl-tag": SlTag, "sl-select": SlSelect, "sl-option": SlOption, }` | ✗ |
| `WebwriterEpidemicSim.optionGroups` | `object` | - | `{ model: {label: (widget: {msg: MsgFn}) => widget.msg("Model"), collapsible: true}, general: {label: (widget: {msg: MsgFn}) => widget.msg("General"), collapsible: true}, quarantine: {label: (widget: {msg: MsgFn}) => widget.msg("Quarantine"), advanced: true}, hotspots: {label: (widget: {msg: MsgFn}) => widget.msg("Hotspots"), advanced: true}, communities: {label: (widget: {msg: MsgFn}) => widget.msg("Communities"), advanced: true}, controls: {label: (widget: {msg: MsgFn}) => widget.msg("Learner controls"), advanced: true}, }` | ✗ |
| `options` | - | - | - | ✗ |
| `localize` | - | - | - | ✗ |
| `msg` | - | - | - | ✗ |
| `insightsOpen` | `boolean` | - | `false` | ✗ |
| `isFullscreen` | `boolean` | - | `false` | ✗ |
| `snapshotsOverlayOpen` | `boolean` | - | `false` | ✗ |
| `chartContextMenuOpen` | `boolean` | - | `false` | ✗ |
| `chartContextMenuPosition` | `object` | - | `{x: 0, y: 0}` | ✗ |
| `isPrintPreparing` | `boolean` | - | `false` | ✗ |
| `WebwriterEpidemicSim.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `finalize` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Events
| Name | Description |
| :--: | :---------: |
| optionschange | - |

*[Events](https://developer.mozilla.org/en-US/docs/Web/Events) are dispatched by the widget after certain triggers.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.9.1*