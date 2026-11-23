/**
 * wingets.ts — the universal winget surface of pulse (root layer): every
 * winget of the sol/wingets folder answers from this one module at the app
 * root, so the theme imports its components from a single place and the
 * dotted winget file name lives exactly once (here) instead of repeating
 * across every page — the components stay complete independent files inside
 * the sol/wingets folder this root surface answers. while the studio is in
 * construction the folder carries exactly two wingets: the
 * under-construction face and the drawn voice waveform it hangs as the
 * hologram (the stealthhead precedent — the one-component surface law).
 */

export * from "./sol/wingets/Constructionface.tsx";
export { default as Constructionface } from "./sol/wingets/Constructionface.tsx";
export * from "./sol/wingets/Voicewave.tsx";
export { default as Voicewave } from "./sol/wingets/Voicewave.tsx";
