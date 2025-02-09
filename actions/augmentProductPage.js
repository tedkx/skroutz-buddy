const productFunc = () => {
  const BASE_URL = "https://www.skroutz.gr/";
  const PRICE_GRAPH_URL_SUFFIX =
    "/price_graph.json?shipping_country=GR&currency=EUR";

  const createPriceGraphUrl = (productLink) =>
    `${BASE_URL}${productLink}${PRICE_GRAPH_URL_SUFFIX}`;
};

export default (tabId) => {
  console.log("Product page.");
  chrome.scripting.executeScript({
    target: { tabId },
    func: productFunc,
  });
};
