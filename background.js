const productListFunc = () => {
  const BASE_URL = "https://www.skroutz.gr/";
  const PRICE_GRAPH_URL_SUFFIX =
    "/price_graph.json?shipping_country=GR&currency=EUR";

  let storageData = {};
  try {
    storageData = JSON.parse(localStorage.getItem("products") || {});
  } catch (error) {}
  const promises = Array.from(document.querySelectorAll("li.cf.card")).map(
    (product) => {
      const skuid = product.getAttribute("data-skuid");
      const productLink = product
        .querySelector("a")
        .getAttribute("href")
        .split(".html")[0];
      return fetch(`${BASE_URL}${productLink}${PRICE_GRAPH_URL_SUFFIX}`)
        .then((resp) => resp.json())
        .then((data) => {
          let low3 = { value: Infinity },
            low6 = { value: Infinity };
          let data3 = data.min_price.graphData["3_months"];
          let data6 = data.min_price.graphData["6_months"];
          if (data3.has_values) {
            for (let i = 0; i < data3.values.length; i++)
              if (
                data3.values[i].value < low3.value &&
                data3.values[i].value > 0
              )
                low3 = data3.values[i];

            if (low3.value === null) low3 = null;
          } else {
            data3 = null;
          }

          if (data6.has_values) {
            for (let i = 0; i < data6.values.length; i++)
              if (
                data6.values[i].value < low6.value &&
                data6.values[i].value > 0
              )
                low6 = data6.values[i];

            if (low6.value === null) low6 = null;
          } else {
            data6 = null;
          }

          storageData[skuid] = {
            url: productLink + ".html",
            low3,
            low6,
            min: data.min_price.min,
            max: data.min_price.max,
          };
        })
        .catch((err) => (storageData[skuid] = err.message))
        .then(() => {});
    }
  );

  Promise.all(promises).then(() =>
    localStorage.setItem("products", JSON.stringify(storageData))
  );
};

const productFunc = () => {
  const BASE_URL = "https://www.skroutz.gr/";
  const PRICE_GRAPH_URL_SUFFIX =
    "/price_graph.json?shipping_country=GR&currency=EUR";

  const createPriceGraphUrl = (productLink) =>
    `${BASE_URL}${productLink}${PRICE_GRAPH_URL_SUFFIX}`;
};

// Listener for messages from other parts of the extension (popup, content script, etc.)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);

  if (message.type === "GREETINGS") {
    sendResponse({ reply: "Hello from background.js!" });
  }

  // Make sure to return true if you want to send an asynchronous response
  return true;
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log("Tab switched to:", tab.url);

    // Inject or execute a script on the newly activated tab
    // chrome.scripting.executeScript({
    //   target: { tabId: tab.id },
    //   func: () => {
    //     console.log("This script runs whenever the user switches tabs!");
    //     // Add any custom logic here
    //   },
    // });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    console.log("Tab updated:", tab.url, tab);

    if (
      tab.url.includes("skroutz.gr/search") ||
      tab.url.includes("skroutz.gr/c/")
    ) {
      console.log("search, augment products");
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: productListFunc,
      });
    } else if (tab.url.includes("skroutz.gr/s/")) {
      console.log("Product page.");
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: productFunc,
      });
    }
  }
});
