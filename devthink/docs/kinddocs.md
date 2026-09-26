# Kind documentation

Last verified release: the documentation completion release; the doccheck gate renews the verification on every run.

Every action kind of the immutable 335 kind vocabulary documents its family, its consent class, its capability requirement, its target and value grammar, its policy test and its schema anchor, and carries a reviewed plan fragment that validates against the frozen plan schema. The doccheck gate of the documentation completion release verifies the coverage stays exact: the kind count here matches the action kind catalog the policy module serves, every entry states its fields, and every example parses. The families follow the roadmap grouping: interaction, observation, navigation, tab and window, form and data, capture, network, debugging, memory, workflow, protocol and coordination.

## Interaction kinds

The pointer, keyboard and element surface: every kind that moves, clicks, types or toggles a reviewed element. 45 kinds; the family policy test lives in tests/policy.test.ts.

### `appendtext`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"appendtext","summary":"the reviewed appendtext step","risk":"sensitive","target":"button.reviewed"}
```

### `check`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"check","summary":"the reviewed check step","risk":"sensitive","target":"button.reviewed"}
```

### `chooseradio`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"chooseradio","summary":"the reviewed chooseradio step","risk":"sensitive","target":"button.reviewed"}
```

### `clear`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"clear","summary":"the reviewed clear step","risk":"sensitive","target":"button.reviewed"}
```

### `click`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"click","summary":"the reviewed click step","risk":"sensitive","target":"button.reviewed"}
```

### `clickaria`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"clickaria","summary":"the reviewed clickaria step","risk":"interaction"}
```

### `clickdeep`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"clickdeep","summary":"the reviewed clickdeep step","risk":"interaction","target":"button.reviewed"}
```

### `clickname`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"clickname","summary":"the reviewed clickname step","risk":"interaction"}
```

### `clickpoint`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"clickpoint","summary":"the reviewed clickpoint step","risk":"sensitive"}
```

### `clicktext`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"clicktext","summary":"the reviewed clicktext step","risk":"interaction"}
```

### `dismissdialog`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"dismissdialog","summary":"the reviewed dismissdialog step","risk":"sensitive"}
```

### `doubleclick`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"doubleclick","summary":"the reviewed doubleclick step","risk":"interaction","target":"button.reviewed"}
```

### `downloadfile`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"downloadfile","summary":"the reviewed downloadfile step","risk":"sensitive"}
```

### `enterframe`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"enterframe","summary":"the reviewed enterframe step","risk":"sensitive"}
```

### `expanddetails`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"expanddetails","summary":"the reviewed expanddetails step","risk":"interaction","target":"button.reviewed"}
```

### `focus`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"focus","summary":"the reviewed focus step","risk":"interaction","target":"button.reviewed"}
```

### `hover`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"hover","summary":"the reviewed hover step","risk":"interaction","target":"button.reviewed"}
```

### `keyhold`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"keyhold","summary":"the reviewed keyhold step","risk":"sensitive"}
```

### `keyrelease`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"keyrelease","summary":"the reviewed keyrelease step","risk":"sensitive"}
```

### `movepointer`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"movepointer","summary":"the reviewed movepointer step","risk":"interaction"}
```

### `paginateextract`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"paginateextract","summary":"the reviewed paginateextract step","risk":"sensitive","target":"button.reviewed"}
```

### `pierceshadow`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"pierceshadow","summary":"the reviewed pierceshadow step","risk":"interaction","target":"button.reviewed"}
```

### `presskey`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"presskey","summary":"the reviewed presskey step","risk":"sensitive"}
```

### `removeattribute`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"removeattribute","summary":"the reviewed removeattribute step","risk":"sensitive","target":"button.reviewed"}
```

### `retryaction`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"retryaction","summary":"the reviewed retryaction step","risk":"interaction"}
```

### `rightclick`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"rightclick","summary":"the reviewed rightclick step","risk":"interaction","target":"button.reviewed"}
```

### `scroll`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scroll","summary":"the reviewed scroll step","risk":"interaction","target":"button.reviewed"}
```

### `scrollby`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scrollby","summary":"the reviewed scrollby step","risk":"interaction"}
```

### `scrollend`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scrollend","summary":"the reviewed scrollend step","risk":"interaction"}
```

### `scrollpage`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scrollpage","summary":"the reviewed scrollpage step","risk":"interaction"}
```

### `scrolltop`

- family: interaction
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scrolltop","summary":"the reviewed scrolltop step","risk":"interaction"}
```

### `select`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"select","summary":"the reviewed select step","risk":"sensitive","target":"button.reviewed"}
```

### `selectmulti`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"selectmulti","summary":"the reviewed selectmulti step","risk":"sensitive","target":"button.reviewed"}
```

### `setattribute`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setattribute","summary":"the reviewed setattribute step","risk":"sensitive","target":"button.reviewed"}
```

### `setcolor`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setcolor","summary":"the reviewed setcolor step","risk":"sensitive","target":"button.reviewed"}
```

### `setdate`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setdate","summary":"the reviewed setdate step","risk":"sensitive","target":"button.reviewed"}
```

### `setslider`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setslider","summary":"the reviewed setslider step","risk":"sensitive","target":"button.reviewed"}
```

### `setvalue`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setvalue","summary":"the reviewed setvalue step","risk":"sensitive","target":"button.reviewed"}
```

### `shiftclick`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"shiftclick","summary":"the reviewed shiftclick step","risk":"sensitive","target":"button.reviewed"}
```

### `submit`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"submit","summary":"the reviewed submit step","risk":"sensitive","target":"button.reviewed"}
```

### `toggle`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"toggle","summary":"the reviewed toggle step","risk":"sensitive","target":"button.reviewed"}
```

### `type`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"type","summary":"the reviewed type step","risk":"sensitive","target":"button.reviewed"}
```

### `typeedit`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"typeedit","summary":"the reviewed typeedit step","risk":"sensitive","target":"button.reviewed"}
```

### `typetime`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"typetime","summary":"the reviewed typetime step","risk":"sensitive","target":"button.reviewed"}
```

### `uncheck`

- family: interaction
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/policy.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"uncheck","summary":"the reviewed uncheck step","risk":"sensitive","target":"button.reviewed"}
```

## Observation kinds

The read-only surface: every kind that observes, inspects, extracts or waits without changing the page. 50 kinds; the family policy test lives in tests/pagebridge.test.ts.

### `a11ytree`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"a11ytree","summary":"the reviewed a11ytree step","risk":"read"}
```

### `classifypage`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"classifypage","summary":"the reviewed classifypage step","risk":"read"}
```

### `countelements`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"countelements","summary":"the reviewed countelements step","risk":"read","target":"button.reviewed"}
```

### `countpages`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"countpages","summary":"the reviewed countpages step","risk":"read"}
```

### `deriveselector`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"deriveselector","summary":"the reviewed deriveselector step","risk":"read","target":"button.reviewed"}
```

### `detectinfinitescroll`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectinfinitescroll","summary":"the reviewed detectinfinitescroll step","risk":"read"}
```

### `detectlanguage`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectlanguage","summary":"the reviewed detectlanguage step","risk":"read"}
```

### `detectlazy`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectlazy","summary":"the reviewed detectlazy step","risk":"read"}
```

### `detectlists`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectlists","summary":"the reviewed detectlists step","risk":"read"}
```

### `detectscrolllock`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectscrolllock","summary":"the reviewed detectscrolllock step","risk":"read"}
```

### `detectsticky`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectsticky","summary":"the reviewed detectsticky step","risk":"read"}
```

### `detecttables`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detecttables","summary":"the reviewed detecttables step","risk":"read"}
```

### `detectvirtual`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectvirtual","summary":"the reviewed detectvirtual step","risk":"read"}
```

### `diffsnapshots`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"diffsnapshots","summary":"the reviewed diffsnapshots step","risk":"read"}
```

### `extract`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"extract","summary":"the reviewed extract step","risk":"read"}
```

### `fingerprintsection`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"fingerprintsection","summary":"the reviewed fingerprintsection step","risk":"read","target":"button.reviewed"}
```

### `highlight`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"highlight","summary":"the reviewed highlight step","risk":"read","target":"button.reviewed"}
```

### `inspect`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"inspect","summary":"the reviewed inspect step","risk":"read","target":"button.reviewed"}
```

### `listframes`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"listframes","summary":"the reviewed listframes step","risk":"read"}
```

### `listshadow`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"listshadow","summary":"the reviewed listshadow step","risk":"read"}
```

### `mapclicks`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"mapclicks","summary":"the reviewed mapclicks step","risk":"read"}
```

### `mergepages`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"mergepages","summary":"the reviewed mergepages step","risk":"read"}
```

### `observe`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"observe","summary":"the reviewed observe step","risk":"read"}
```

### `readattribute`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readattribute","summary":"the reviewed readattribute step","risk":"read","target":"button.reviewed"}
```

### `readertree`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readertree","summary":"the reviewed readertree step","risk":"read"}
```

### `readgeometry`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readgeometry","summary":"the reviewed readgeometry step","risk":"read","target":"button.reviewed"}
```

### `readhtml`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readhtml","summary":"the reviewed readhtml step","risk":"read","target":"button.reviewed"}
```

### `readimages`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readimages","summary":"the reviewed readimages step","risk":"read"}
```

### `readlang`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readlang","summary":"the reviewed readlang step","risk":"read"}
```

### `readlinks`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readlinks","summary":"the reviewed readlinks step","risk":"read"}
```

### `readmeta`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readmeta","summary":"the reviewed readmeta step","risk":"read"}
```

### `readopengraph`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readopengraph","summary":"the reviewed readopengraph step","risk":"read"}
```

### `readoutline`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readoutline","summary":"the reviewed readoutline step","risk":"read"}
```

### `readscrollpos`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readscrollpos","summary":"the reviewed readscrollpos step","risk":"read"}
```

### `readselection`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readselection","summary":"the reviewed readselection step","risk":"read"}
```

### `readstyle`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readstyle","summary":"the reviewed readstyle step","risk":"read","target":"button.reviewed"}
```

### `readtable`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readtable","summary":"the reviewed readtable step","risk":"read","target":"button.reviewed"}
```

### `readtext`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readtext","summary":"the reviewed readtext step","risk":"read","target":"button.reviewed"}
```

### `readvalue`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readvalue","summary":"the reviewed readvalue step","risk":"read","target":"button.reviewed"}
```

### `readvisible`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readvisible","summary":"the reviewed readvisible step","risk":"read"}
```

### `resolvexpath`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"resolvexpath","summary":"the reviewed resolvexpath step","risk":"read"}
```

### `verifyenabled`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"verifyenabled","summary":"the reviewed verifyenabled step","risk":"read","target":"button.reviewed"}
```

### `verifyvisible`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"verifyvisible","summary":"the reviewed verifyvisible step","risk":"read","target":"button.reviewed"}
```

### `wait`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"wait","summary":"the reviewed wait step","risk":"read"}
```

### `waitfor`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"waitfor","summary":"the reviewed waitfor step","risk":"read","target":"button.reviewed"}
```

### `waitquiet`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"waitquiet","summary":"the reviewed waitquiet step","risk":"read"}
```

### `waittext`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"waittext","summary":"the reviewed waittext step","risk":"read"}
```

### `watchbanner`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchbanner","summary":"the reviewed watchbanner step","risk":"read"}
```

### `watchfocus`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchfocus","summary":"the reviewed watchfocus step","risk":"read"}
```

### `watchmutate`

- family: observation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/pagebridge.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchmutate","summary":"the reviewed watchmutate step","risk":"read"}
```

## Navigation kinds

The address bar surface: every kind that navigates, reloads, waits for or audits a reviewed origin. 21 kinds; the family policy test lives in tests/navigation.test.ts.

### `back`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"back","summary":"the reviewed back step","risk":"sensitive"}
```

### `checksafe`

- family: navigation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"checksafe","summary":"the reviewed checksafe step","risk":"read"}
```

### `followlink`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"followlink","summary":"the reviewed followlink step","risk":"sensitive"}
```

### `forward`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"forward","summary":"the reviewed forward step","risk":"sensitive"}
```

### `navigate`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"navigate","summary":"the reviewed navigate step","risk":"sensitive"}
```

### `navintent`

- family: navigation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"navintent","summary":"the reviewed navintent step","risk":"read"}
```

### `navlist`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"navlist","summary":"the reviewed navlist step","risk":"sensitive"}
```

### `navprofile`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"navprofile","summary":"the reviewed navprofile step","risk":"sensitive"}
```

### `navrate`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"navrate","summary":"the reviewed navrate step","risk":"sensitive"}
```

### `openlink`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"openlink","summary":"the reviewed openlink step","risk":"sensitive"}
```

### `pausenav`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"pausenav","summary":"the reviewed pausenav step","risk":"sensitive"}
```

### `reload`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"reload","summary":"the reviewed reload step","risk":"sensitive"}
```

### `reloadcache`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"reloadcache","summary":"the reviewed reloadcache step","risk":"sensitive"}
```

### `rewritequery`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"rewritequery","summary":"the reviewed rewritequery step","risk":"sensitive"}
```

### `setfragment`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setfragment","summary":"the reviewed setfragment step","risk":"sensitive"}
```

### `spanav`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"spanav","summary":"the reviewed spanav step","risk":"sensitive"}
```

### `spawait`

- family: navigation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"spawait","summary":"the reviewed spawait step","risk":"read"}
```

### `stopnav`

- family: navigation
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"stopnav","summary":"the reviewed stopnav step","risk":"sensitive"}
```

### `trailaudit`

- family: navigation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"trailaudit","summary":"the reviewed trailaudit step","risk":"read"}
```

### `waitload`

- family: navigation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"waitload","summary":"the reviewed waitload step","risk":"read"}
```

### `waiturl`

- family: navigation
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/navigation.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"waiturl","summary":"the reviewed waiturl step","risk":"read"}
```

## Tab and window kinds

The tab strip and window surface: every kind that opens, focuses, groups, arranges or closes tabs and windows. 44 kinds; the family policy test lives in tests/torture-commands.test.ts.

### `attachmeta`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"attachmeta","summary":"the reviewed attachmeta step","risk":"read"}
```

### `badgetab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"badgetab","summary":"the reviewed badgetab step","risk":"sensitive"}
```

### `batchopen`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"batchopen","summary":"the reviewed batchopen step","risk":"sensitive"}
```

### `closepattern`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"closepattern","summary":"the reviewed closepattern step","risk":"sensitive"}
```

### `collapsegroup`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"collapsegroup","summary":"the reviewed collapsegroup step","risk":"sensitive"}
```

### `colorgroup`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"colorgroup","summary":"the reviewed colorgroup step","risk":"sensitive"}
```

### `deeplink`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"deeplink","summary":"the reviewed deeplink step","risk":"sensitive"}
```

### `discardtab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"discardtab","summary":"the reviewed discardtab step","risk":"sensitive"}
```

### `duplicatetab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"duplicatetab","summary":"the reviewed duplicatetab step","risk":"sensitive"}
```

### `findclones`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"findclones","summary":"the reviewed findclones step","risk":"read"}
```

### `focuswindow`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"focuswindow","summary":"the reviewed focuswindow step","risk":"sensitive"}
```

### `fullscreen`

- family: tab and window
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"fullscreen","summary":"the reviewed fullscreen step","risk":"interaction"}
```

### `grouptabs`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"grouptabs","summary":"the reviewed grouptabs step","risk":"sensitive"}
```

### `incognitowindow`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"incognitowindow","summary":"the reviewed incognitowindow step","risk":"sensitive"}
```

### `listaudio`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"listaudio","summary":"the reviewed listaudio step","risk":"read"}
```

### `maximizewindow`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"maximizewindow","summary":"the reviewed maximizewindow step","risk":"sensitive"}
```

### `minimizewindow`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"minimizewindow","summary":"the reviewed minimizewindow step","risk":"sensitive"}
```

### `movetab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"movetab","summary":"the reviewed movetab step","risk":"sensitive"}
```

### `movetabwindow`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"movetabwindow","summary":"the reviewed movetabwindow step","risk":"sensitive"}
```

### `mutetab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"mutetab","summary":"the reviewed mutetab step","risk":"sensitive"}
```

### `openprivate`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"openprivate","summary":"the reviewed openprivate step","risk":"sensitive"}
```

### `pintab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"pintab","summary":"the reviewed pintab step","risk":"sensitive"}
```

### `querytabs`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"querytabs","summary":"the reviewed querytabs step","risk":"read"}
```

### `reloadtabs`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"reloadtabs","summary":"the reviewed reloadtabs step","risk":"sensitive"}
```

### `reopentab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"reopentab","summary":"the reviewed reopentab step","risk":"sensitive"}
```

### `restoretab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"restoretab","summary":"the reviewed restoretab step","risk":"sensitive"}
```

### `restorewindow`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"restorewindow","summary":"the reviewed restorewindow step","risk":"sensitive"}
```

### `scratchwindow`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scratchwindow","summary":"the reviewed scratchwindow step","risk":"sensitive"}
```

### `searchtabs`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"searchtabs","summary":"the reviewed searchtabs step","risk":"read"}
```

### `switchtab`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"switchtab","summary":"the reviewed switchtab step","risk":"sensitive"}
```

### `tabactivate`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"tabactivate","summary":"the reviewed tabactivate step","risk":"sensitive"}
```

### `tabclose`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"tabclose","summary":"the reviewed tabclose step","risk":"sensitive"}
```

### `tabcreate`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"tabcreate","summary":"the reviewed tabcreate step","risk":"sensitive"}
```

### `tablist`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"tablist","summary":"the reviewed tablist step","risk":"read"}
```

### `tabreload`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"tabreload","summary":"the reviewed tabreload step","risk":"sensitive"}
```

### `tabsnapshot`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"tabsnapshot","summary":"the reviewed tabsnapshot step","risk":"read"}
```

### `watchtab`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchtab","summary":"the reviewed watchtab step","risk":"read"}
```

### `windowclose`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"windowclose","summary":"the reviewed windowclose step","risk":"sensitive"}
```

### `windowcreate`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"windowcreate","summary":"the reviewed windowcreate step","risk":"sensitive"}
```

### `windowlist`

- family: tab and window
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"windowlist","summary":"the reviewed windowlist step","risk":"read"}
```

### `windowresize`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"windowresize","summary":"the reviewed windowresize step","risk":"sensitive"}
```

### `zoomin`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"zoomin","summary":"the reviewed zoomin step","risk":"sensitive"}
```

### `zoomout`

- family: tab and window
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"zoomout","summary":"the reviewed zoomout step","risk":"sensitive"}
```

### `zoomset`

- family: tab and window
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-commands.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"zoomset","summary":"the reviewed zoomset step","risk":"interaction"}
```

## Form and data kinds

The form and table surface: every kind that fills, submits, scrapes, exports or quarantines reviewed data. 47 kinds; the family policy test lives in tests/torture-data.test.ts.

### `asksubmit`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"asksubmit","summary":"the reviewed asksubmit step","risk":"read"}
```

### `attachfile`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"attachfile","summary":"the reviewed attachfile step","risk":"sensitive","target":"button.reviewed"}
```

### `batchdownload`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"batchdownload","summary":"the reviewed batchdownload step","risk":"sensitive"}
```

### `consentpassword`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"consentpassword","summary":"the reviewed consentpassword step","risk":"sensitive","target":"button.reviewed"}
```

### `copytable`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"copytable","summary":"the reviewed copytable step","risk":"sensitive"}
```

### `deduperows`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"deduperows","summary":"the reviewed deduperows step","risk":"read"}
```

### `detectfields`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectfields","summary":"the reviewed detectfields step","risk":"read"}
```

### `detectlogin`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detectlogin","summary":"the reviewed detectlogin step","risk":"read"}
```

### `detecttemplate`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detecttemplate","summary":"the reviewed detecttemplate step","risk":"read"}
```

### `exportcsv`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"exportcsv","summary":"the reviewed exportcsv step","risk":"sensitive"}
```

### `exportexcel`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"exportexcel","summary":"the reviewed exportexcel step","risk":"sensitive"}
```

### `exportjson`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"exportjson","summary":"the reviewed exportjson step","risk":"sensitive"}
```

### `fillcard`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"fillcard","summary":"the reviewed fillcard step","risk":"sensitive"}
```

### `fillcode`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"fillcode","summary":"the reviewed fillcode step","risk":"sensitive","target":"button.reviewed"}
```

### `fillform`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"fillform","summary":"the reviewed fillform step","risk":"sensitive"}
```

### `filllabel`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"filllabel","summary":"the reviewed filllabel step","risk":"sensitive"}
```

### `fillplaceholder`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"fillplaceholder","summary":"the reviewed fillplaceholder step","risk":"sensitive"}
```

### `generatevalues`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"generatevalues","summary":"the reviewed generatevalues step","risk":"read"}
```

### `handoffcaptcha`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"handoffcaptcha","summary":"the reviewed handoffcaptcha step","risk":"read"}
```

### `importcsv`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"importcsv","summary":"the reviewed importcsv step","risk":"read"}
```

### `looprows`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"looprows","summary":"the reviewed looprows step","risk":"read"}
```

### `openclipboard`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"openclipboard","summary":"the reviewed openclipboard step","risk":"sensitive"}
```

### `pausedownload`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"pausedownload","summary":"the reviewed pausedownload step","risk":"sensitive"}
```

### `pickdate`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"pickdate","summary":"the reviewed pickdate step","risk":"sensitive","target":"button.reviewed"}
```

### `picktypeahead`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"picktypeahead","summary":"the reviewed picktypeahead step","risk":"sensitive","target":"button.reviewed"}
```

### `previewgrid`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"previewgrid","summary":"the reviewed previewgrid step","risk":"read"}
```

### `pushsheets`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"pushsheets","summary":"the reviewed pushsheets step","risk":"sensitive"}
```

### `quarantinedownload`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"quarantinedownload","summary":"the reviewed quarantinedownload step","risk":"sensitive"}
```

### `readclipboard`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readclipboard","summary":"the reviewed readclipboard step","risk":"sensitive"}
```

### `readerrors`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readerrors","summary":"the reviewed readerrors step","risk":"read"}
```

### `readforms`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readforms","summary":"the reviewed readforms step","risk":"read"}
```

### `resumedownload`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"resumedownload","summary":"the reviewed resumedownload step","risk":"sensitive"}
```

### `resumeextract`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"resumeextract","summary":"the reviewed resumeextract step","risk":"sensitive"}
```

### `retryform`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"retryform","summary":"the reviewed retryform step","risk":"sensitive","target":"button.reviewed"}
```

### `runwizard`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"runwizard","summary":"the reviewed runwizard step","risk":"sensitive"}
```

### `saveprofiles`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"saveprofiles","summary":"the reviewed saveprofiles step","risk":"read"}
```

### `scanvirus`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scanvirus","summary":"the reviewed scanvirus step","risk":"sensitive"}
```

### `scrapetable`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"scrapetable","summary":"the reviewed scrapetable step","risk":"read","target":"button.reviewed"}
```

### `selectchain`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"selectchain","summary":"the reviewed selectchain step","risk":"sensitive","target":"button.reviewed"}
```

### `skiphoneypot`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"skiphoneypot","summary":"the reviewed skiphoneypot step","risk":"read"}
```

### `stamplerows`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"stamplerows","summary":"the reviewed stamplerows step","risk":"read"}
```

### `streamdisk`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"streamdisk","summary":"the reviewed streamdisk step","risk":"sensitive"}
```

### `submitform`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"submitform","summary":"the reviewed submitform step","risk":"sensitive","target":"button.reviewed"}
```

### `submitsearch`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"submitsearch","summary":"the reviewed submitsearch step","risk":"sensitive","target":"button.reviewed"}
```

### `transformvalues`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"transformvalues","summary":"the reviewed transformvalues step","risk":"read"}
```

### `verifydownload`

- family: form and data
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"verifydownload","summary":"the reviewed verifydownload step","risk":"read"}
```

### `writeclipboard`

- family: form and data
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-data.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"writeclipboard","summary":"the reviewed writeclipboard step","risk":"sensitive"}
```

## Capture kinds

The capture surface: every kind that shots, records, converts or names visual and media evidence. 20 kinds; the family policy test lives in tests/vision.test.ts.

### `captureaudio`

- family: capture
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"captureaudio","summary":"the reviewed captureaudio step","risk":"sensitive"}
```

### `captureframe`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"captureframe","summary":"the reviewed captureframe step","risk":"read","target":"button.reviewed"}
```

### `capturepdf`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"capturepdf","summary":"the reviewed capturepdf step","risk":"read"}
```

### `cleanupartifacts`

- family: capture
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"cleanupartifacts","summary":"the reviewed cleanupartifacts step","risk":"sensitive"}
```

### `contactsheet`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"contactsheet","summary":"the reviewed contactsheet step","risk":"read"}
```

### `convertimage`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"convertimage","summary":"the reviewed convertimage step","risk":"read"}
```

### `copyscreen`

- family: capture
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"copyscreen","summary":"the reviewed copyscreen step","risk":"sensitive"}
```

### `downloadimages`

- family: capture
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"downloadimages","summary":"the reviewed downloadimages step","risk":"sensitive"}
```

### `makethumbs`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"makethumbs","summary":"the reviewed makethumbs step","risk":"read"}
```

### `namecaptures`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"namecaptures","summary":"the reviewed namecaptures step","risk":"read"}
```

### `probestream`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"probestream","summary":"the reviewed probestream step","risk":"read"}
```

### `readassets`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readassets","summary":"the reviewed readassets step","risk":"read"}
```

### `readmedia`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readmedia","summary":"the reviewed readmedia step","risk":"read"}
```

### `recordscreen`

- family: capture
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"recordscreen","summary":"the reviewed recordscreen step","risk":"sensitive"}
```

### `shotcanvas`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"shotcanvas","summary":"the reviewed shotcanvas step","risk":"read","target":"button.reviewed"}
```

### `shotelement`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"shotelement","summary":"the reviewed shotelement step","risk":"read","target":"button.reviewed"}
```

### `shotfullpage`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"shotfullpage","summary":"the reviewed shotfullpage step","risk":"read"}
```

### `shotregion`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"shotregion","summary":"the reviewed shotregion step","risk":"read"}
```

### `shotview`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"shotview","summary":"the reviewed shotview step","risk":"read"}
```

### `timelapse`

- family: capture
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/vision.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"timelapse","summary":"the reviewed timelapse step","risk":"read"}
```

## Network kinds

The network surface: every kind that fetches, calls, intercepts or watches reviewed traffic. 33 kinds; the family policy test lives in tests/torture-http.test.ts.

### `authflow`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"authflow","summary":"the reviewed authflow step","risk":"sensitive"}
```

### `blockrequest`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"blockrequest","summary":"the reviewed blockrequest step","risk":"sensitive"}
```

### `callgraphql`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"callgraphql","summary":"the reviewed callgraphql step","risk":"sensitive"}
```

### `callrest`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"callrest","summary":"the reviewed callrest step","risk":"sensitive"}
```

### `capturebodies`

- family: network
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"capturebodies","summary":"the reviewed capturebodies step","risk":"interaction"}
```

### `clearcookies`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"clearcookies","summary":"the reviewed clearcookies step","risk":"sensitive"}
```

### `detecthttp`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detecthttp","summary":"the reviewed detecthttp step","risk":"read"}
```

### `exportnetlog`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"exportnetlog","summary":"the reviewed exportnetlog step","risk":"read"}
```

### `extractapi`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"extractapi","summary":"the reviewed extractapi step","risk":"read"}
```

### `fetchurl`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"fetchurl","summary":"the reviewed fetchurl step","risk":"read"}
```

### `handleauth`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"handleauth","summary":"the reviewed handleauth step","risk":"sensitive"}
```

### `interceptmime`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"interceptmime","summary":"the reviewed interceptmime step","risk":"sensitive"}
```

### `longpoll`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"longpoll","summary":"the reviewed longpoll step","risk":"read"}
```

### `mapapi`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"mapapi","summary":"the reviewed mapapi step","risk":"read"}
```

### `mockresponse`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"mockresponse","summary":"the reviewed mockresponse step","risk":"sensitive"}
```

### `opensocket`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"opensocket","summary":"the reviewed opensocket step","risk":"read"}
```

### `parsehtml`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"parsehtml","summary":"the reviewed parsehtml step","risk":"read"}
```

### `parsejson`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"parsejson","summary":"the reviewed parsejson step","risk":"read"}
```

### `postfiles`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"postfiles","summary":"the reviewed postfiles step","risk":"sensitive"}
```

### `postform`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"postform","summary":"the reviewed postform step","risk":"sensitive"}
```

### `preconnect`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"preconnect","summary":"the reviewed preconnect step","risk":"sensitive"}
```

### `prefetch`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"prefetch","summary":"the reviewed prefetch step","risk":"sensitive"}
```

### `printpdf`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"printpdf","summary":"the reviewed printpdf step","risk":"sensitive"}
```

### `readcookies`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readcookies","summary":"the reviewed readcookies step","risk":"read"}
```

### `readfinalurl`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readfinalurl","summary":"the reviewed readfinalurl step","risk":"read"}
```

### `readheaders`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readheaders","summary":"the reviewed readheaders step","risk":"read"}
```

### `readredirects`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readredirects","summary":"the reviewed readredirects step","risk":"read"}
```

### `rewriteheaders`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"rewriteheaders","summary":"the reviewed rewriteheaders step","risk":"sensitive"}
```

### `routeproxy`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"routeproxy","summary":"the reviewed routeproxy step","risk":"sensitive"}
```

### `saveapikey`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"saveapikey","summary":"the reviewed saveapikey step","risk":"sensitive"}
```

### `setcookies`

- family: network
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setcookies","summary":"the reviewed setcookies step","risk":"sensitive"}
```

### `subscribesse`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"subscribesse","summary":"the reviewed subscribesse step","risk":"read"}
```

### `watchrequests`

- family: network
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/torture-http.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchrequests","summary":"the reviewed watchrequests step","risk":"read"}
```

## Debugging kinds

The devtools surface: every kind that attaches, steps, profiles, traces or emulates through the reviewed protocol bridge. 25 kinds; the family policy test lives in tests/runtimeadapters.test.ts.

### `annotatetrace`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"annotatetrace","summary":"the reviewed annotatetrace step","risk":"read"}
```

### `attachcdp`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"attachcdp","summary":"the reviewed attachcdp step","risk":"sensitive"}
```

### `blackboxscripts`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"blackboxscripts","summary":"the reviewed blackboxscripts step","risk":"read"}
```

### `capturesourcemaps`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"capturesourcemaps","summary":"the reviewed capturesourcemaps step","risk":"sensitive"}
```

### `cdpcmd`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"cdpcmd","summary":"the reviewed cdpcmd step","risk":"sensitive"}
```

### `detachcdp`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"detachcdp","summary":"the reviewed detachcdp step","risk":"sensitive"}
```

### `emulatedevice`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"emulatedevice","summary":"the reviewed emulatedevice step","risk":"sensitive"}
```

### `emulatelocate`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"emulatelocate","summary":"the reviewed emulatelocate step","risk":"sensitive"}
```

### `emulatenetwork`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"emulatenetwork","summary":"the reviewed emulatenetwork step","risk":"sensitive"}
```

### `heapshot`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"heapshot","summary":"the reviewed heapshot step","risk":"sensitive"}
```

### `measureflow`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"measureflow","summary":"the reviewed measureflow step","risk":"read"}
```

### `overridepermission`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"overridepermission","summary":"the reviewed overridepermission step","risk":"sensitive"}
```

### `overridescript`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"overridescript","summary":"the reviewed overridescript step","risk":"sensitive"}
```

### `profilecpu`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"profilecpu","summary":"the reviewed profilecpu step","risk":"sensitive"}
```

### `replaytrace`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"replaytrace","summary":"the reviewed replaytrace step","risk":"read"}
```

### `setbreakpoint`

- family: debugging
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setbreakpoint","summary":"the reviewed setbreakpoint step","risk":"interaction"}
```

### `setuseragent`

- family: debugging
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"setuseragent","summary":"the reviewed setuseragent step","risk":"sensitive"}
```

### `stepcode`

- family: debugging
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"stepcode","summary":"the reviewed stepcode step","risk":"interaction"}
```

### `traceload`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"traceload","summary":"the reviewed traceload step","risk":"read"}
```

### `trackmemory`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"trackmemory","summary":"the reviewed trackmemory step","risk":"read"}
```

### `watchcdp`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchcdp","summary":"the reviewed watchcdp step","risk":"read"}
```

### `watchconsole`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchconsole","summary":"the reviewed watchconsole step","risk":"read"}
```

### `watcherrors`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watcherrors","summary":"the reviewed watcherrors step","risk":"read"}
```

### `watchexpr`

- family: debugging
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchexpr","summary":"the reviewed watchexpr step","risk":"interaction"}
```

### `watchshifts`

- family: debugging
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/runtimeadapters.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchshifts","summary":"the reviewed watchshifts step","risk":"read"}
```

## Memory kinds

The session and storage surface: every kind that persists, captures, diffs, searches or moves session state. 15 kinds; the family policy test lives in tests/memory.test.ts.

### `capturesession`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"capturesession","summary":"the reviewed capturesession step","risk":"read"}
```

### `diffsessions`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"diffsessions","summary":"the reviewed diffsessions step","risk":"read"}
```

### `exportsessions`

- family: memory
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"exportsessions","summary":"the reviewed exportsessions step","risk":"sensitive"}
```

### `importsessions`

- family: memory
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"importsessions","summary":"the reviewed importsessions step","risk":"sensitive"}
```

### `logprovenance`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"logprovenance","summary":"the reviewed logprovenance step","risk":"read"}
```

### `namedsessions`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"namedsessions","summary":"the reviewed namedsessions step","risk":"read"}
```

### `persiststate`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"persiststate","summary":"the reviewed persiststate step","risk":"read"}
```

### `readstorage`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readstorage","summary":"the reviewed readstorage step","risk":"read"}
```

### `reopenrun`

- family: memory
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"reopenrun","summary":"the reviewed reopenrun step","risk":"sensitive"}
```

### `restorelayout`

- family: memory
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"restorelayout","summary":"the reviewed restorelayout step","risk":"sensitive"}
```

### `restoresession`

- family: memory
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"restoresession","summary":"the reviewed restoresession step","risk":"sensitive"}
```

### `savelayout`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"savelayout","summary":"the reviewed savelayout step","risk":"read"}
```

### `searchsessions`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"searchsessions","summary":"the reviewed searchsessions step","risk":"read"}
```

### `snapshotsession`

- family: memory
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"snapshotsession","summary":"the reviewed snapshotsession step","risk":"read"}
```

### `writestorage`

- family: memory
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/memory.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"writestorage","summary":"the reviewed writestorage step","risk":"sensitive"}
```

## Workflow kinds

The engine surface: every control, composition, delay and trigger kind that structures a reviewed run. 27 kinds; the family policy test lives in tests/workflow.test.ts.

### `branch`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"branch","summary":"the reviewed branch step","risk":"read"}
```

### `buttonrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"buttonrule","summary":"the reviewed buttonrule step","risk":"sensitive"}
```

### `composeworkflow`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"composeworkflow","summary":"the reviewed composeworkflow step","risk":"read"}
```

### `compute`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"compute","summary":"the reviewed compute step","risk":"read"}
```

### `condition`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"condition","summary":"the reviewed condition step","risk":"read"}
```

### `cronrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"cronrule","summary":"the reviewed cronrule step","risk":"sensitive"}
```

### `delay`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"delay","summary":"the reviewed delay step","risk":"read"}
```

### `dryrun`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"dryrun","summary":"the reviewed dryrun step","risk":"read"}
```

### `eventrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"eventrule","summary":"the reviewed eventrule step","risk":"sensitive"}
```

### `extractvars`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"extractvars","summary":"the reviewed extractvars step","risk":"read"}
```

### `foreach`

- family: workflow
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"foreach","summary":"the reviewed foreach step","risk":"interaction"}
```

### `intervalrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"intervalrule","summary":"the reviewed intervalrule step","risk":"sensitive"}
```

### `keyrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"keyrule","summary":"the reviewed keyrule step","risk":"sensitive"}
```

### `listruns`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"listruns","summary":"the reviewed listruns step","risk":"read"}
```

### `loop`

- family: workflow
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"loop","summary":"the reviewed loop step","risk":"interaction"}
```

### `menurule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"menurule","summary":"the reviewed menurule step","risk":"sensitive"}
```

### `parallel`

- family: workflow
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"parallel","summary":"the reviewed parallel step","risk":"interaction"}
```

### `repeatuntil`

- family: workflow
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"repeatuntil","summary":"the reviewed repeatuntil step","risk":"interaction"}
```

### `runworkflow`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"runworkflow","summary":"the reviewed runworkflow step","risk":"sensitive"}
```

### `savetemplate`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"savetemplate","summary":"the reviewed savetemplate step","risk":"read"}
```

### `trycatch`

- family: workflow
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"trycatch","summary":"the reviewed trycatch step","risk":"interaction"}
```

### `urllistrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"urllistrule","summary":"the reviewed urllistrule step","risk":"sensitive"}
```

### `urlrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"urlrule","summary":"the reviewed urlrule step","risk":"sensitive"}
```

### `visitrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"visitrule","summary":"the reviewed visitrule step","risk":"sensitive"}
```

### `waitelement`

- family: workflow
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"waitelement","summary":"the reviewed waitelement step","risk":"read"}
```

### `webhookrule`

- family: workflow
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"webhookrule","summary":"the reviewed webhookrule step","risk":"sensitive"}
```

### `whileloop`

- family: workflow
- consent class: interaction
- capability: the scripting grant the review panel requests at runtime on the active tab
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/workflow.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"whileloop","summary":"the reviewed whileloop step","risk":"interaction"}
```

## Protocol kinds

The page protocol surface: every kind that evaluates, exchanges or drags through the reviewed page contract. 5 kinds; the family policy test lives in tests/protocol.test.ts.

### `drag`

- family: protocol
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/protocol.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"drag","summary":"the reviewed drag step","risk":"sensitive","target":"button.reviewed"}
```

### `drop`

- family: protocol
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/protocol.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"drop","summary":"the reviewed drop step","risk":"sensitive","target":"button.reviewed"}
```

### `evaluate`

- family: protocol
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/protocol.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"evaluate","summary":"the reviewed evaluate step","risk":"sensitive"}
```

### `readjson`

- family: protocol
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/protocol.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"readjson","summary":"the reviewed readjson step","risk":"read"}
```

### `upload`

- family: protocol
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: required — the reviewed css selector the step addresses
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/protocol.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"upload","summary":"the reviewed upload step","risk":"sensitive","target":"button.reviewed"}
```

## Coordination kinds

The multi agent surface: every kind that messages, waits on or watches the shared agent tasks. 3 kinds; the family policy test lives in tests/coordination.test.ts.

### `sendmessage`

- family: coordination
- consent class: sensitive
- capability: the consent window beside the scripting grant — the kind belongs to the sensitive class and never runs without the explicit user approval
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/coordination.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"sendmessage","summary":"the reviewed sendmessage step","risk":"sensitive"}
```

### `waitmessage`

- family: coordination
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/coordination.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"waitmessage","summary":"the reviewed waitmessage step","risk":"read"}
```

### `watchtasks`

- family: coordination
- consent class: read
- capability: the activeTab grant of the reviewed session with the scripting grant the review panel requests at runtime
- target: optional — the kind reads the page or the session without a selector
- options grammar: the reviewed json options of the kind — parseoptions validates the payload, the plan schema freezes the carrier, and the review surface approves every key before execution
- policy test: tests/coordination.test.ts
- schema anchor: schemas/plan.schema.json step fields (id, kind, target, value, options, summary, risk, idempotencykey, environment, agentid, intenthint)

```json
{"id":"step1","kind":"watchtasks","summary":"the reviewed watchtasks step","risk":"read"}
```

The kind count of this document is 335 — exactly the action kind catalog the policy module serves; the doccheck gate refuses any drift between the two.
