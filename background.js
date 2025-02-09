import augmentProductList from "./actions/augmentProductList.js";
import augmentProductPage from "./actions/augmentProductPage.js";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    console.log("Tab updated:", tab.url, tab);

    if (
      tab.url.includes("skroutz.gr/search") ||
      tab.url.includes("skroutz.gr/c/")
    ) {
      augmentProductList(tabId);
    } else if (tab.url.includes("skroutz.gr/s/")) {
      augmentProductPage(tabId);
    }
  }
});
