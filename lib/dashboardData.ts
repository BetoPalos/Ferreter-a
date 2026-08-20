// lib/dashboardData.ts

export type DashboardWeek = {
  semana: number;
  fechaFinal: string;

  ventaEntidades: number;
  ventaEventos: number;
  ventaAlmacen: number;
  ventaTotal: number;

  comprasInsumos: number;
  diferenciaSemanal: number;

  acumuladoEntidades: number;
  acumuladoEventos: number;
  acumuladoAlmacen: number;
};

function moneyToNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  const text = String(value).trim();

  if (!text) return 0;

  // Detecta negativos escritos como -$123 o -123
  const negative = text.includes("-");

  // Elimina $, comas, espacios y cualquier otro símbolo.
  const cleaned = text.replace(/[^0-9.]/g, "");

  const number = Number(cleaned);

  if (!Number.isFinite(number)) return 0;

  return negative ? -number : number;
}

function integerToNumber(value: unknown): number {
  const number = Number(String(value ?? "").replace(/[^0-9-]/g, ""));

  return Number.isFinite(number) ? number : 0;
}

export function parseDashboardRows(
  rows: unknown[][],
): DashboardWeek[] {
  /*
    Estructura actual del Sheet:

    fila 0 = títulos superiores ("Semanal", "Acumulado")
    fila 1 = encabezados reales
    fila 2+ = datos

    Columnas:

    0  Sem
    1  Fecha Final
    2  Importe Vta (Entidades)
    3  Importe Vta Ideando (Eventos)
    4  Importe Vta Ideando (Almacén)
    5  Importe Vta TOTAL
    6  Compras Insumos
    7  Dif Semanal
    8  Acumulado Entidades
    9  Acumulado Eventos
    10 Acumulado Almacén
  */

  return rows
    .slice(2)
    .filter((row) => Array.isArray(row) && row.length > 0)
    .map((row) => ({
      semana: integerToNumber(row[0]),
      fechaFinal: String(row[1] ?? ""),

      ventaEntidades: moneyToNumber(row[2]),
      ventaEventos: moneyToNumber(row[3]),
      ventaAlmacen: moneyToNumber(row[4]),
      ventaTotal: moneyToNumber(row[5]),

      comprasInsumos: moneyToNumber(row[6]),
      diferenciaSemanal: moneyToNumber(row[7]),

      acumuladoEntidades: moneyToNumber(row[8]),
      acumuladoEventos: moneyToNumber(row[9]),
      acumuladoAlmacen: moneyToNumber(row[10]),
    }))
    .filter((row) => row.semana > 0);
}

export function getDashboardSummary(data: DashboardWeek[]) {
  if (data.length === 0) {
    return {
      semanaActual: 0,
      fechaActual: "",
      ventaSemana: 0,
      comprasSemana: 0,
      diferenciaSemana: 0,
      ventaAcumulada: 0,
      entidadesAcumulado: 0,
      eventosAcumulado: 0,
      almacenAcumulado: 0,
    };
  }

  const latest = data[data.length - 1];

  return {
    semanaActual: latest.semana,
    fechaActual: latest.fechaFinal,

    ventaSemana: latest.ventaTotal,
    comprasSemana: latest.comprasInsumos,
    diferenciaSemana: latest.diferenciaSemanal,

    ventaAcumulada:
      latest.acumuladoEntidades +
      latest.acumuladoEventos +
      latest.acumuladoAlmacen,

    entidadesAcumulado: latest.acumuladoEntidades,
    eventosAcumulado: latest.acumuladoEventos,
    almacenAcumulado: latest.acumuladoAlmacen,
  };
}


