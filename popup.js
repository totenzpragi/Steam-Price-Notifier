const renderItemsList = () => {
  chrome.storage.sync.get(["itemsToMonitor"], (result) => {
    const itemsToMonitor = result.itemsToMonitor || [];
    const itemsList = document.getElementById("itemsList");
    itemsList.innerHTML = "";

    itemsToMonitor.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Item: ${item.itemUrl}, Target price: ${item.targetPrice}`;
      
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        itemsToMonitor.splice(index, 1);
        chrome.storage.sync.set({ itemsToMonitor }, renderItemsList);
      });

      listItem.appendChild(removeButton);
      itemsList.appendChild(listItem);
    });
  });
};

document.getElementById("addBtn").addEventListener("click", () => {
  const itemUrl = document.getElementById("itemUrl").value;
  const targetPrice = parseFloat(document.getElementById("targetPrice").value);

  if (itemUrl && targetPrice) {
    chrome.storage.sync.get(["itemsToMonitor"], (result) => {
      const itemsToMonitor = result.itemsToMonitor || [];
      itemsToMonitor.push({ itemUrl, targetPrice });
      chrome.storage.sync.set({ itemsToMonitor }, () => {
        alert("Item added to monitor!");
        document.getElementById("itemUrl").value = "";
        document.getElementById("targetPrice").value = "";
        renderItemsList();
      });
    });
  } else {
    alert("Fill in both fields: item link and target price.");
  }
});

renderItemsList();
