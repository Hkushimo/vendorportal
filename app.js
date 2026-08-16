const vendors = [
  {
    name: "Hakeem Kushimo",
    alias: "Keem",
    email: "hkushimo@gmail.com",
    tables: "265, 266",
    wifiCodes: "14578-78545, 69545-54128"
  }
];

const form = document.querySelector("#lookup-form");
const emailInput = document.querySelector("#email");
const message = document.querySelector("#message");
const vendorCard = document.querySelector("#vendor-card");
const vendorName = document.querySelector("#vendor-name");
const vendorAlias = document.querySelector("#vendor-alias");
const vendorEmail = document.querySelector("#vendor-email");
const tables = document.querySelector("#tables");
const wifiCodes = document.querySelector("#wifi-codes");

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function setMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type === "success" ? "success" : ""}`;
}

function renderList(container, items, className) {
  container.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("span");
    empty.className = className;
    empty.textContent = "Not listed";
    container.append(empty);
    return;
  }

  for (const item of items) {
    const element = document.createElement("span");
    element.className = className;
    element.textContent = item;
    container.append(element);
  }
}

function showVendor(vendor) {
  vendorName.textContent = vendor.name;
  vendorAlias.textContent = vendor.alias ? `Alias: ${vendor.alias}` : "";
  vendorEmail.textContent = vendor.email;
  vendorEmail.href = `mailto:${vendor.email}`;

  renderList(tables, splitList(vendor.tables), "chip");
  renderList(wifiCodes, splitList(vendor.wifiCodes), "code");

  vendorCard.hidden = false;
  setMessage("Vendor found.", "success");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const requestedEmail = normalizeEmail(emailInput.value);
  const vendor = vendors.find((item) => normalizeEmail(item.email) === requestedEmail);

  if (!vendor) {
    vendorCard.hidden = true;
    setMessage("No vendor info found for that email. Check the spelling and try again.");
    return;
  }

  showVendor(vendor);
});
