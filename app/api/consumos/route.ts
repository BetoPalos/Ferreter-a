import { NextResponse } from "next/server";
import { readSheet } from "@/lib/googleSheets";

const SPREADSHEET_ID =
  "1dAgy7mmr7IENjc2qm3wmDn2v_7czT7JkmS4iwyYFSzk";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await readSheet(
      SPREADSHEET_ID,
      "A:Z"
    );

    return NextResponse.json({
      ok: true,
      rowCount: rows.length,
      rows: rows.slice(0, 20),
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