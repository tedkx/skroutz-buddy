document.getElementById("changeColor").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => (document.body.style.backgroundColor = "lightblue"),
    });
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  console.log("chrome", chrome);
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => {
      // Access the DOM of the currently loaded page
      const pageTitle = document.title;
      console.log("Page title:", pageTitle);
    },
  });
});
