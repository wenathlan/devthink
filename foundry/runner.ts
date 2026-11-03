// runner — correlated logic of execution (the Saddle engine runs the
// binary and returns the result).
//
// wave 3, the engine ownership law: the runner-mode ladder (the five
// runtime targets a run asks for) answers from the saddle owner through
// the published library specifier ("@wenathlan/saddle/modes") — the list
// is never duplicated inside the app. this module stays the app-local
// seam: it keeps the app's name (modes) bound to the one ladder the
// engine owns.
export { runnermodes as modes } from "@wenathlan/saddle/modes";
