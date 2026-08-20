import { NextResponse } from "next/server";
import { readSheet } from "@/lib/googleSheets";
import {
  getDashboardSummary,
  parseDashboardRows,
} from "@/lib/dashboardData";

const SPREADSHEET_ID =
  "1dAgy7nmr7IENjc2qm3wmDn2v_7czT7JkmS4iwyYFSzk";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    /*
      Leemos las columnas A:K.

      No limitamos la cantidad de semanas para que, conforme
      Google Sheets vaya creciendo, el dashboard las reciba
      automáticamente.
    */
    const rows = await readSheet(
      SPREADSHEET_ID,
      "A:K"
    );

    const data = parseDashboardRows(rows);
    const summary = getDashboardSummary(data);

    return NextResponse.json({
      ok: true,

      updatedAt: new Date().toISOString(),

      summary,

      weeks: data,

      meta: {
        totalWeeks: data.length,
        source: "Google Sheets",
      },
    });
  } catch (error) {
    console.error("Error leyendo datos del dashboard:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener los datos.",
      },
      {
        status: 500,
      }
    );
  }
}
