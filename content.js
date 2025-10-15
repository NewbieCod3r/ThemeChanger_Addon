chrome.storage.sync.get(["mode", "customColor", "active"], ({ mode, customColor, active }) => {
    if (!mode) return;
    chrome.scripting.executeScript({
      target: { tabId: window.tabId || 0 }, // Chrome ejecuta en la pestaña activa
      func: applyDarkMode,
      args: [mode, customColor, active]
    });
  });
  