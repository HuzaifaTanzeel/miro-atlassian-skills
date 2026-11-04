# Mermaid patterns and escaping

## Escaping inside the SVG

The Mermaid source is the body of a `<foreignObject data-type="diagram">`, so it is XML text:

| You mean | Write in the SVG body |
|---|---|
| `->>` | `-&gt;&gt;` |
| `-->>` | `--&gt;&gt;` |
| `-)` | `-)` |
| `-x` | `-x` |
| `&` in a label | `&amp;` |
| `<` or `>` in a label | `&lt;` `&gt;` (better: reword) |
| `;` in a label | `#59;` (Mermaid treats `;` as a line break) |
| `#` in a label | `#35;` |

Other rules:

- Start every Mermaid line at column zero, or indent every line by the same amount.
- No HTML tags in message labels. A line break in a **note** may use `&lt;br/&gt;`.
- Do not start a label with the word `end`, and never use `end` as a participant id.
- Keep labels under about 40 characters so lifelines stay 250 px apart.

## Pattern 1: request with validation branch

Mermaid as you would read it:

```text
sequenceDiagram
autonumber
actor E as Employee
participant UI as Web App
participant API as Expense API
participant DB as Claims DB
E->>UI: Submit claim (amount, receipt)
UI->>API: POST /claims (amount, file)
activate API
API->>API: Check policy limit
alt within policy limit
API->>+DB: Insert claim (Submitted)
DB-->>-API: claimId
API-->>UI: 201 Created (claimId)
else over policy limit
API-->>UI: 422 Over limit
end
deactivate API
UI-->>E: Show claim status
```

The same body inside the SVG (arrows escaped):

```xml
<foreignObject id="seq" x="64" y="260" width="1472" height="900" data-type="diagram" data-title="[SEQ] Submit expense claim">
sequenceDiagram
autonumber
actor E as Employee
participant UI as Web App
participant API as Expense API
participant DB as Claims DB
E-&gt;&gt;UI: Submit claim (amount, receipt)
UI-&gt;&gt;API: POST /claims (amount, file)
activate API
API-&gt;&gt;API: Check policy limit
alt within policy limit
API-&gt;&gt;+DB: Insert claim (Submitted)
DB--&gt;&gt;-API: claimId
API--&gt;&gt;UI: 201 Created (claimId)
else over policy limit
API--&gt;&gt;UI: 422 Over limit
end
deactivate API
UI--&gt;&gt;E: Show claim status
</foreignObject>
```

## Pattern 2: asynchronous notification

```text
API-)Queue: ClaimSubmitted (claimId)
Queue-)Mailer: ClaimSubmitted (claimId)
Mailer-)Approver: E-mail: claim waiting
```

## Pattern 3: early exit

```text
UI->>+IdP: Validate session token
IdP-->>-UI: Token status
break token expired
UI-->>E: Redirect to sign-in
end
```

## Pattern 4: loop and parallel work

```text
loop each receipt
UI->>+API: Upload receipt (file)
API-->>-UI: receiptId
end
par notify approver
API-)Mailer: Approval request
and audit
API-)Audit: ClaimSubmitted event
end
```

## Pattern 5: regulated-data note

```text
Note over API,DB: Personal data stays in the in-country region
```

## Sizing

Miro sizes the widget after rendering. Estimate from the source:

- Width = 250 px per participant.
- Height = 300 px + 50 px per message, note, and fragment line (`alt`, `else`, `loop`, `end`, ...).

Use the estimate to size the frame (see `layout.md`), so nothing overlaps after the widget grows.
