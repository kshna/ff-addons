let tabHistory = [];

function updateTabHistory(tabId) {
  tabHistory = tabHistory.filter(id => id !== tabId);
  tabHistory.push(tabId);
  if (tabHistory.length > 10) tabHistory.shift();
  browser.storage.local.set({ tabHistory }).then(updateContextMenu);
}

browser.tabs.onActivated.addListener(({ tabId }) => {
  updateTabHistory(tabId);
});

async function updateContextMenu() {
  await browser.menus.removeAll();

  await browser.menus.create({
    id: "tabHistoryRoot",
    title: "Tab History",
    contexts: ["all"]
  });

  for (const tabId of [...tabHistory].reverse()) {
    try {
      const tab = await browser.tabs.get(tabId);
      await browser.menus.create({
        id: `tab_${tab.id}`,
        parentId: "tabHistoryRoot",
        title: tab.title.length > 40 ? tab.title.slice(0, 37) + "..." : tab.title,
        contexts: ["all"]
      });
    } catch (e) {
      // Tab may be closed, ignore
    }
  }
}

browser.runtime.onInstalled.addListener(async () => {
  const data = await browser.storage.local.get("tabHistory");
  if (data.tabHistory) tabHistory = data.tabHistory;
  updateContextMenu();
});

browser.menus.onClicked.addListener(async (info) => {
  if (info.menuItemId && info.menuItemId.startsWith("tab_")) {
    const tabId = parseInt(info.menuItemId.replace("tab_", ""), 10);
    try {
      await browser.tabs.update(tabId, { active: true });
    } catch (e) {
      // Tab may no longer exist
    }
  }
});

