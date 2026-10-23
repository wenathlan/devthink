// shellchrome-rewires.mjs — applies the zombie's osText rewires onto the
// wave 4 ShellChrome (the navbar version), completing the wave 5 port.
import { readFileSync, writeFileSync } from "node:fs";
const p = "/tmp/w5wt/devthink/Sol/componentes/shell/ShellChrome.tsx";
let s = readFileSync(p, "utf8");
const rep = [
  ['aria-label="Quick settings"', 'aria-label={osText("shell.tray.quick.aria")}'],
  ['{paired ? userId || "paired" : "local only"}', '{paired ? userId || osText("shell.tray.paired") : osText("shell.tray.localOnly")}'],
  ['aria-label="Calendar"', 'aria-label={osText("shell.tray.calendar.aria")}'],
  ['aria-label="Close the start menu"', 'aria-label={osText("shell.start.close.aria")}'],
  ['aria-label="Start menu"', 'aria-label={osText("shell.start.dialog.aria")}'],
  ['placeholder="Search apps"', 'placeholder={osText("shell.start.search.placeholder")}'],
  ['aria-label="Search apps"', 'aria-label={osText("shell.start.search.aria")}'],
  ['aria-label="Clear the search"', 'aria-label={osText("shell.start.clear.aria")}'],
  ['{query ? "results" : "pinned"}', '{query ? osText("shell.start.label.results") : osText("shell.start.label.pinned")}'],
  ["No app matches \u201c{query}\u201d.", '{osText("shell.start.empty").replace("{query}", query)}'],
  ['>recommended</p>', '>{osText("shell.start.label.recommended")}</p>'],
  [">devthink<", '>{osText("shell.start.wordmark")}<'],
  ['<span>local OS</span>', '<span>{osText("shell.start.localos")}</span>'],
];
let misses = 0;
for (const [a, b] of rep) {
  if (!s.includes(a)) {
    console.log("MISS:", a.slice(0, 70));
    misses += 1;
  }
  s = s.split(a).join(b);
}
writeFileSync(p, s);
console.log("rewires done, misses:", misses);
