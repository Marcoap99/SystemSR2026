import { describe, expect, it } from "vitest";
import { noteDocumentToPlainText, noteWordCount } from "@/lib/domain/notes";

const paragraph = (text: string) => ({
  id: "1",
  type: "paragraph",
  props: {},
  content: text === "" ? [] : [{ type: "text", text, styles: {} }],
  children: [],
});

describe("noteDocumentToPlainText", () => {
  it("returns empty string for null/non-array input", () => {
    expect(noteDocumentToPlainText(null)).toBe("");
    expect(noteDocumentToPlainText(undefined)).toBe("");
    expect(noteDocumentToPlainText("not an array")).toBe("");
  });

  it("returns empty string for an empty document ([])", () => {
    expect(noteDocumentToPlainText([])).toBe("");
  });

  it("joins paragraph text across blocks with newlines", () => {
    const doc = [paragraph("Qué me llevo"), paragraph("B=MAP explica la conducta")];
    expect(noteDocumentToPlainText(doc)).toBe("Qué me llevo\nB=MAP explica la conducta");
  });

  it("drops blank-content blocks (the template's empty bullets)", () => {
    const doc = [paragraph("Título"), paragraph(""), paragraph("Otro")];
    expect(noteDocumentToPlainText(doc)).toBe("Título\nOtro");
  });

  it("recurses into nested inline content (e.g. a link's styled-text children)", () => {
    const doc = [
      {
        id: "1",
        type: "paragraph",
        props: {},
        content: [{ type: "link", href: "https://x", content: [{ type: "text", text: "enlace", styles: {} }] }],
        children: [],
      },
    ];
    expect(noteDocumentToPlainText(doc)).toBe("enlace");
  });

  it("recurses into children blocks (nested list items)", () => {
    const doc = [
      {
        id: "1",
        type: "bulletListItem",
        props: {},
        content: [{ type: "text", text: "padre", styles: {} }],
        children: [paragraph("hijo")],
      },
    ];
    expect(noteDocumentToPlainText(doc)).toBe("padre\nhijo");
  });
});

describe("noteWordCount", () => {
  it("is 0 for a null document", () => {
    expect(noteWordCount(null)).toBe(0);
  });

  it("is 0 for a document that is technically non-null but has no text (emptied template)", () => {
    expect(noteWordCount([paragraph(""), paragraph("")])).toBe(0);
  });

  it("counts words across all blocks", () => {
    const doc = [paragraph("BJ Fogg, Octalysis y Hook Model"), paragraph("cinco palabras más aquí")];
    expect(noteWordCount(doc)).toBe(10);
  });
});
