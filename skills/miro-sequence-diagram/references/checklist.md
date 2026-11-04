# Sequence checklist

Run this against the source you sent and the `result_svg` before you report done.

## Notation

- [ ] Frame title starts with `[SEQ] ` and names one scenario.
- [ ] `autonumber` is on.
- [ ] The initiating actor is the leftmost participant. Data stores and external systems are on the right.
- [ ] Humans are `actor`, everything else is `participant`. Every participant sends or receives at least one message.
- [ ] Every call has a reply when the caller waits for one, and every reply says what comes back.
- [ ] No vague labels (*uses, handles, processes, manages, sends data, OK, response*).
- [ ] Every activation is closed. No `-` deactivation on replies in more than one `alt` branch.
- [ ] Fragments nest at most two deep. Guards are written as conditions.
- [ ] Only Mermaid 10 syntax listed in `notation.md` ("Mermaid limits on Miro").
- [ ] Within budget: at most 8 participants and 20 messages, or split.

## Widget and layout

- [ ] The diagram widget rendered (not skipped). If the response lists it as failed, fix the Mermaid and resend; do not switch to hand-drawn shapes.
- [ ] Frame is big enough for the size estimate in `layout.md`. Nothing overlaps the legend or footer after the widget grew; move the legend and footer down if it did.
- [ ] Header, subtitle, scenario line, legend, and footer are in their regions.
- [ ] Every `UNKNOWN/VERIFY` item is listed in the legend.

## Record

- [ ] Map row written: type `sequence`, frameId, title, one-sentence description, links.
- [ ] Frame link and the step count reported to the user.
