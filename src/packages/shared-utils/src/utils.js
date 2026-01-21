// Utility functions
export function formatCurrency(amount, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
    }).format(amount);
}
export function formatDate(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}
export function generateId(prefix = "") {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix
        ? `${prefix}_${timestamp}${randomStr}`
        : `${timestamp}${randomStr}`;
}
export function debounce(func, wait) {
    let timeout = null;
    return function (...args) {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
export function isEmpty(obj) {
    if (obj == null)
        return true;
    if (Array.isArray(obj) || typeof obj === "string")
        return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set)
        return obj.size === 0;
    return Object.keys(obj).length === 0;
}
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
