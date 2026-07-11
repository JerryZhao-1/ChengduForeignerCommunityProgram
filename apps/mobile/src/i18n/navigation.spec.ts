import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTE_TITLE_KEYS, TAB_ITEMS, routeTitle, updateRuntimeNavigation } from "./navigation";

afterEach(() => vi.unstubAllGlobals());

describe("runtime navigation localization", () => {
  it("accounts for every route in pages.json", () => {
    const pagesJson = JSON.parse(
      readFileSync(new URL("../pages.json", import.meta.url), "utf8")
    ) as { pages: Array<{ path: string }> };
    expect(Object.keys(ROUTE_TITLE_KEYS).sort()).toEqual(
      pagesJson.pages.map((page) => page.path).sort()
    );
    expect(TAB_ITEMS).toHaveLength(5);
  });

  it("updates the current title and all five tabs on a tab route", () => {
    const setNavigationBarTitle = vi.fn();
    const setTabBarItem = vi.fn();
    vi.stubGlobal("uni", { setNavigationBarTitle, setTabBarItem });

    updateRuntimeNavigation("en", "pages/events/index");

    expect(setNavigationBarTitle).toHaveBeenCalledWith({
      title: "Events"
    });
    expect(setTabBarItem.mock.calls.map(([input]) => input.text)).toEqual([
      "Home",
      "Events",
      "Discover",
      "Places",
      "Me"
    ]);
  });

  it("does not call tab APIs from a non-tab route", () => {
    const setNavigationBarTitle = vi.fn();
    const setTabBarItem = vi.fn();
    vi.stubGlobal("uni", { setNavigationBarTitle, setTabBarItem });

    updateRuntimeNavigation("en", "pages/events/detail");

    expect(setNavigationBarTitle).toHaveBeenCalledWith({
      title: "Event Details"
    });
    expect(setTabBarItem).not.toHaveBeenCalled();
  });

  it("updates the H5 document title immediately", () => {
    const documentStub = { title: "活动详情" };
    vi.stubGlobal("document", documentStub);
    vi.stubGlobal("uni", {
      setNavigationBarTitle: vi.fn(),
      setTabBarItem: vi.fn()
    });

    updateRuntimeNavigation("en", "pages/events/detail");

    expect(documentStub.title).toBe("Event Details");
  });

  it("absorbs rejected asynchronous navigation APIs", async () => {
    const setNavigationBarTitle = vi.fn(() => Promise.reject({ errMsg: "no page" }));
    const setTabBarItem = vi.fn(() => Promise.reject({ errMsg: "not ready" }));
    vi.stubGlobal("uni", { setNavigationBarTitle, setTabBarItem });

    expect(() =>
      updateRuntimeNavigation("en", "pages/events/index")
    ).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();

    expect(setNavigationBarTitle).toHaveBeenCalledTimes(1);
    expect(setTabBarItem).toHaveBeenCalledTimes(5);
  });

  it("returns locale-correct titles for custom and native navigation pages", () => {
    expect(routeTitle("pages/discover/detail", "zh")).toBe("帖子详情");
    expect(routeTitle("pages/discover/detail", "en")).toBe("Post Details");
    expect(routeTitle("pages/more/language-settings", "en")).toBe(
      "Language"
    );
  });
});
