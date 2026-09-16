# Desktop computer journey measurement

The computer can help a visitor choose a project and open the demo request. This extension records those explicit interactions through the existing consent-gated analytics adapter. It does not establish that the conversation improves inquiries or sales; those outcomes require actual observations after launch.

## Application contract

Call `analytics.computerInteraction(stage, intent?)` once in the handler for the corresponding deliberate action. Do not call it from rendering, mount effects, animation frames or automatic mood changes. Repeated deliberate clicks remain separate interactions; the adapter cannot distinguish two real clicks from a caller accidentally invoking it twice.

The event is `computer_interaction`, with exactly two business parameters:

| Parameter | Allowed values |
| --- | --- |
| `interaction_stage` | `open`, `intent_selected`, `attitude_requested`, `gesture_requested`, `mood_selected`, `back`, `demo_clicked`, `dismissed` |
| `project_intent` | `design`, `rescue`, `search`, `care`, `unsure`; omitted method input becomes `not_selected` |

`unsure` means the visitor selected help deciding. `not_selected` means no project choice accompanies that interaction. Unknown values are rejected rather than copied or coerced into a valid category. `ComputerStage` and `ComputerIntent` are exported from `apps/web/src/measurement/analytics.mjs` through its TypeScript declaration.

| Stage | The action represented |
| --- | --- |
| `open` | The visitor opens the computer conversation. |
| `intent_selected` | The visitor chooses a finite project option. |
| `attitude_requested` | The visitor explicitly asks for the computer’s roast or attitude. |
| `gesture_requested` | The visitor explicitly asks for the censored gesture. |
| `mood_selected` | The visitor deliberately chooses a computer mood; its text is not collected. |
| `back` | The visitor returns within the conversation. |
| `demo_clicked` | The visitor follows the computer’s demo link. |
| `dismissed` | The visitor closes the conversation. |

At the actual demo-link click, call `computerInteraction('demo_clicked', intent)` and `demoStart('computer')`. These are two distinct event types describing the same action for different reports; do not sum them as two demo entries. The destination may carry the finite project selection using `/contact/?project=design&from=computer#demo-request`. The analytics adapter receives the finite intent, never that URL. Opening the contact page or preselecting a form option must not emit another `demo_start`.

The existing `generateLead('smtp_accepted', requestId)` boundary remains unchanged: the form must first receive an HTTP success response with `ok === true`, `status === 'accepted'` and a string `requestId`. A demo click, mood, gesture, validation error, navigation or thank-you view cannot produce this event. The operational receipt stays in the existing bounded in-memory duplicate cache and never enters analytics parameters or browser storage. SMTP acceptance does not establish inbox arrival, qualification or revenue.

The independently reviewed form handoff is implemented in `components/demo-intent.mjs` and `DemoForm.tsx`. It accepts exactly one `from=computer` and one allowed project value, ignores unrelated parameters, and returns only a finite choice and fixed label. Initial server and client state stays `unsure`; an effect applies the choice once after hydration. Every field edit marks the form as edited, and the merge preserves all fields except the untouched project selector. A later URL change cannot replace a choice that was already applied or overwrite an edited form. Prefilling does not move focus or emit measurement events. Its four parser/preservation tests also passed in the separate review; browser hydration and focus behavior were not exercised.

## Consent and data limits

No valid measurement ID or no analytics consent means these methods return `false` and emit nothing. Interactions before consent are discarded, not buffered or replayed. Withdrawal disables subsequent collection, clears queued commands and retains the existing cookie-cleanup behavior. A blocked tag also stops these events. The computer and form continue to work regardless of the measurement state.

The new schema uses the same strict runtime validation as the existing events: it rejects additional fields, arbitrary values, inherited payloads and accessor properties. It collects no conversation text, mood labels, names, emails, phone numbers, business names, form content, selector, pointer position, receipt or user-provided URL. The adapter adds only its existing finite relative route and fixed title, an empty referrer and the configured destination ID. Raw query strings and fragments do not enter these commands. No new identity, storage, recorder, server analytics or live-account integration is introduced.

## Reporting and evidence

The unit is an **event count**, scoped to consented browser interactions observed in a declared reporting period. Record the actual property timezone, report window, sample count and test/internal-traffic treatment before comparison. A count of `demo_start` with `entry_point=computer` is not a count of unique visitors or accepted inquiries. Repeated actions, consent choices and tag/network failures affect the observed counts. Use the `interaction_stage` and finite `project_intent` parameters as event context; they are not customer identities or durable profiles.

There is no new per-lead computer-attribution parameter or join key. Aggregate computer starts and aggregate accepted leads therefore cannot establish which inquiries the computer caused. Missing account observations remain unavailable, never zero. Any comparison of variants needs an actual comparison design and observed data; passing these tests establishes neither increased engagement nor a conversion improvement.

Local evidence, 2026-09-13: the six new computer-journey tests and fourteen existing measurement tests passed **20/20, with no failures or skips**. They execute the actual adapter using a mock DOM and inspect emitted commands. Cases cover the complete finite dictionary, rejection of unexpected/sensitive fields, no pre-consent replay, one event per explicit invocation, withdrawal and tag failure, and the unchanged SMTP acceptance boundary.

```sh
node --test tests/measurement/computer-funnel.test.mjs tests/measurement/measurement.test.mjs
```

No browser, live-account, email or production measurement call was made for this extension. These tests do not prove third-party network payloads, live receipt in GA4 or behavior in a rendered browser. Browser verification is blocked by the session’s explicit policy. The existing launch checks and external-account limitations in `docs/MEASUREMENT.md` still apply; this document adds the new event and `computer` entry-point definitions to that base contract.
