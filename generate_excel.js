const XLSX = require("xlsx");

// 1. Vendor Catalog Template
const catalogHeaders = [
  "Inventory Code",
  "Inventory name",
  "Category",
  "Specifications",
  "Primary UOM"
];
const catalogData = [
  ["ITEM-001", "Example Product A", "Electronics", "High quality, 100W", "Pc"],
  ["ITEM-002", "Example Product B", "Furniture", "Wooden, 200cm", "Unit"]
];
const catalogWs = XLSX.utils.aoa_to_sheet([catalogHeaders, ...catalogData]);
const catalogWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(catalogWb, catalogWs, "Catalog");
XLSX.writeFile(catalogWb, "public/assets/templates/vendor-catalog-template.xlsx");

// 2. Buyer PO Template
const poHeaders = [
  "PO Number",
  "Vendor",
  "Department",
  "Currency",
  "Purchase Category",
  "Purchase Type",
  "Date",
  "Created By",
  "Approved By",
  "Expected receiving date",
  "Inventory Code",
  "Inventory name",
  "Qty",
  "Primary UOM",
  "Unit price in original currency",
  "Amount in original currency",
  "Tax amount in original currency",
  "Original Currency Total Amount"
];
const poData = [
  ["PO-2023-001", "PT Vendor Sukses", "IT", "IDR", "Equipment", "Capex", "2023-10-01", "Admin", "Manager", "2023-10-15", "ITM-01", "Laptop", 2, "Pc", 15000000, 30000000, 3300000, 33300000],
  ["PO-2023-001", "PT Vendor Sukses", "IT", "IDR", "Equipment", "Capex", "2023-10-01", "Admin", "Manager", "2023-10-15", "ITM-02", "Mouse", 2, "Pc", 500000, 1000000, 110000, 1110000]
];
const poWs = XLSX.utils.aoa_to_sheet([poHeaders, ...poData]);
const poWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(poWb, poWs, "Purchase Orders");
XLSX.writeFile(poWb, "public/assets/templates/buyer-purchase-order-template.xlsx");

console.log("Excel templates generated successfully!");
