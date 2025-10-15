const applyBtn = document.getElementById("applyBtn");
const colorPicker = document.getElementById("colorPicker");
const toggleActive = document.getElementById("toggleActive");
const radios = document.querySelectorAll('input[name="mode"]');

radios.forEach(radio => {
  radio.addEventListener("change", () => {
    colorPicker.style.display = radio.value === "custom" ? "block" : "none";
  });
});

// Recuperar preferencias
chrome.storage.sync.get(["mode", "customColor", "active"], ({ mode, customColor, active }) => {
  if (mode) document.querySelector(`input[value="${mode}"]`).checked = true;
  if (customColor) colorPicker.value = customColor;
  if (active !== undefined) toggleActive.checked = active;
});

applyBtn.addEventListener("click", () => {
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  const selectedColor = colorPicker.value;
  const isActive = toggleActive.checked;

  chrome.storage.sync.set({
    mode: selectedMode,
    customColor: selectedColor,
    active: isActive
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: applyDarkMode,
      args: [selectedMode, selectedColor, isActive]
    });
  });
});

// Función que modifica colores de la página
function applyDarkMode(mode, color, active) {
  const invertImages = (img) => {
    img.style.filter = active ? "invert(1) hue-rotate(180deg)" : "";
  }

  if (!active) {
    document.querySelectorAll("*").forEach(el => {
      el.style.backgroundColor = "";
      el.style.color = "";
      if (el.tagName === "IMG") invertImages(el);
    });
    return;
  }

  const bgColor = mode === "amoled" ? "#000000" : mode === "dark" ? "#121212" : color;
  const textColor = mode === "amoled" ? "#FFFFFF" : mode === "dark" ? "#E0E0E0" : "#FFFFFF";

  document.querySelectorAll("*").forEach(el => {
    const computedStyle = getComputedStyle(el);
    // Solo cambiar elementos con fondo visible
    if (computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)" && computedStyle.backgroundColor !== "transparent") {
      el.style.backgroundColor = bgColor;
    }
    el.style.color = textColor;
    if (el.tagName === "IMG") invertImages(el);
  });
}
