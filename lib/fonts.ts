
export const fontBase64 = "AAEAAAARAQAABAAQRkZUTWdmH+QAAAEcAAAAHEdERUYALQALAAABLAAAABxGP... (truncated for brevity, you should use a real font base64 or fetch from CDN in client side)";
// IMPORTANT: Due to token limits, I cannot put a 500KB font string here.
// I will instead use a different strategy: I will modify the PDF generator to use a standard font but with encoding fixes, OR rely on client-side font loading.
// Actually, `jspdf` supports standard fonts (Times, Courier, Helvetica). The issue with Turkish characters is usually encoding (Windows-1254 vs UTF-8).
// jsPDF by default does NOT support UTF-8 characters with standard 14 fonts. You MUST add a custom font.
// Since I cannot upload a large file, I will instruct the user or use a small subset font if possible.
//
// BETTER PLAN: Use a CDN link to fetch the font buffer in the browser and add it to the doc.
