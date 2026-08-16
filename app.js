const sheetJsonUrl = "https://docs.google.com/spreadsheets/d/1Wl5Ta7PvSiAaX8VZ9N5Fu2IPd2RBCS3yrOCGYUegzE8/gviz/tq?tqx=out:json&gid=0";
const fallbackVendors = [
  {
    name: "Hakeem Kushimo",
    alias: "Keem",
    email: "hkushimo@gmail.com",
    tables: "265, 266",
    wifiCodes: "14578-78545, 69545-54128"
  }
];

let vendors = [...fallbackVendors];
let vendorsLoaded = false;
let vendorLoadPromise;

const form = document.querySelector("#lookup-form");
const emailInput = document.querySelector("#email");
const message = document.querySelector("#message");
const vendorCard = document.querySelector("#vendor-card");
const vendorName = document.querySelector("#vendor-name");
const vendorAlias = document.querySelector("#vendor-alias");
const tables = document.querySelector("#tables");
const wifiCodes = document.querySelector("#wifi-codes");

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function cellValue(row, index) {
  const cell = row.c?.[index];
  return String(cell?.f ?? cell?.v ?? "");
}

function rowsFromGoogleTable(table) {
  return (table?.rows || [])
    .map((row) => (row.c || []).map((_, index) => cellValue(row, index)))
    .filter((row) => row.some((cell) => cell.trim()));
}

function vendorsFromRows(rows) {
  const [headers, ...dataRows] = rows;
  const headerMap = new Map(headers.map((header, index) => [normalizeHeader(header), index]));

  return dataRows
    .map((row) => ({
      name: row[headerMap.get("name")] || "",
      alias: row[headerMap.get("alias")] || "",
      email: row[headerMap.get("email")] || "",
      tables: row[headerMap.get("tables")] || "",
      wifiCodes: row[headerMap.get("wifiaccesscodes")] || ""
    }))
    .filter((vendor) => vendor.email.trim());
}

function loadSheetRows() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const previousGoogle = window.google;
    const previousSetResponse = window.google?.visualization?.Query?.setResponse;

    window.google = window.google || {};
    window.google.visualization = window.google.visualization || {};
    window.google.visualization.Query = window.google.visualization.Query || {};

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      script.remove();

      if (previousSetResponse) {
        window.google.visualization.Query.setResponse = previousSetResponse;
      } else if (previousGoogle) {
        delete window.google.visualization.Query.setResponse;
      } else {
        delete window.google;
      }
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Sheet request timed out"));
    }, 10000);

    window.google.visualization.Query.setResponse = (response) => {
      cleanup();

      if (response?.status !== "ok") {
        reject(new Error(response?.errors?.[0]?.detailed_message || "Sheet request failed"));
        return;
      }

      resolve(rowsFromGoogleTable(response.table));
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Sheet request failed"));
    };
    script.src = `${sheetJsonUrl}&cacheBust=${Date.now()}`;
    document.head.append(script);
  });
}

async function loadVendors() {
  if (vendorsLoaded) {
    return vendors;
  }

  if (!vendorLoadPromise) {
    vendorLoadPromise = loadSheetRows()
      .then((rows) => {
        const loadedVendors = vendorsFromRows(rows);
        if (loadedVendors.length) {
          vendors = loadedVendors;
        }
        vendorsLoaded = true;
        return vendors;
      })
      .catch((error) => {
        vendorsLoaded = true;
        console.error(error);
        return vendors;
      });
  }

  return vendorLoadPromise;
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

  renderList(tables, splitList(vendor.tables), "chip");
  renderList(wifiCodes, splitList(vendor.wifiCodes), "code");

  vendorCard.hidden = false;
  setMessage("Vendor found.", "success");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  setMessage("Checking the vendor list...", "success");
  vendorCard.hidden = true;

  const loadedVendors = await loadVendors();
  const requestedEmail = normalizeEmail(emailInput.value);
  const vendor = loadedVendors.find((item) => normalizeEmail(item.email) === requestedEmail);

  if (!vendor) {
    vendorCard.hidden = true;
    setMessage("No vendor info found for that email. Check the spelling and try again. If you just edited the sheet, refresh this page.");
    return;
  }

  showVendor(vendor);
});

loadVendors();
