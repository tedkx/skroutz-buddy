const productListFunc = () => {
  const BASE_URL = "https://www.skroutz.gr/";
  const PRICE_GRAPH_URL_SUFFIX =
    "/price_graph.json?shipping_country=GR&currency=EUR";

  const formatPrice = (price) => (price ? price + "€" : "N/A");

  let storageData = {};
  try {
    storageData = JSON.parse(localStorage.getItem("products") || {});
  } catch (error) {}
  const uniqueProducts = Array.from(
    document.querySelectorAll("li.cf.card")
  ).reduce((acc, product) => {
    const skuid = product.getAttribute("data-skuid");
    if (acc[skuid]) return acc;
    const productLink = product
      .querySelector("a")
      .getAttribute("href")
      .split(".html")[0];
    acc[skuid] = { skuid, productLink };
    return acc;
  });

  const promises = Object.values(uniqueProducts).map(
    ({ skuid, productLink }) => {
      const promise = storageData[skuid]
        ? Promise.resolve()
        : fetch(`${BASE_URL}${productLink}${PRICE_GRAPH_URL_SUFFIX}`)
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
            });
      return promise
        .catch((err) => (storageData[skuid] = err.message))
        .then(() => {
          document
            .querySelectorAll(`.card[data-skuid='${skuid}'] .price a`)
            .forEach((priceNode) => {
              priceNode.innerHTML += ` <span style="font-size: 14px; font-weight: bold">( 
                <em style="color: #555;">${formatPrice(
                  storageData[skuid].low3.value
                )} 3μο</em> | <em style="color: #999;">${formatPrice(
                storageData[skuid].low6.value
              )} 6μο </em> )</span>`;
            });
        });
    }
  );

  Promise.all(promises).then(() =>
    localStorage.setItem("products", JSON.stringify(storageData))
  );
};

export default (tabId) => {
  chrome.scripting.executeScript({
    target: { tabId },
    func: productListFunc,
  });
};
