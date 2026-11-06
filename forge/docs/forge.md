# forge — the dossier

The pure execution clone: the binary runner that executes programs in the saddle sandbox.

## Identity

- Category: execution surface.
- Competitor space: the e2b execution model (the engine lives in saddle, forge is the surface).

## Objective

Run any binary the person brings — through the queuebinarylaunch lane, the eleven architectures and the sandbox seats — without ever touching the visitor machine.

## Features

- Binary execution in the saddle sandbox: the runner seats (exe, binary, sh, yml) imported from saddle as the engine library.
- Queue binary launch: the queue orchestration for every execution request.
- Architecture coverage: the eleven-architecture standard answers every execution lane.
- Program outputs and artifacts delivered through the vault storage library.

## Interactions

- The execution surface: submit a binary, watch the queue, receive the output.
- CLI console with the family chat design.

## Doctrine

- Execution-only surface: the engine is saddle, the storage is vault — forge owns the surface alone.
