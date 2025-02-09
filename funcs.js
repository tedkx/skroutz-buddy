const productListFunc = () => {
  const BASE_URL = "https://www.skroutz.gr/";
  const PRICE_GRAPH_URL_SUFFIX =
    "/price_graph.json?shipping_country=GR&currency=EUR";

  const createPriceGraphUrl = (productLink) =>
    `${BASE_URL}${productLink}${PRICE_GRAPH_URL_SUFFIX}`;

  const products = document.querySelectorAll("li.cf.card");
  const skuid = products[0].getAttribute("data-skuid");
  const productLink = createPriceGraphUrl(
    products[0].querySelector("a").getAttribute("href").split(".html")[0]
  );
  const storageData = {
    products,
    firstProduct: {
      skuid,
      productLink,
    },
  };
  fetch(productLink)
    .then((resp) => resp.json())
    .then((data) => (storageData.firstProduct.data = data))
    .catch((err) => (storageData.firstProduct.error = err))
    .then(() => localStorage.setItem("products", JSON.stringify(storageData)));
};

const productFunc = () => {};

export { productListFunc, productFunc };
