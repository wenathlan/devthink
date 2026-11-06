# foundry — the dossier

The pipeline clone: the complete execution and storage pipeline that rides saddle as the engine and vault as the library.

## Identity

- Category: pipeline surface.
- Competitor space: e2b interface, docker clone pipelines.

## Objective

Give every pipeline stage a real sandbox to execute in and a real vault to store artifacts in — the full pipeline answered honestly.

## Features

- Pipeline stages that execute in the saddle sandbox.
- Artifacts stored through the vault library (chunks, content-addressed seats).
- YML chunks: the pipeline definition surface.
- tar.xz seats and MIME type handling for every artifact lane.
- Admin control surface for the pipeline runs.
- The e2b-style interface: sandboxes and images with the engine living in saddle.

## Interactions

- Define a pipeline, watch the stages execute, collect the artifacts.
- CLI console with the family chat design.

## Doctrine

- Foundry owns the pipeline surface alone; the engine is saddle, the storage is vault.
