const checkPrices = async () => {
  const fetchPrice = async (itemUrl) => {
    try {
      const response = await fetch(itemUrl);
      const text = await response.text();
      const domParser = new DOMParser();
      const document = domParser.parseFromString(text, "text/html");
      const priceElement = document.querySelector(".market_listing_price_with_fee");

      if (!priceElement) {
        throw new Error("Cannot find the price element");
      }

      const priceText = priceElement.textContent.trim();
      const price = parseFloat(priceText.replace(/[^0-9.,]+/g, "").replace(".", "").replace(",", "."));

      if (isNaN(price)) {
        throw new Error("Cannot convert price to a number");
      }

      return price;
    } catch (error) {
      console.error(`Error fetching item price from the link: ${itemUrl}`, error);
      return null;
    }
  };

  chrome.storage.sync.get(["itemsToMonitor"], async (result) => {
    const itemsToMonitor = result.itemsToMonitor || [];

    for (const item of itemsToMonitor) {
      const currentPrice = await fetchPrice(item.itemUrl);

      if (currentPrice !== null && currentPrice <= item.targetPrice) {
        chrome.notifications.create(item.itemUrl, {
          type: "basic",
          iconUrl: "icon.png",
          title: "Price dropped!",
          message: `The item's price has dropped below the set value: ${item.itemUrl}`,
        });
      }
    }
  });
};

chrome.alarms.create("priceCheck", { periodInMinutes: 10 / 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "priceCheck") {
    checkPrices();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({ url: notificationId });
  chrome.notifications.clear(notificationId);
});
