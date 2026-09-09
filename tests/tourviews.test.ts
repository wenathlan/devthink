import { describe, expect, it } from "vitest";
import {
  a11ylabelof,
  a11ylabelsfor,
  a11ylabelslocalizedfor,
  featuretourordered,
  featuretourstopat,
  featuretourstops,
} from "../views.js";
import { localebundles, localestring } from "../views.js";

describe("featuretour and a11ylabels", () => {
  it("replays the onboarding walkthrough with added stops for the datagrid, the compareviewer and the pickeroverlay", () => {
    const stops = featuretourordered(featuretourstops());
    expect(stops.map((stop) => stop.id)).toEqual([
      "origingrants",
      "planreview",
      "runcontrol",
      "logaudit",
      "datagrid",
      "compareviewer",
      "pickeroverlay",
      "chunkextract",
    ]);
    const surfaces = ["popup", "sidepanel", "dashboardpage", "optionspage", "onboarding"];
    expect(stops.every((stop) => stop.focus !== "" && surfaces.includes(stop.surface) && stop.body !== "")).toBe(true);
    expect(featuretourstopat(stops, 4)?.id).toBe("datagrid");
    expect(featuretourstopat(stops, stops.length)).toBeUndefined();
  });

  it("names every control across the surfaces with role, state and value", () => {
    const popup = a11ylabelsfor("popup");
    expect(popup.find((label) => label.control === "taskinput")?.role).toBe("textbox");
    expect(popup.find((label) => label.control === "recenttray")?.value).toBe("0 runs");
    const sidepanel = a11ylabelsfor("sidepanel");
    expect(sidepanel.find((label) => label.control === "compareviewer")?.role).toBe("slider");
    expect(a11ylabelsfor("dashboardpage").find((label) => label.control === "historysearch")?.role).toBe("search");
    expect(a11ylabelsfor("optionspage").find((label) => label.control === "notifications")?.state).toBe("off");
    expect(a11ylabelsfor("page").find((label) => label.control === "pagechip")?.role).toBe("group");
    expect(() => a11ylabelof({ control: " ", role: "button", name: "x" })).toThrow(/control/);
    expect(() => a11ylabelof({ control: "x", role: "button", name: " " })).toThrow(/accessible name/);
  });

  it("localizes the a11ylabels through the locale bundles so they follow the interface language", () => {
    const bundles = localebundles();
    const labels = a11ylabelslocalizedfor("popup", bundles, "pt");
    expect(labels.find((label) => label.control === "recenttray")?.name).toBe("Execuções recentes");
    const english = a11ylabelslocalizedfor("popup", bundles, "en");
    expect(english.find((label) => label.control === "recenttray")?.name).toBe("Recent runs");
    expect(localestring(bundles, "pt", "popup.taskinput.placeholder")).toMatch(/aba ativa/);
  });
});
