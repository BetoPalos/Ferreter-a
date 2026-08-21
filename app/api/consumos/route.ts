import { NextResponse } from "next/server";
import { readSheet } from "@/lib/googleSheets";

const SPREADSHEET_ID =
  "1dAgy7nmr7IENjc2qm3wmDn2v_7czT7JkmS4iwyYFSzk";

export const dynamic = "force-dynamic";

type ConsumptionRow = {
  cliente: string;
  clave: string;
  nombre: string;
  fechaEvento: string;
  vendedor: string;
  fecha: string;
  codigo: string;
  cantidad: number;
  descripcion: string;
  precioLista: number;
  total: number;
  folio: string;
  area: string;

  // Campos normalizados para el dashboard
  evento: string;
  eventKey: string;
};

function toNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const text = String(value).trim();

  if (!text) {
    return 0;
  }

  const negative = text.includes("-");

  const cleaned = text.replace(/[^0-9.]/g, "");

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return negative ? -parsed : parsed;
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function parseList(
  searchParams: URLSearchParams,
  name: string
): string[] {
  const values = searchParams.getAll(name);

  if (values.length > 1) {
    return values
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const single = searchParams.get(name);

  if (!single) {
    return [];
  }

  return single
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function previousPeriod(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  const days =
    Math.round(
      (end.getTime() - start.getTime()) / 86400000
    ) + 1;

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(
    previousStart.getDate() - days + 1
  );

  return {
    from: formatDate(previousStart),
    to: formatDate(previousEnd),
  };
}

function changePct(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function filterRows(
  rows: ConsumptionRow[],
  options: {
    from: string;
    to: string;
    areas: string[];
    vendors: string[];
    clients: string[];
    materials: string[];
  }
) {
  return rows.filter((row) => {
    return (
      row.fecha >= options.from &&
      row.fecha <= options.to &&
      (options.areas.length === 0 ||
        options.areas.includes(row.area)) &&
      (options.vendors.length === 0 ||
        options.vendors.includes(row.vendedor)) &&
      (options.clients.length === 0 ||
        options.clients.includes(row.evento)) &&
      (options.materials.length === 0 ||
        options.materials.includes(row.descripcion))
    );
  });
}

function summarize(rows: ConsumptionRow[]) {
  const spend = rows.reduce(
    (sum, row) => sum + row.total,
    0
  );

  const units = rows.reduce(
    (sum, row) => sum + row.cantidad,
    0
  );

  /*
    Consideramos "ALMACEN" como consumo interno,
    no como un evento atendido.
  */
  const eventKeys = new Set(
    rows
      .filter(
        (row) =>
          row.eventKey &&
          row.eventKey.toUpperCase() !== "ALMACEN"
      )
      .map((row) => row.eventKey)
  );

  const events = eventKeys.size;

  const average =
    events > 0 ? spend / events : 0;

  return {
    spend,
    units,
    events,
    average,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    /*
      Ejemplos:

      /api/consumos?from=2026-08-01&to=2026-08-31

      /api/consumos?from=2026-08-01&to=2026-08-31
        &areas=ACCESORIOS
        &vendors=HUMBERTO
    */

    const rows = await readSheet(
      SPREADSHEET_ID,
      "'Consumos detalle'!A:M"
    );

    const allRows: ConsumptionRow[] = rows
      .slice(1)
      .filter(
        (row) =>
          Array.isArray(row) &&
          row.some(
            (cell) =>
              cleanText(cell) !== ""
          )
      )
      .map((row) => {
        const cliente = cleanText(row[0]);
        const clave = cleanText(row[1]);
        const nombre = cleanText(row[2]);

        /*
          Para mostrar "Cliente / Evento" usamos NOMBRE
          cuando existe; si no, CLIENTE o CLAVE.
        */
        const evento =
          nombre || cliente || clave;

        /*
          Para contar eventos intentamos usar CLAVE
          como identificador estable.
        */
        const eventKey =
          clave || nombre || cliente;

        return {
          cliente,
          clave,
          nombre,
          fechaEvento: cleanText(row[3]),
          vendedor: cleanText(row[4]),
          fecha: cleanText(row[5]),
          codigo: cleanText(row[6]),
          cantidad: toNumber(row[7]),
          descripcion: cleanText(row[8]),
          precioLista: toNumber(row[9]),
          total: toNumber(row[10]),
          folio: cleanText(row[11]),
          area: cleanText(row[12]),
          evento,
          eventKey,
        };
      })
      .filter(
        (row) =>
          /^\d{4}-\d{2}-\d{2}$/.test(row.fecha)
      );

    if (allRows.length === 0) {
      return NextResponse.json({
        ok: true,
        updatedAt: new Date().toISOString(),

        filters: {
          from: "",
          to: "",
        },

        options: {
          areas: [],
          vendors: [],
          clients: [],
          materials: [],
        },

        summary: {
          current: {
            spend: 0,
            units: 0,
            events: 0,
            average: 0,
          },
          previous: {
            spend: 0,
            units: 0,
            events: 0,
            average: 0,
          },
          change: {
            spend: 0,
            units: 0,
            events: 0,
            average: 0,
          },
        },

        spendByArea: [],
        topMaterials: [],
        trend: {
          granularity: "day",
          keys: [],
          series: [],
        },

        detail: [],
        detailCount: 0,
      });
    }

    const dates = allRows
      .map((row) => row.fecha)
      .sort();

    const latestDate =
      dates[dates.length - 1];

    const latest = new Date(
      `${latestDate}T00:00:00`
    );

    const defaultFromDate =
      new Date(latest);

    defaultFromDate.setDate(
      defaultFromDate.getDate() - 30
    );

    const from =
      searchParams.get("from") ||
      formatDate(defaultFromDate);

    const to =
      searchParams.get("to") ||
      latestDate;

    const areas =
      parseList(searchParams, "areas");

    const vendors =
      parseList(searchParams, "vendors");

    const clients =
      parseList(searchParams, "clients");

    const materials =
      parseList(searchParams, "materials");

    const requestedGranularity =
      searchParams.get("granularity");

    const fromDate = new Date(
      `${from}T00:00:00`
    );

    const toDate = new Date(
      `${to}T00:00:00`
    );

    const rangeDays =
      Math.round(
        (toDate.getTime() -
          fromDate.getTime()) /
          86400000
      ) + 1;

    const granularity =
      requestedGranularity === "month"
        ? "month"
        : requestedGranularity === "day"
          ? "day"
          : rangeDays > 62
            ? "month"
            : "day";

    const filters = {
      from,
      to,
      areas,
      vendors,
      clients,
      materials,
    };

    const currentRows =
      filterRows(allRows, filters);

    const previous =
      previousPeriod(from, to);

    const previousRows =
      filterRows(allRows, {
        ...filters,
        from: previous.from,
        to: previous.to,
      });

    const currentSummary =
      summarize(currentRows);

    const previousSummary =
      summarize(previousRows);

    /*
      Opciones de filtros.

      Las obtenemos de todos los datos disponibles
      para que el usuario pueda cambiar de periodo
      sin perder las opciones.
    */
    const options = {
      areas: unique(
        allRows.map((row) => row.area)
      ),

      vendors: unique(
        allRows.map((row) => row.vendedor)
      ),

      clients: unique(
        allRows.map((row) => row.evento)
      ),

      materials: unique(
        allRows.map(
          (row) => row.descripcion
        )
      ),
    };

    /*
      Consumo por área
    */
    const spendByArea = unique(
      currentRows.map((row) => row.area)
    )
      .map((area) => ({
        area,

        value: currentRows
          .filter(
            (row) => row.area === area
          )
          .reduce(
            (sum, row) =>
              sum + row.total,
            0
          ),
      }))
      .filter(
        (item) => item.value !== 0
      )
      .sort(
        (a, b) =>
          b.value - a.value
      );

    /*
      Top materiales
    */
    const topMaterials = unique(
      currentRows.map(
        (row) => row.descripcion
      )
    )
      .map((material) => ({
        material,

        value: currentRows
          .filter(
            (row) =>
              row.descripcion === material
          )
          .reduce(
            (sum, row) =>
              sum + row.total,
            0
          ),
      }))
      .filter(
        (item) => item.value !== 0
      )
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .slice(0, 6);

    /*
      Tendencia temporal
    */
    const keyForDate = (
      value: string
    ) =>
      granularity === "month"
        ? value.slice(0, 7)
        : value;

    const trendKeys = unique(
      currentRows.map((row) =>
        keyForDate(row.fecha)
      )
    ).sort();

    const trendAreas =
      areas.length > 0
        ? areas
        : unique(
            currentRows.map(
              (row) => row.area
            )
          );

    const trendSeries =
      trendAreas.map((area) => ({
        area,

        values: trendKeys.map((key) => ({
          key,

          value: currentRows
            .filter(
              (row) =>
                row.area === area &&
                keyForDate(row.fecha) ===
                  key
            )
            .reduce(
              (sum, row) =>
                sum + row.total,
              0
            ),
        })),
      }));

    /*
      Detalle.

      Para evitar devolver decenas de miles de filas,
      ponemos un límite.

      Se puede cambiar con:
      ?detailLimit=500
    */
    const requestedLimit =
      Number(
        searchParams.get(
          "detailLimit"
        ) || "250"
      );

    const detailLimit =
      Number.isFinite(requestedLimit)
        ? Math.min(
            Math.max(
              requestedLimit,
              0
            ),
            1000
          )
        : 250;

    const detail = currentRows
      .slice()
      .sort((a, b) =>
        b.fecha.localeCompare(a.fecha)
      )
      .slice(0, detailLimit)
      .map((row) => ({
        fecha: row.fecha,
        cliente: row.cliente,
        evento: row.evento,
        vendedor: row.vendedor,
        codigo: row.codigo,
        descripcion: row.descripcion,
        area: row.area,
        cantidad: row.cantidad,
        total: row.total,
        folio: row.folio,
      }));

    return NextResponse.json({
      ok: true,

      updatedAt:
        new Date().toISOString(),

      source: {
        spreadsheet:
          "Ferretería Control Semanal",
        sheet: "Consumos detalle",
        totalRows: allRows.length,
      },

      filters: {
        from,
        to,
        previousFrom:
          previous.from,
        previousTo:
          previous.to,
      },

      options,

      summary: {
        current: currentSummary,

        previous: previousSummary,

        change: {
          spend: changePct(
            currentSummary.spend,
            previousSummary.spend
          ),

          units: changePct(
            currentSummary.units,
            previousSummary.units
          ),

          events: changePct(
            currentSummary.events,
            previousSummary.events
          ),

          average: changePct(
            currentSummary.average,
            previousSummary.average
          ),
        },
      },

      spendByArea,

      topMaterials,

      trend: {
        granularity,
        keys: trendKeys,
        series: trendSeries,
      },

      detailCount:
        currentRows.length,

      detail,
    });
  } catch (error) {
    console.error(
      "Error /api/consumos:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      },
      {
        status: 500,
      }
    );
  }
}