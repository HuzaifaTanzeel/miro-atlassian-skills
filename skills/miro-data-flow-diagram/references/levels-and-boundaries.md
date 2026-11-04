# Levels, boundaries, and layout

Frame-relative coordinates. Header, subtitle, legend, and footer positions are in `miro-board-conventions.md` section 3.

## The five element categories

Adapted from Microsoft's Threat Modeling Tool documentation (CC BY 4.0). Use these to decide what kind of element something is:

| Category | Examples |
|---|---|
| Process | Applications, services, background jobs, functions, browser apps |
| External interactor (entity) | Users, browsers, partner systems, authentication providers, regulators |
| Data store | Databases, object storage, caches, configuration files, queues, registers |
| Data flow | HTTPS calls, file transfers, messages, e-mails, events |
| Trust boundary | Corporate network, internet, cloud region or country, tenant, sandbox, admin zone |

## Context diagram layout (`[DFD-0]`, frame 1600 x 1200)

| Element | Position |
|---|---|
| Process `0` | rect x=620, y=520, 360 x 160, `rx="24"`, label `0&lt;br&gt;System name`, 22 px bold |
| System trust boundary (if the system's hosting is a boundary) | x=560, y=460, 480 x 280. Keep its label to 24 characters or fewer (`Trust boundary: Platform`) so it fits between the diagonal flows from the corner slots and a top-slot flow at x=800. Put details such as the region in the subtitle or the legend. |
| Entity slots, 240 x 100 | Left: (120, 200), (120, 550), (120, 880). Right: (1240, 200), (1240, 550), (1240, 880). Top: (680, 200). Bottom: (680, 880). Fill the corner slots first; a middle slot gives a short horizontal flow, so keep its label under 20 characters. |

- Put sources of data on the left and receivers on the right. Two-way partners go wherever there is room, users first on the left.
- Flows from a left entity: start `right`, end `left` of process `0`. Right entity: start `left` of the entity (or of the process if the process sends), end on the facing side. Top: `bottom` to `top`. Bottom: `top` to `bottom`.
- If two entities share a slot row and a boundary (for example "outside the country"), draw a second trust boundary around them with 32 px margin.
- Miro attaches connectors only at side midpoints. Put at most two flows on one side of process `0`, and when two share a side use `data-shape="straight"` so they fan in instead of overlapping on one elbowed segment. With five or six entities, use the top and bottom slots so each side carries one or two flows, and move the side entities to the corner slots (120, 200), (120, 880), (1240, 200), (1240, 880). Miro puts a connector label at the middle of the line and it cannot be moved; from the corner slots the labels of the diagonal flows land clear of the trust boundary's own label.

## Level-1 layout (`[DFD-1]`, frame 2400 x 1600)

| Element | Position |
|---|---|
| Left entities, 240 x 100 | x=80, y = 260, 520, 780, 1040 |
| Right entities, 240 x 100 | x=2080, y = 260, 520, 780, 1040 |
| Processes, 280 x 140, `rx="24"` | Columns x = 480, 880, 1280, 1680. Rows y = 240 and 600. Fill row 1 left to right in data order, then row 2 |
| Data stores, 320 x 90 | Row y = 1000, centred under the process that writes them: x = process x - 20 |
| Platform trust boundary | Around all processes and stores: x=420, y=200, width 1600, height 940 |
| Further boundaries | Around a group of entities that share a boundary (for example third parties outside the country), with 32 px margin |

- Order processes along the main data path, left to right: intake first, then validation, decision, output.
- Stores sit below the processes so store flows run vertically: process `bottom` to store `top` for a write, store `top` to process `bottom` for a read, `data-arrow="both"` for read and write.
- Entity flows run horizontally: left entity `right` to process `left`; process `right` to right entity `left`.
- Process-to-process flows: same row `right` to `left`; next row `bottom` to `top`.

## Drawing order in the SVG

1. Frame, header, subtitle.
2. Trust boundaries (so they sit behind everything).
3. Processes, then stores, then entities.
4. Legend and footer.
5. All connectors.

## Shape snippets

```xml
<rect id="tb_platform" x="420" y="200" width="1600" height="940" fill="none" stroke="#CC7830" stroke-width="2" stroke-dasharray="5,5" data-content="Trust boundary: Platform, in-country region" data-text-color="#542700" data-font-family="noto_sans" data-font-size="16" data-font-weight="bold" data-text-align="left" data-text-align-vertical="top" />
<rect id="p1" x="480" y="240" width="280" height="140" rx="24" fill="#9CE6FF" stroke="#2C97BB" stroke-width="2" data-text-color="#1C4657" data-font-family="noto_sans" data-font-size="18" data-font-weight="bold" data-content="1.0&lt;br&gt;Receive claim" />
<rect id="d1" x="460" y="1000" width="320" height="90" data-shape="flow_chart_predefined_process" fill="#FFE86D" stroke="#A28E26" stroke-width="2" data-text-color="#574900" data-font-family="noto_sans" data-font-size="18" data-font-weight="bold" data-content="D1  Claims" />
<rect id="e_employee" x="80" y="260" width="240" height="100" fill="#DDDDD8" stroke="#8A8A7E" stroke-width="2" data-text-color="#434339" data-font-family="noto_sans" data-font-size="18" data-font-weight="bold" data-content="Employee" />
<line x1="0" y1="0" x2="1" y2="1" data-start="e_employee" data-end="p1" data-start-side="right" data-end-side="left" data-shape="elbowed" data-arrow="both" stroke="#8A7BE0" stroke-width="2" data-content="Claim details [PD] / Claim status" />
```

## Legend text

Only the lines for symbols that appear:

```text
Gray box: external entity. Blue rounded box: process. Yellow box with id: data store.
Arrow: data flow toward the receiver. Two heads: data both ways (forward / back).
Dashed orange box: trust boundary. Purple flow: personal data [PD] or sensitive personal data [SPD].
[X-border]: the receiver is outside the in-country boundary.
```
