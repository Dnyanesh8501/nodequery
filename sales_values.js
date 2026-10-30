import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

// Load SAP credentials from the .env next to this script (works on Node 18, no dotenv needed)
const loadEnv = () => {
    const envPath = new URL(".env", import.meta.url);
    if (!fs.existsSync(envPath)) {
        console.warn(".env file not found, using existing environment variables");
        return;
    }
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
        if (!match || line.trim().startsWith("#")) continue;
        const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
        if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
};
loadEnv();

const BASE_URL = process.env.SAP_BASE_URL;
const API_USER = process.env.SAP_USERNAME;
const API_PASS = process.env.SAP_PASSWORD;

const OUTPUT_DIR = "/home/snopadm";

// Same fixed rates used in the part_pricing upsert; anything else (e.g. INR) is 1
const EXCHANGE_RATES = { USD: 70, EUR: 80, GBP: 90 };

const getSAPData = async (endpoint) => {
    if (!BASE_URL || !API_USER || !API_PASS) {
        throw new Error("SAP_BASE_URL / SAP_USERNAME / SAP_PASSWORD missing in .env");
    }
    const encoded = Buffer.from(`${API_USER}:${API_PASS}`).toString("base64");
    const url = `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
    const res = await fetch(url, {
        headers: { Authorization: `Basic ${encoded}` },
    });
    if (!res.ok) throw new Error(`Kalyanicorp API error: ${res.status} on ${endpoint}`);
    return res.json();
};

// e.g. 30_10_2026
const formatDate = (d = new Date()) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}_${mm}_${d.getFullYear()}`;
};

export const exportSalesValueExcel = async () => {
    const rawRows = await getSAPData("/salesPrice");
    const rows = Array.isArray(rawRows) ? rawRows : [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Value");
    sheet.columns = [
        { header: "PCode", key: "pcode", width: 20 },
        { header: "Customer_Code", key: "customer_code", width: 20 },
        { header: "Sales_Value", key: "sales_value", width: 18 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const { PCode, CustomerCode, Price, Currency } of rows) {
        const price = Number(Price);
        const rate = EXCHANGE_RATES[String(Currency ?? "").trim().toUpperCase()] ?? 1;

        sheet.addRow({
            pcode: PCode != null ? String(PCode).trim() : "",
            customer_code: CustomerCode != null ? String(CustomerCode).trim() : "",
            sales_value: Number.isFinite(price) ? price * rate : null,
        });
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const filePath = path.join(OUTPUT_DIR, `sales_value_${formatDate()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    console.log(`Exported ${rows.length} rows to ${filePath}`);
    return filePath;
};

exportSalesValueExcel().catch((error) => {
    console.error("exportSalesValueExcel error :", error);
    process.exit(1);
});
