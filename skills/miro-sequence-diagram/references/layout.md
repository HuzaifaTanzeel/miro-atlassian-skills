# Sequence frame layout

The frame holds a header, a subtitle, a scenario line, one Mermaid diagram widget, a legend, and a footer. Coordinates are frame-relative.

## Frame size

Sequence frames are the one exception to the two-frame-sizes rule, because the diagram widget grows with its content.

- P = number of participants. L = number of messages + notes + fragment lines (`alt`, `else`, `opt`, `loop`, `par`, `and`, `break`, `critical`, `option`, `end`).
- Diagram estimate: width 250 x P, height 150 + 42 x L. Measured on a 5-participant, 22-line diagram at width 1472: about 1080 px.
- Frame width = max(1600, 250 x P + 128), rounded up to the next 100.
- Frame height = max(1200, 260 + (150 + 42 x L) + 220), rounded up to the next 100. Too tall leaves a blank band above the legend, and the frame cannot be shrunk without recreating it, so do not pad further.

## Regions

| Element | Position | Content |
|---|---|---|
| Header | textArea x=64, y=56, width W - 128, 33 px bold | Scenario title without the prefix |
| Subtitle | textArea x=64, y=124, width = frame width - 128, 18 px `#595959` | `Scope: <system>. Shows <the one question>.` |
| Scenario line | textArea x=64, y=170, same width, 16 px `#595959` | `Trigger: ... \| Preconditions: ... \| Outcome: ...` (keep each part short) |
| Diagram | `<foreignObject data-type="diagram">` x=64, y=260 | The Mermaid source. Write width W - 128 and height 900. Miro resizes the widget to fit the rendered diagram and the size cannot be changed later; read-back and `canvas_search` always report 1600 x 900, so a frame may look 64 px wider in search results. Set `data-title` to the frame title. |
| Legend | textArea x=64, y=frame height - 168, width 900, 16 px | Only the arrow kinds used |
| Footer | textArea right-aligned, x=frame width - 564, y=frame height - 96, width 500 | `Status: Draft \| v1 \| YYYY-MM-DD` |

## Legend text

```text
Solid arrow: call, the sender waits. Dashed arrow: reply.
Open arrow: asynchronous message. Cross: rejected or lost message.
Numbers are step numbers used in the Confluence description.
```

## Colors

Leave the Mermaid diagram unstyled. Miro renders sequence diagrams with its own theme, and the shared color contract does not apply to lifelines. Use `rect rgb(...)` highlighting only when the user asks to mark a region, and then only with a faint fill such as `rgb(240, 245, 253)`.

## Full frame skeleton

```xml
<svg xmlns="http://www.w3.org/2000/svg">
<g id="f_seq" transform="translate(X,Y)" data-frame="[SEQ] Submit expense claim">
<rect data-type="frame" x="0" y="0" width="1600" height="1300" fill="#ffffff" data-title="[SEQ] Submit expense claim" />
<textArea x="64" y="56" width="1472" font-family="noto_sans" font-size="33" font-weight="bold" fill="#1a1a1a">Submit expense claim</textArea>
<textArea x="64" y="124" width="1472" font-family="noto_sans" font-size="18" fill="#595959">Scope: Expense Service. Shows how a claim is submitted and checked against policy.</textArea>
<textArea x="64" y="170" width="1472" font-family="noto_sans" font-size="16" fill="#595959">Trigger: employee submits a claim | Preconditions: employee signed in | Outcome: claim stored as Submitted, or rejected over limit</textArea>
<foreignObject id="seq" x="64" y="260" width="1472" height="900" data-type="diagram" data-title="[SEQ] Submit expense claim">
sequenceDiagram
autonumber
...
</foreignObject>
<textArea x="64" y="1132" width="900" font-family="noto_sans" font-size="16" fill="#595959">Solid arrow: call, the sender waits. Dashed arrow: reply.<br/>Numbers are step numbers used in the Confluence description.</textArea>
<textArea x="1036" y="1204" width="500" font-family="noto_sans" font-size="16" text-align="right" fill="#595959">Status: Draft | v1 | 2026-01-01</textArea>
</g>
</svg>
```
