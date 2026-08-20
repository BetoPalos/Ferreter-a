import { NextResponse } from "next/server";
import { readSheet } from "@/lib/googleSheets";

const SPREADSHEET_ID =
  "1dAgy7nmr7IENjc2qm3wmDn2v_7czT7JkmS4iwyYFSzk";

export const dynamic = "force-dynamic";

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  const text = String(value).trim();

  if (!text) return 0;

  const negative = text.includes("-");

  const cleaned = text.replace(/[^0-9.]/g, "");

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) return 0;

  return negative ? -parsed : parsed;
}

export async function GET() {
  try {
    const rows = await readSheet(
      SPREADSHEET_ID,
      "'Consumos detalle'!A:M"
    );

    const data = rows
      .slice(1)
      .filter(
        (row) =>
          Array.isArray(row) &&
          row.some((cell) => String(cell ?? "").trim() !== "")
      )
      .map((row) => ({
        cliente: String(row[0] ?? ""),
        clave: String(row[1] ?? ""),
        nombre: String(row[2] ?? ""),
        fechaEvento: String(row[3] ?? ""),
        vendedor: String(row[4] ?? ""),
        fecha: String(row[5] ?? ""),
        codigo: String(row[6] ?? ""),
        cantidad: toNumber(row[7]),
        descripcion: String(row[8] ?? ""),
        precioLista: toNumber(row[9]),
        total: toNumber(row[10]),
        folio: String(row[11] ?? ""),
        area: String(row[12] ?? ""),
      }));

    return NextResponse.json({
      ok: true,
      rowCount: data.length,
      rows: data,
    });
  } catch (error) {
    console.error("Error /api/consumos:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      },
      { status: 500 }
    );
  }
}