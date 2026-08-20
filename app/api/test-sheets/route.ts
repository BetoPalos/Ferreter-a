import { NextResponse } from "next/server";
import { readSheet } from "@/lib/googleSheets";

const SPREADSHEET_ID = "1dAgy7nmr7IENjc2qm3wmDn2v_7czT7JkmS4iwyYFSzk";

export async function GET() {
  try {
    const rows = await readSheet(
      SPREADSHEET_ID,
      "A1:K10"
    );

    return NextResponse.json({
      ok: true,
      rows,
    });
  } catch (error) {
    console.error(error);

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