import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";

// What is saved with a booking's consent record: the exact wording that was
// agreed, so the PDF is accurate even if the wording is edited later.
// (A type alias rather than an interface so it can be stored as JSON.)
export type ConsentSnapshot = {
  terms: { heading: string; text: string }[];
  agreed: { heading: string; statements: string[] }[];
  photo: {
    permitted: boolean;
    text: string;
    // Both choices as shown on the form, so the PDF can show which was ticked.
    options?: { yes: string; no: string };
  };
};

export interface ConsentPdfInput {
  businessName: string;
  customerName: string;
  customerEmail: string;
  dogName: string;
  serviceName: string;
  appointmentAt: Date;
  signedName: string;
  signedAt: Date;
  termsVersion: string;
  snapshot: ConsentSnapshot;
}

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 54;

const BRAND = rgb(0.059, 0.463, 0.431);
const INK = rgb(0.169, 0.149, 0.133);
const MUTED = rgb(0.42, 0.384, 0.357);
const LINE = rgb(0.85, 0.82, 0.78);

function formatDateTime(date: Date): string {
  const day = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BUSINESS_TIME_ZONE,
  });
  return `${day} at ${time}`;
}

// The standard PDF fonts only cover Western European characters. Anything
// else (emoji, other alphabets) is swapped for "?" instead of failing.
function toSupportedText(font: PDFFont, text: string): string {
  let result = "";
  for (const character of text.replace(/\s+/g, " ")) {
    try {
      font.encodeText(character);
      result += character;
    } catch {
      result += "?";
    }
  }
  return result;
}

function wrapText(
  font: PDFFont,
  text: string,
  size: number,
  maxWidth: number
): string[] {
  const words = toSupportedText(font, text).split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }

  return lines;
}

export async function buildConsentPdf(
  input: ConsentPdfInput
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Customer consent form - ${input.dogName}`);
  pdf.setAuthor(input.businessName);
  pdf.setCreationDate(new Date());

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const signatureFont = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(height: number) {
    if (y - height < MARGIN + 24) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawLines(
    lines: string[],
    options: {
      font: PDFFont;
      size: number;
      x?: number;
      color?: ReturnType<typeof rgb>;
      leading?: number;
    }
  ) {
    const { font, size, x = MARGIN, color = INK, leading = size * 1.4 } = options;
    for (const line of lines) {
      ensureSpace(leading);
      y -= leading;
      page.drawText(line, { x, y: y + (leading - size) / 2, size, font, color });
    }
  }

  function paragraph(
    text: string,
    options: { font?: PDFFont; size?: number; x?: number; color?: ReturnType<typeof rgb> } = {}
  ) {
    const font = options.font ?? regular;
    const size = options.size ?? 10;
    const x = options.x ?? MARGIN;
    drawLines(wrapText(font, text, size, PAGE_WIDTH - MARGIN - x), {
      font,
      size,
      x,
      color: options.color,
    });
  }

  function sectionHeading(text: string) {
    ensureSpace(34);
    y -= 14;
    drawLines([toSupportedText(bold, text.toUpperCase())], {
      font: bold,
      size: 10,
      color: BRAND,
    });
    page.drawLine({
      start: { x: MARGIN, y: y - 3 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - 3 },
      thickness: 0.6,
      color: LINE,
    });
    y -= 6;
  }

  function tickedItem(text: string, ticked: boolean) {
    const size = 10;
    const boxSize = 9;
    const textX = MARGIN + 18;
    const lines = wrapText(regular, text, size, PAGE_WIDTH - MARGIN - textX);
    const height = lines.length * size * 1.4 + 6;

    ensureSpace(height);
    const top = y;

    page.drawRectangle({
      x: MARGIN,
      y: top - 12,
      width: boxSize,
      height: boxSize,
      borderColor: INK,
      borderWidth: 0.8,
    });
    if (ticked) {
      page.drawLine({
        start: { x: MARGIN + 1.8, y: top - 10.2 },
        end: { x: MARGIN + boxSize - 1.8, y: top - 12 + boxSize - 1.8 },
        thickness: 1.2,
        color: BRAND,
      });
      page.drawLine({
        start: { x: MARGIN + 1.8, y: top - 12 + boxSize - 1.8 },
        end: { x: MARGIN + boxSize - 1.8, y: top - 10.2 },
        thickness: 1.2,
        color: BRAND,
      });
    }

    drawLines(lines, { font: regular, size, x: textX });
    y -= 6;
  }

  // --- Header ---
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 8,
    width: PAGE_WIDTH,
    height: 8,
    color: BRAND,
  });

  y -= 6;
  drawLines([toSupportedText(bold, input.businessName)], {
    font: bold,
    size: 20,
    color: BRAND,
  });
  drawLines(["Customer Consent Form"], { font: regular, size: 13, color: INK });
  page.drawLine({
    start: { x: MARGIN, y: y - 6 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 6 },
    thickness: 1.4,
    color: BRAND,
  });
  y -= 10;

  // --- Booking details ---
  sectionHeading("Booking details");
  const details: [string, string][] = [
    ["Dog", input.dogName],
    ["Owner", input.customerName],
    ["Email", input.customerEmail],
    ["Service", input.serviceName],
    ["Appointment", formatDateTime(input.appointmentAt)],
  ];
  for (const [label, value] of details) {
    ensureSpace(16);
    y -= 14;
    page.drawText(`${label}:`, { x: MARGIN, y, size: 10, font: bold, color: MUTED });
    page.drawText(toSupportedText(regular, value), {
      x: MARGIN + 90,
      y,
      size: 10,
      font: regular,
      color: INK,
    });
  }

  // --- Terms ---
  sectionHeading("Terms and conditions");
  for (const point of input.snapshot.terms) {
    ensureSpace(30);
    y -= 4;
    drawLines([toSupportedText(bold, point.heading)], { font: bold, size: 10 });
    paragraph(point.text);
  }

  // --- Agreed statements ---
  for (const section of input.snapshot.agreed) {
    sectionHeading(section.heading);
    for (const statement of section.statements) {
      tickedItem(statement, true);
    }
  }

  // --- Photography ---
  sectionHeading("Photography and social media");
  const photo = input.snapshot.photo;
  if (photo.options) {
    tickedItem(photo.options.yes, photo.permitted);
    tickedItem(photo.options.no, !photo.permitted);
  } else {
    tickedItem(photo.text, photo.permitted);
  }
  paragraph(
    input.snapshot.photo.permitted
      ? "The customer chose: photos and videos may be used."
      : "The customer chose: photos and videos may NOT be used.",
    { font: bold, size: 9, color: MUTED }
  );

  // --- Signature ---
  sectionHeading("Signature");
  ensureSpace(90);
  y -= 8;
  page.drawText("Signed by (typed name):", {
    x: MARGIN,
    y: y - 8,
    size: 9,
    font: regular,
    color: MUTED,
  });
  y -= 30;
  page.drawText(toSupportedText(signatureFont, input.signedName), {
    x: MARGIN,
    y,
    size: 22,
    font: signatureFont,
    color: INK,
  });
  page.drawLine({
    start: { x: MARGIN, y: y - 6 },
    end: { x: MARGIN + 260, y: y - 6 },
    thickness: 0.6,
    color: INK,
  });
  y -= 22;
  page.drawText(`Date and time signed: ${formatDateTime(input.signedAt)}`, {
    x: MARGIN,
    y,
    size: 10,
    font: regular,
    color: INK,
  });
  y -= 16;
  page.drawText(
    "Signed electronically by typing the name above when the booking was made.",
    { x: MARGIN, y, size: 8.5, font: regular, color: MUTED }
  );

  // --- Footers on every page ---
  const pages = pdf.getPages();
  pages.forEach((current, index) => {
    current.drawText(
      `Generated by the ${toSupportedText(regular, input.businessName)} website - terms version ${input.termsVersion}`,
      { x: MARGIN, y: 30, size: 8, font: regular, color: MUTED }
    );
    const label = `Page ${index + 1} of ${pages.length}`;
    current.drawText(label, {
      x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(label, 8),
      y: 30,
      size: 8,
      font: regular,
      color: MUTED,
    });
  });

  return pdf.save();
}
