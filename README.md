# Epidemic Sim (`@webwriter/epidemic-sim@2.1.2`)
[License: MIT](LICENSE) | Version: 2.1.2

Model how diseases spread through populations and explore intervention effects.

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

Input: everything works with mouse, touch and keyboard. On the map, Enter selects the next hotspot (Shift+Enter
the previous one), the arrow keys move the selected hotspot (Shift for fine steps), Delete removes it and
Escape ends placing. Placing and deleting also have visible buttons, so no right click is needed.

Data: the curves export as CSV (`text/csv`) or a native `table`; the parameters export and import as JSON (`.json`, the
setting names, for example `{"modelType": "seir", "population": 300}`). An import checks every value first and
changes nothing when one is wrong; hotspots and snapshots are not in the file. Signals for other widgets:
`infected` (number of infected people), `history` (table: day column and one column per compartment, one row
per day) and `ended` (boolean). Connect a chart widget to `#id[history]`.

Layout: 300 to 2100 px wide; controls move below the map under 640 px, curves and map sit side by side from 1100 px.
Theme: text uses `--ww-text-color` and `--ww-font-family`, hotspots use `--ww-theme-accent-1`; the state colors stay fixed.
Print: curves and map print as pictures of their current state with the parameter values; buttons are hidden.

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
| `WebwriterEpidemicSim.optionGroups` | - | - | `OPTION_GROUPS` | ✗ |
| `WebwriterEpidemicSim.actions` | - | - | `DATA_ACTIONS` | ✗ |
| `WebwriterEpidemicSim.convertFrom` | `object` | - | `{".json": importParameters}` | ✗ |
| `WebwriterEpidemicSim.convertTo` | `object` | - | `{"text/csv": exportHistoryCsv, ".json": exportParameters, table: exportHistoryTable}` | ✗ |
| `options` | - | - | - | ✗ |
| `localize` | - | - | - | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | - | - | - | ✗ |
| `insightsOpen` | `boolean` | - | `false` | ✗ |
| `isFullscreen` | `boolean` | - | `false` | ✗ |
| `snapshotsOverlayOpen` | `boolean` | - | `false` | ✗ |
| `chartContextMenuOpen` | `boolean` | - | `false` | ✗ |
| `chartContextMenuPosition` | `object` | - | `{x: 0, y: 0}` | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `historyTable` | - | -
| `clearSnapshots` | - | -
| `removeHotspots` | - | -
| `parameterValues` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Events
| Name | Description |
| :--: | :---------: |
| optionschange | - |

*[Events](https://developer.mozilla.org/en-US/docs/Web/Events) are dispatched by the widget after certain triggers.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| chart | The card around the curves. |
| map | The card around the simulation map. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, or custom CSS properties.*


---
*Generated with @webwriter/build@1.15.0*
