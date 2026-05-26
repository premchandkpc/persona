/**
 * Formatter Service — Data formatting utilities
 * Stateless utilities for text, date, number formatting
 */

export const formatter = {
  date: (date, format = "short") => {
    const d = new Date(date);
    if (format === "short") return d.toLocaleDateString();
    if (format === "long") return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (format === "time") return d.toLocaleTimeString();
    return d.toISOString();
  },

  number: (num, decimals = 0) => {
    return Number(num).toFixed(decimals);
  },

  currency: (num, currency = "USD") => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num);
  },

  bytes: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },

  truncate: (str, length = 50) => {
    return str.length > length ? str.substring(0, length) + "..." : str;
  },

  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  kebab: (str) => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  },

  slug: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  },
};
