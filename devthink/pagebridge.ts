/**
 * pagebridge — the extension page surface entry of the page family.
 *
 * The keyed page.ts seat carries every page function as pure exports; this
 * entry alone owns the registration side effect the extension contract
 * declares — the reviewed devthinkbridge object on the page global the
 * background executor calls. Keeping the registration in the entry keeps
 * the keyed seat side-effect free, so every consumer that imports one
 * helper (a mask, a converter) tree-shakes the seat down to that helper
 * and the evaluate executors never ride a surface that does not evaluate.
 */

import {
  canvasdata,
  capturesnapshot,
  clearcookies,
  elementrect,
  flushconsole,
  maskobservationstate,
  maskobservationsnapshot,
  maskstepvalues,
  measurepage,
  mediaelements,
  pageassets,
  pageimages,
  parsehtmlmarkup,
  pdfbreaks,
  pdfsegment,
  performstep,
  preparecapture,
  previewtarget,
  queryelements,
  readcookies,
  readdialogs,
  resourcerecords,
  restorecapture,
  revertemulationlayer,
  scrollcapture,
  scrollcontainercapture,
  streamelements,
  videoframe,
  videostate,
  waitsettle,
  writecookies,
} from "./page.js";

Object.assign(globalThis, {
  devthinkbridge: {
    maskstepvalues,
    maskobservationstate,
    maskobservationsnapshot,
    capturesnapshot,
    previewtarget,
    performstep,
    readdialogs,
    measurepage,
    elementrect,
    queryelements,
    preparecapture,
    scrollcapture,
    restorecapture,
    scrollcontainercapture,
    waitsettle,
    pdfsegment,
    pdfbreaks,
    videoframe,
    videostate,
    canvasdata,
    streamelements,
    mediaelements,
    pageassets,
    pageimages,
    parsehtmlmarkup,
    resourcerecords,
    writecookies,
    readcookies,
    clearcookies,
    revertemulationlayer,
    flushconsole,
  },
});
