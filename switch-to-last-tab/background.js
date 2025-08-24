let lastActiveTabId = null;
let currentActiveTabId = null;

function onActivated(activeInfo) {
  if (currentActiveTabId !== activeInfo.tabId) {
    lastActiveTabId = currentActiveTabId;
    currentActiveTabId = activeInfo.tabId;
  }
}

browser.tabs.onActivated.addListener(onActivated);

// Create context menu item that appears when right-clicking on a page
browser.menus.create({
  id: "switchToLast",
  title: "Switch to Last Tab",
  contexts: ["page"]  // This shows it in page context menu (right-click on page)
});

browser.menus.onClicked.addListener((info) => {
  if (info.menuItemId === "switchToLast" && lastActiveTabId !== null) {
    browser.tabs.update(lastActiveTabId, { active: true }).catch(console.error);
  }
});

