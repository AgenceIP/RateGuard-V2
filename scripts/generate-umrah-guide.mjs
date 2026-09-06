// Hand-rolled, dependency-free PDF writer for the /umrah lead-magnet guide.
// No PDF library is in package.json, so this builds the minimal object graph
// (catalog, pages, fonts, per-page content streams) and its xref table by
// hand, tracking each object's byte offset as it's serialized. Re-run with
// `node scripts/generate-umrah-guide.mjs` whenever the guide copy changes.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "downloads", "canadian-umrah-guide.pdf");

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 56;
const LINE_HEIGHT = 15;

/** @typedef {{ text: string, size?: number, bold?: boolean, gapBefore?: number }} Line */

/** @type {Line[][]} */
const PAGES = [
  [
    { text: "The Canadian Umrah Agency Guide to", size: 20, bold: true },
    { text: "Shariah-Compliant Currency Risk Management", size: 20, bold: true, gapBefore: 2 },
    { text: "A short guide from RateGuard", size: 11, gapBefore: 10 },
    { text: " ", gapBefore: 18 },
    { text: "1. The problem: your margin depends on a rate you don't control", size: 13, bold: true },
    { text: " ", gapBefore: 4 },
    { text: "Canadian Umrah agencies price land packages in CAD months before", gapBefore: 2 },
    { text: "departure, but pay Saudi hotels, transport, and visa providers in Saudi", },
    { text: "Riyal (SAR) closer to the travel date. Between quoting and paying, the" },
    { text: "CAD/SAR rate can move. If the Riyal strengthens against the Canadian" },
    { text: "dollar, the same SAR bill costs more CAD than you budgeted for -" },
    { text: "eating directly into your margin, or forcing a late price increase on" },
    { text: "pilgrims (pelerins) who already paid a fixed price." },
    { text: " ", gapBefore: 8 },
    { text: "This is pure currency risk, not a business or operational risk. It has", gapBefore: 4 },
    { text: "nothing to do with how well the season is run, and it is entirely" },
    { text: "possible to manage it - without predicting which way the rate will move." },
    { text: " ", gapBefore: 10 },
    { text: "2. Why this hits Umrah agencies harder than most importers", size: 13, bold: true, gapBefore: 6 },
    { text: " ", gapBefore: 4 },
    { text: "- Package prices are fixed and public months in advance." },
    { text: "- The SAR leg (hotels, transport, visas) is a large majority of cost." },
    { text: "- Group sizes are known early, so the exposure is easy to calculate -" },
    { text: "  which also means it is easy to hedge, once you decide to." },
  ],
  [
    { text: "3. The conventional fix, and why it needs adapting", size: 13, bold: true },
    { text: " ", gapBefore: 4 },
    { text: "Corporations facing this exact problem use a forward contract: an" },
    { text: "agreement to exchange currency at an agreed rate on a future date. It" },
    { text: "removes the guesswork, at the cost of giving up any upside if the rate" },
    { text: "moves in your favour." },
    { text: " ", gapBefore: 8 },
    { text: "In traditional Islamic finance, a standard forward can be problematic:", gapBefore: 4 },
    { text: "it fixes an exchange today for currency that is only actually delivered" },
    { text: "later, without either side taking possession at the time of the" },
    { text: "agreement. That structure is part of what scholars have raised concerns" },
    { text: "about in currency forwards generally." },
    { text: " ", gapBefore: 10 },
    { text: "4. Wa'ad: the Shariah-compliant alignment", size: 13, bold: true, gapBefore: 6 },
    { text: " ", gapBefore: 4 },
    { text: "Modern Islamic finance addresses this with Wa'ad - a binding unilateral", },
    { text: "promise. Under a Wa'ad structure:" },
    { text: " ", gapBefore: 4 },
    { text: "- The agency (or the provider) makes a binding promise today to" },
    { text: "  exchange currency at a specific rate on a specific future date." },
    { text: "- No exchange of money happens at the time of the promise." },
    { text: "- The actual transaction and exchange only occur on the maturity date" },
    { text: "  itself, when both sides genuinely deliver what was promised." },
    { text: " ", gapBefore: 8 },
    { text: "The economics are the same as a forward - your rate is locked - but the", gapBefore: 4 },
    { text: "structure (a promise, executed later, rather than a same-day exchange" },
    { text: "of undelivered currency) is what modern Islamic corporate banking desks" },
    { text: "use to offer this while respecting Islamic financial frameworks." },
    { text: " ", gapBefore: 8 },
    { text: "Important: most conventional fintech providers (OFX included) offer the", gapBefore: 4 },
    { text: "same underlying economic structure as a Wa'ad, but typically without a" },
    { text: "formal Shariah certification board attached to it. If certification" },
    { text: "matters to your agency, ask for it explicitly - see the checklist." },
  ],
  [
    { text: "5. Your action checklist", size: 13, bold: true },
    { text: " ", gapBefore: 4 },
    { text: "1. Calculate your season's total SAR exposure: pilgrims x land package", },
    { text: "   cost per pilgrim in SAR. Do this per departure group, not just once" },
    { text: "   a year - group sizes and dates vary." },
    { text: " ", gapBefore: 6 },
    { text: "2. Decide your compliance preference up front: conventional corporate" },
    { text: "   forward, or a Shariah-certified Wa'ad structure. Put it in writing" },
    { text: "   when you request quotes, so providers answer the right question." },
    { text: " ", gapBefore: 6 },
    { text: "3. Get a firm rate-lock quote before final pricing, not after. A quote" },
    { text: "   typically includes a transfer fee and an upfront margin deposit -" },
    { text: "   commonly 5-10% of the locked amount - held until settlement." },
    { text: " ", gapBefore: 6 },
    { text: "4. Keep a liquidity buffer of 5-10% of your locked SAR exposure on" },
    { text: "   hand. This is the deposit providers hold as security, not a fee you" },
    { text: "   lose - budget for it as working capital, not cost." },
    { text: " ", gapBefore: 6 },
    { text: "5. If Shariah certification is a requirement, ask explicitly for it -" },
    { text: "   and ask which board certified the structure. If a provider cannot" },
    { text: "   answer clearly, treat that as your answer." },
    { text: " ", gapBefore: 6 },
    { text: "6. Re-run the numbers per departure. Rates, group sizes, and SAR costs" },
    { text: "   change season to season - a hedge is not a one-time decision." },
    { text: " ", gapBefore: 14 },
    { text: "Where RateGuard fits in", size: 13, bold: true, gapBefore: 6 },
    { text: " ", gapBefore: 4 },
    { text: "RateGuard's Umrah calculator turns step 1 into a live number for your" },
    { text: "own group sizes and SAR costs, flags whether your origin country is" },
    { text: "supported by digital corridor providers like OFX today, and routes you" },
    { text: "to the right guidance for step 2 based on your compliance preference." },
    { text: " ", gapBefore: 10 },
    { text: "This guide is educational and does not constitute financial or Shariah", size: 9, gapBefore: 16 },
    { text: "advice. Confirm certification claims directly with your chosen", size: 9 },
    { text: "provider and, where it matters to you, with your own Shariah advisor.", size: 9 },
  ],
];

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildContentStream(lines) {
  let y = PAGE_HEIGHT - MARGIN;
  let currentFont = "";
  let currentSize = 0;
  const ops = ["BT"];

  for (const line of lines) {
    const size = line.size ?? 10;
    const font = line.bold ? "F2" : "F1";
    y -= (line.gapBefore ?? 0) + LINE_HEIGHT;

    if (font !== currentFont || size !== currentSize) {
      ops.push(`/${font} ${size} Tf`);
      currentFont = font;
      currentSize = size;
    }
    ops.push(`1 0 0 1 ${MARGIN} ${y.toFixed(2)} Tm`);
    ops.push(`(${escapePdfText(line.text)}) Tj`);
  }

  ops.push("ET");
  return ops.join("\n");
}

function buildPdf() {
  const objects = [];
  // Indices are 1-based to match PDF object numbers; index 0 is unused.
  const reserve = () => objects.push(null) && objects.length;

  const catalogNum = reserve();
  const pagesNum = reserve();
  const fontRegularNum = reserve();
  const fontBoldNum = reserve();

  const pageNums = [];
  const contentNums = [];
  for (let i = 0; i < PAGES.length; i++) {
    pageNums.push(reserve());
    contentNums.push(reserve());
  }

  objects[catalogNum - 1] = `<< /Type /Catalog /Pages ${pagesNum} 0 R >>`;
  objects[pagesNum - 1] = `<< /Type /Pages /Kids [${pageNums.map((n) => `${n} 0 R`).join(" ")}] /Count ${PAGES.length} >>`;
  objects[fontRegularNum - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[fontBoldNum - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  PAGES.forEach((lines, i) => {
    const stream = buildContentStream(lines);
    objects[pageNums[i] - 1] =
      `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontRegularNum} 0 R /F2 ${fontBoldNum} 0 R >> >> ` +
      `/Contents ${contentNums[i]} 0 R >>`;
    objects[contentNums[i] - 1] = `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0]; // object 0 is the free-list head, offset 0 by convention

  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return { pdf, objects, offsets, catalogNum };
}

function verify(pdf, offsets) {
  for (let i = 1; i < offsets.length; i++) {
    const slice = pdf.slice(offsets[i], offsets[i] + 12);
    if (!new RegExp(`^${i} 0 obj`).test(slice)) {
      throw new Error(`xref offset for object ${i} is wrong: found "${slice}"`);
    }
  }
}

const { pdf, offsets } = buildPdf();
verify(pdf, offsets);

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, Buffer.from(pdf, "latin1"));
console.log(`Wrote ${OUT_PATH} (${Buffer.byteLength(pdf, "latin1")} bytes, ${PAGES.length} pages)`);
