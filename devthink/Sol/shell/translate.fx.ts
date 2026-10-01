/**
 * The reveal effect of the Sol translation: the settled translation walks in
 * through the classic scramble reveal — the characters resolve left to right
 * while the tail keeps scrambling, so a language switch reads as a live
 * terminal paint instead of a hard swap. The correlated logics group per ts
 * file: translate.gtx.ts owns the cache and the transport and translate.dom.ts
 * owns the dom walk that schedules this effect.
 */

/** Paints one node from its current value to the target text through the scramble walk. */
export function scrambleeffect(node: Text | Element, targettext: string, isattr = false, attrname: string | null = null): void {
  const chars = "!<>-_\\/[]{}—=+*^?#___";
  const duration = 800;
  const starttime = performance.now();

  const step = (currenttime: number): void => {
    const progress = Math.min((currenttime - starttime) / duration, 1);
    const revealedchars = Math.floor(progress * targettext.length);
    const scrambled = targettext
      .split("")
      .map((char, index) => {
        if (char === " " || char === "\n") return char;
        if (index < revealedchars) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (isattr && attrname !== null && node instanceof Element) node.setAttribute(attrname, scrambled);
    else if (node instanceof Text) node.nodeValue = scrambled;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (isattr && attrname !== null && node instanceof Element) {
      node.setAttribute(attrname, targettext);
    } else if (node instanceof Text) {
      node.nodeValue = targettext;
    }
  };
  requestAnimationFrame(step);
}
