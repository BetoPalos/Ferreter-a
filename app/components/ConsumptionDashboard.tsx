"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Row = {
  fecha: string;
  cliente: string;
  evento: string;
  vendedor: string;
  codigo: string;
  descripcion: string;
  area: string;
  cantidad: number;
  total: number;
};

type TimeGranularity = "auto" | "day" | "month";
type ApiResponse = {
  ok: boolean;
  updatedAt?: string;

  filters?: {
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };

  options?: {
    areas: string[];
    vendors: string[];
    clients: string[];
    materials: string[];
  };

  summary?: {
    current: {
      spend: number;
      units: number;
      events: number;
      average: number;
    };
    previous: {
      spend: number;
      units: number;
      events: number;
      average: number;
    };
    change: {
      spend: number;
      units: number;
      events: number;
      average: number;
    };
  };

  spendByArea?: {
    area: string;
    value: number;
  }[];

  topMaterials?: {
    material: string;
    value: number;
  }[];

  trend?: {
    granularity: "day" | "month";
    keys: string[];
    series: {
      area: string;
      values: {
        key: string;
        value: number;
      }[];
    }[];
  };

  detail?: Row[];
  detailCount?: number;
  error?: string;
};

const demoData: Row[] = [
  {
    fecha: "2026-06-19",
    cliente: "ALMACEN",
    evento: "ALMACEN",
    vendedor: "ESTEBAN V",
    codigo: "THINNER",
    descripcion: "LITRO THINNER",
    area: "VERT",
    cantidad: 1,
    total: 36.25,
  },
  {
    fecha: "2026-06-23",
    cliente: "ALMACEN",
    evento: "ALMACEN",
    vendedor: "ESTEBAN V",
    codigo: "GARRAFON",
    descripcion: "GARRAFON DE AGUA - CIEL",
    area: "VERT",
    cantidad: 1,
    total: 63.75,
  },
  {
    fecha: "2026-07-10",
    cliente: "ALMACEN",
    evento: "ALMACEN",
    vendedor: "ESTEBAN V",
    codigo: "11623",
    descripcion: "LIJA P/AGUA #220",
    area: "VERT",
    cantidad: 1,
    total: 13,
  },
  {
    fecha: "2026-07-16",
    cliente: "ALMACEN",
    evento: "ALMACEN",
    vendedor: "ESTEBAN V",
    codigo: "GARRAFON",
    descripcion: "GARRAFON DE AGUA - CIEL",
    area: "VERT",
    cantidad: 1,
    total: 63.75,
  },
  {
    fecha: "2026-07-20",
    cliente: "BODA MARTINEZ",
    evento: "BODA MARTINEZ",
    vendedor: "JESUS S",
    codigo: "LIJA",
    descripcion: "LIJA P/AGUA #220",
    area: "CARPINTERIA",
    cantidad: 8,
    total: 104,
  },
  {
    fecha: "2026-07-22",
    cliente: "BODA LUNA",
    evento: "BODA LUNA",
    vendedor: "HUMBERTO",
    codigo: "CUTER",
    descripcion: "CUTER",
    area: "MONTAJE",
    cantidad: 3,
    total: 129.3,
  },
  {
    fecha: "2026-08-03",
    cliente: "ALMACEN",
    evento: "ALMACEN",
    vendedor: "ESTEBAN V",
    codigo: "GARRAFON",
    descripcion: "GARRAFON DE AGUA - CIEL",
    area: "VERT",
    cantidad: 1,
    total: 63.75,
  },
  {
    fecha: "2026-08-05",
    cliente: "BODA ROMERO",
    evento: "BODA ROMERO",
    vendedor: "JESUS S",
    codigo: "THINNER",
    descripcion: "LITRO THINNER",
    area: "CARPINTERIA",
    cantidad: 3,
    total: 108.75,
  },
  {
    fecha: "2026-08-06",
    cliente: "BODA CASTILLO",
    evento: "BODA CASTILLO",
    vendedor: "HUMBERTO",
    codigo: "21529",
    descripcion: 'BROCHA GRANDE 4"',
    area: "MONTAJE",
    cantidad: 2,
    total: 157.76,
  },
  {
    fecha: "2026-08-07",
    cliente: "EVENTO CORPORATIVO",
    evento: "EVENTO CORPORATIVO",
    vendedor: "JESUS S",
    codigo: "CINTA",
    descripcion: "CINTA TRANSPARENTE",
    area: "DECORACION",
    cantidad: 4,
    total: 331.04,
  },
  {
    fecha: "2026-08-12",
    cliente: "BODA SIERRA",
    evento: "BODA SIERRA",
    vendedor: "HUMBERTO",
    codigo: "THINNER",
    descripcion: "LITRO THINNER",
    area: "CARPINTERIA",
    cantidad: 6,
    total: 220,
  },
  {
    fecha: "2026-08-14",
    cliente: "CORPORATIVO ALFA",
    evento: "CORPORATIVO ALFA",
    vendedor: "JESUS S",
    codigo: "CINTA",
    descripcion: "CINTA TRANSPARENTE",
    area: "DECORACION",
    cantidad: 5,
    total: 410,
  },
  {
    fecha: "2026-08-18",
    cliente: "AJUSTE DEMO",
    evento: "AJUSTE DEMO",
    vendedor: "ARMANDO",
    codigo: "DEV",
    descripcion: "DEVOLUCIÓN / AJUSTE",
    area: "MONTAJE",
    cantidad: -1,
    total: -85,
  },
];

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("es-MX").format(value);
}

function changePct(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

export default function ConsumptionDashboard() {
  const [dateFrom, setDateFrom] = useState("2026-08-01");
  const [dateTo, setDateTo] = useState("2026-08-31");

  const [areas, setAreas] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);

  const [granularity, setGranularity] =
    useState<TimeGranularity>("auto");

  const [showDetail, setShowDetail] = useState(false);

  const [apiData, setApiData] =
    useState<ApiResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadConsumptionData() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.set("from", dateFrom);
        params.set("to", dateTo);

        if (areas.length > 0) {
          params.set("areas", areas.join(","));
        }

        if (vendors.length > 0) {
          params.set("vendors", vendors.join(","));
        }

        if (clients.length > 0) {
          params.set("clients", clients.join(","));
        }

        if (materials.length > 0) {
          params.set("materials", materials.join(","));
        }

        if (granularity !== "auto") {
          params.set("granularity", granularity);
        }

        params.set("detailLimit", "250");

        const response = await fetch(
          `/api/consumos?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as ApiResponse;

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error ||
              "No fue posible cargar los consumos.",
          );
        }

        setApiData(result);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Error desconocido",
        );
      } finally {
        setLoading(false);
      }
    }

    loadConsumptionData();

    return () => {
      controller.abort();
    };
  }, [
    dateFrom,
    dateTo,
    areas,
    vendors,
    clients,
    materials,
    granularity,
  ]);

  const allAreas =
    apiData?.options?.areas ??
    unique(demoData.map((d) => d.area));

  const allVendors =
    apiData?.options?.vendors ??
    unique(demoData.map((d) => d.vendedor));

  const allClients =
    apiData?.options?.clients ??
    unique(demoData.map((d) => d.cliente));

  const allMaterials =
    apiData?.options?.materials ??
    unique(demoData.map((d) => d.descripcion));

  const previousPeriod = useMemo(() => {
    const start = new Date(`${dateFrom}T00:00:00`);
    const end = new Date(`${dateTo}T00:00:00`);

    const days =
      Math.round(
        (end.getTime() - start.getTime()) / 86400000,
      ) + 1;

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days + 1);

    const format = (date: Date) =>
      date.toISOString().slice(0, 10);

    return {
      from: format(prevStart),
      to: format(prevEnd),
    };
  }, [dateFrom, dateTo]);

const filtered =
  apiData?.detail ?? [];

const currentSpend =
  apiData?.summary?.current.spend ?? 0;

const previousSpend =
  apiData?.summary?.previous.spend ?? 0;

const currentUnits =
  apiData?.summary?.current.units ?? 0;

const previousUnits =
  apiData?.summary?.previous.units ?? 0;

const currentEvents =
  apiData?.summary?.current.events ?? 0;

const previousEvents =
  apiData?.summary?.previous.events ?? 0;

const currentAverage =
  apiData?.summary?.current.average ?? 0;

const previousAverage =
  apiData?.summary?.previous.average ?? 0;

const spendByArea =
  apiData?.spendByArea ?? [];

const topMaterials =
  apiData?.topMaterials ?? [];

const maxAreaSpend = Math.max(
  1,
  ...spendByArea.map((d) => Math.abs(d.value)),
);
  

const effectiveGranularity =
  apiData?.trend?.granularity ??
  (granularity === "month"
    ? "month"
    : "day");

const trendData =
  apiData?.trend ?? {
    granularity: effectiveGranularity,
    keys: [],
    series: [],
  };


  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            Consumos de Ferretería
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Seguimiento ejecutivo del consumo por evento,
            área y material.
          </p>
        </div>

        <div className="text-right text-sm text-slate-500">
          <div>Datos actualizados</div>

          <div className="font-medium text-slate-800">
            19 ago 2026 · 16:34
          </div>
        </div>
      </div>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid items-end gap-3 lg:grid-cols-6">
          <DateField
            label="Desde"
            value={dateFrom}
            onChange={setDateFrom}
          />

          <DateField
            label="Hasta"
            value={dateTo}
            onChange={setDateTo}
          />

          <CompactMultiSelect
            title="Área"
            options={allAreas}
            selected={areas}
            setSelected={setAreas}
          />

          <CompactMultiSelect
            title="Vendedor"
            options={allVendors}
            selected={vendors}
            setSelected={setVendors}
          />

          <CompactMultiSelect
            title="Cliente / Evento"
            options={allClients}
            selected={clients}
            setSelected={setClients}
          />

          <CompactMultiSelect
            title="Material"
            options={allMaterials}
            selected={materials}
            setSelected={setMaterials}
          />
        </div>

        <ActiveFilters
          groups={[
            {
              label: "Área",
              values: areas,
              clear: (value) =>
                setAreas(
                  areas.filter(
                    (item) => item !== value,
                  ),
                ),
            },
            {
              label: "Vendedor",
              values: vendors,
              clear: (value) =>
                setVendors(
                  vendors.filter(
                    (item) => item !== value,
                  ),
                ),
            },
            {
              label: "Evento",
              values: clients,
              clear: (value) =>
                setClients(
                  clients.filter(
                    (item) => item !== value,
                  ),
                ),
            },
            {
              label: "Material",
              values: materials,
              clear: (value) =>
                setMaterials(
                  materials.filter(
                    (item) => item !== value,
                  ),
                ),
            },
          ]}
          clearAll={() => {
            setAreas([]);
            setVendors([]);
            setClients([]);
            setMaterials([]);
          }}
        />
      </section>

      <section className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          title="Consumo total"
          value={money(currentSpend)}
          change={changePct(
            currentSpend,
            previousSpend,
          )}
          inverse
        />

        <Kpi
          title="Unidades consumidas"
          value={number(currentUnits)}
          change={changePct(
            currentUnits,
            previousUnits,
          )}
          inverse
        />

        <Kpi
          title="Eventos atendidos"
          value={number(currentEvents)}
          change={changePct(
            currentEvents,
            previousEvents,
          )}
        />

        <Kpi
          title="Consumo promedio / evento"
          value={money(currentAverage)}
          change={changePct(
            currentAverage,
            previousAverage,
          )}
          inverse
        />
      </section>

      <div className="mb-5 text-xs text-slate-400">
        Comparación: {previousPeriod.from} →{" "}
        {previousPeriod.to}
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">
              Evolución del consumo por área
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Cada línea representa el consumo de un área
              en el tiempo.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Agrupar por
            </label>

            <select
              value={granularity}
              onChange={(e) =>
                setGranularity(
                  e.target.value as TimeGranularity,
                )
              }
              className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="auto">
                Automático (
                {effectiveGranularity === "day"
                  ? "día"
                  : "mes"}
                )
              </option>

              <option value="day">Día</option>
              <option value="month">Mes</option>
            </select>
          </div>
        </div>

        <ConsumptionLineChart
          data={trendData}
          granularity={effectiveGranularity}
        />
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 font-semibold">
            Consumo por área
          </h3>

          <div className="space-y-4">
            {spendByArea.map((item) => (
              <div key={item.area}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.area}</span>

                  <span className="font-medium">
                    {money(item.value)}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-slate-800"
                    style={{
                      width: `${
                        (Math.abs(item.value) /
                          maxAreaSpend) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 font-semibold">
            Top materiales por consumo
          </h3>

          <div className="space-y-4">
            {topMaterials.map((item, index) => (
              <div
                key={item.material}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                    {index + 1}
                  </div>

                  <div className="truncate text-sm">
                    {item.material}
                  </div>
                </div>

                <div className="whitespace-nowrap text-sm font-semibold">
                  {money(item.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">
              Detalle de consumos
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Movimientos que integran los indicadores
              del periodo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDetail(!showDetail)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            {showDetail
              ? "Ocultar detalle"
              : "Ver detalle"}
          </button>
        </div>

        {showDetail && (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  {[
                    "Fecha",
                    "Cliente / Evento",
                    "Área",
                    "Vendedor",
                    "Código",
                    "Descripción",
                    "Cantidad",
                    "Total",
                  ].map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-4 py-3 font-medium"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((d, index) => (
                  <tr
                    key={`${d.fecha}-${d.codigo}-${index}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3">{d.fecha}</td>
                    <td className="px-4 py-3">{d.evento}</td>
                    <td className="px-4 py-3">{d.area}</td>
                    <td className="px-4 py-3">{d.vendedor}</td>
                    <td className="px-4 py-3">{d.codigo}</td>
                    <td className="px-4 py-3">{d.descripcion}</td>

                    <td className="px-4 py-3 text-right">
                      {number(d.cantidad)}
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        d.total < 0
                          ? "text-rose-600"
                          : ""
                      }`}
                    >
                      {money(d.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

function Kpi({
  title,
  value,
  change,
  inverse = false,
}: {
  title: string;
  value: string;
  change: number;
  inverse?: boolean;
}) {
  const rising = change > 0;
  const falling = change < 0;

  const favorable =
    inverse ? falling : rising;

  let changeClass = "text-slate-500";

  if (change !== 0) {
    changeClass = favorable
      ? "text-emerald-600"
      : "text-rose-600";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">
        {title}
      </div>

      <div className="mt-2 text-3xl font-semibold">
        {value}
      </div>

      <div
        className={`mt-2 text-sm font-medium ${changeClass}`}
      >
        {rising
          ? "▲"
          : falling
            ? "▼"
            : "—"}{" "}
        {Math.abs(change).toFixed(1)}%

        <span className="ml-1 font-normal text-slate-400">
          vs periodo anterior
        </span>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500">
        {label}
      </label>

      <input
        type="date"
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CompactMultiSelect({
  title,
  options,
  selected,
  setSelected,
}: {
  title: string;
  options: string[];
  selected: string[];
  setSelected: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      setSelected(
        selected.filter(
          (item) => item !== value,
        ),
      );
    } else {
      setSelected([...selected, value]);
    }
  };

  return (
    <div className="relative">
      <label className="text-xs font-medium text-slate-500">
        {title}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <span className="truncate">
          {selected.length === 0
            ? "Todos"
            : selected.length === 1
              ? selected[0]
              : `${selected.length} seleccionados`}
        </span>

        <span className="ml-2 text-slate-400">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 max-h-64 w-full min-w-[240px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
              />

              <span>{option}</span>
            </label>
          ))}

          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelected([]);
                setOpen(false);
              }}
              className="mt-2 w-full border-t border-slate-100 pt-2 text-left text-xs text-indigo-600"
            >
              Limpiar selección
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveFilters({
  groups,
  clearAll,
}: {
  groups: {
    label: string;
    values: string[];
    clear: (value: string) => void;
  }[];
  clearAll: () => void;
}) {
  const filters =
    groups.flatMap((group) =>
      group.values.map((value) => ({
        group: group.label,
        value,
        clear: () => group.clear(value),
      })),
    );

  if (filters.length === 0) {
    return null;
  }

  const visible = filters.slice(0, 5);

  const remaining = Math.max(
    0,
    filters.length - visible.length,
  );

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
      <span className="text-xs font-medium text-slate-500">
        Filtros activos:
      </span>

      {visible.map((filter) => (
        <button
          key={`${filter.group}-${filter.value}`}
          type="button"
          onClick={filter.clear}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
        >
          {filter.group}: {filter.value} ×
        </button>
      ))}

      {remaining > 0 && (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
          +{remaining} más
        </span>
      )}

      <button
        type="button"
        onClick={clearAll}
        className="ml-auto text-xs text-indigo-600 hover:underline"
      >
        Limpiar todos
      </button>
    </div>
  );
}

function ConsumptionLineChart({
  data,
  granularity,
}: {
  data: {
    keys: string[];
    series: {
      area: string;
      values: {
        key: string;
        value: number;
      }[];
    }[];
  };
  granularity: "day" | "month";
}) {
  const width = 1100;
  const height = 410;

  const padding = {
    left: 80,
    right: 35,
    top: 60,
    bottom: 65,
  };

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const rawValues = data.series.flatMap(
    (series) =>
      series.values.map(
        (point) => point.value,
      ),
  );

  const rawMax = Math.max(0, ...rawValues);
  const rawMin = Math.min(0, ...rawValues);

  const hasNegative =
    rawValues.some((value) => value < 0);

  const hasPositive =
    rawValues.some((value) => value > 0);

  let axisMin = hasNegative
    ? rawMin
    : 0;

  let axisMax = hasPositive
    ? rawMax
    : 1;

  if (axisMax === axisMin) {
    axisMax = axisMin + 1;
  }

  const axisRange =
    axisMax - axisMin;

  if (hasNegative) {
    axisMin -=
      axisRange * 0.08;
  }

  if (hasPositive) {
    axisMax +=
      axisRange * 0.08;
  }

  if (!hasNegative) {
    axisMin = 0;
  }

  const finalRange =
    axisMax - axisMin || 1;

  const palette = [
    "#0f172a",
    "#4f46e5",
    "#0891b2",
    "#059669",
    "#d97706",
    "#dc2626",
    "#7c3aed",
    "#475569",
    "#be185d",
  ];

  const xFor = (
    index: number,
  ) => {
    if (data.keys.length <= 1) {
      return (
        padding.left +
        chartWidth / 2
      );
    }

    return (
      padding.left +
      (index /
        (data.keys.length - 1)) *
        chartWidth
    );
  };

  const yFor = (
    value: number,
  ) => {
    return (
      padding.top +
      chartHeight -
      ((value - axisMin) /
        finalRange) *
        chartHeight
    );
  };

  const zeroY = yFor(0);

  const gridSteps = 5;

  const gridValues =
    Array.from(
      {
        length:
          gridSteps,
      },
      (_, index) => {
        const ratio =
          index /
          (gridSteps - 1);

        return (
          axisMin +
          ratio *
            finalRange
        );
      },
    );

  const labelFor = (
    key: string,
  ) => {
    if (
      granularity ===
      "month"
    ) {
      const [
        year,
        month,
      ] = key.split("-");

      return new Intl.DateTimeFormat(
        "es-MX",
        {
          month: "short",
          year: "2-digit",
        },
      ).format(
        new Date(
          Number(year),
          Number(month) - 1,
          1,
        ),
      );
    }

    return new Intl.DateTimeFormat(
      "es-MX",
      {
        day: "2-digit",
        month: "short",
      },
    ).format(
      new Date(
        `${key}T00:00:00`,
      ),
    );
  };

  type ChartPoint = {
    area: string;
    areaIndex: number;
    pointIndex: number;
    key: string;
    value: number;
    x: number;
    y: number;
  };

  type AnnotationBox = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  const allPoints: ChartPoint[] =
    data.series.flatMap(
      (
        series,
        areaIndex,
      ) =>
        series.values.map(
          (
            point,
            pointIndex,
          ) => ({
            area: series.area,
            areaIndex,
            pointIndex,
            key: point.key,
            value: point.value,
            x: xFor(pointIndex),
            y: yFor(point.value),
          }),
        ),
    );

  const nonZeroPoints =
    allPoints.filter(
      (point) =>
        point.value !== 0,
    );

  const peakPoint =
    nonZeroPoints.length > 0
      ? nonZeroPoints.reduce(
          (
            max,
            point,
          ) =>
            point.value >
            max.value
              ? point
              : max,
        )
      : null;

  const averageValue =
    nonZeroPoints.length > 0
      ? nonZeroPoints.reduce(
          (
            sum,
            point,
          ) =>
            sum +
            point.value,
          0,
        ) /
        nonZeroPoints.length
      : 0;

  const averageCandidates =
    peakPoint &&
    nonZeroPoints.length > 1
      ? nonZeroPoints.filter(
          (point) =>
            !(
              point.area ===
                peakPoint.area &&
              point.key ===
                peakPoint.key
            ),
        )
      : nonZeroPoints;

  const averagePoint =
    averageCandidates.length > 0
      ? averageCandidates.reduce(
          (
            closest,
            point,
          ) =>
            Math.abs(
              point.value -
                averageValue,
            ) <
            Math.abs(
              closest.value -
                averageValue,
            )
              ? point
              : closest,
        )
      : null;

  const makeSmoothPath = (
    points: {
      x: number;
      y: number;
      value: number;
    }[],
  ) => {
    if (
      points.length === 0
    ) {
      return "";
    }

    if (
      points.length === 1
    ) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path =
      `M ${points[0].x} ${points[0].y}`;

    for (
      let i = 0;
      i <
      points.length - 1;
      i++
    ) {
      const p1 =
        points[i];

      const p2 =
        points[i + 1];

      const previous =
        i > 0
          ? points[i - 1]
          : p1;

      const next =
        i + 2 <
        points.length
          ? points[i + 2]
          : p2;

      const dx =
        p2.x - p1.x;

      const cp1x =
        p1.x +
        dx * 0.38;

      const cp2x =
        p2.x -
        dx * 0.38;

      const slope1 =
        (p2.y -
          previous.y) /
        Math.max(
          1,
          p2.x -
            previous.x,
        );

      const slope2 =
        (next.y -
          p1.y) /
        Math.max(
          1,
          next.x - p1.x,
        );

      let cp1y =
        p1.y +
        slope1 *
          (cp1x -
            p1.x);

      let cp2y =
        p2.y -
        slope2 *
          (p2.x -
            cp2x);

      const segmentMinY =
        Math.min(
          p1.y,
          p2.y,
        );

      const segmentMaxY =
        Math.max(
          p1.y,
          p2.y,
        );

      cp1y = Math.max(
        segmentMinY,
        Math.min(
          segmentMaxY,
          cp1y,
        ),
      );

      cp2y = Math.max(
        segmentMinY,
        Math.min(
          segmentMaxY,
          cp2y,
        ),
      );

      if (
        p1.value >= 0 &&
        p2.value >= 0
      ) {
        cp1y = Math.min(
          cp1y,
          zeroY,
        );

        cp2y = Math.min(
          cp2y,
          zeroY,
        );
      }

      if (
        p1.value <= 0 &&
        p2.value <= 0
      ) {
        cp1y = Math.max(
          cp1y,
          zeroY,
        );

        cp2y = Math.max(
          cp2y,
          zeroY,
        );
      }

      path +=
        ` C ${cp1x} ${cp1y},` +
        ` ${cp2x} ${cp2y},` +
        ` ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const annotationPosition = (
    point: ChartPoint,
    direction:
      | "above"
      | "below" = "above",
  ): AnnotationBox => {
    const boxWidth = 150;
    const boxHeight = 58;

    let x =
      point.x + 12;

    if (
      x + boxWidth >
      width - 10
    ) {
      x =
        point.x -
        boxWidth -
        12;
    }

    x = Math.max(
      10,
      x,
    );

    let y =
      direction === "above"
        ? point.y -
          boxHeight -
          18
        : point.y + 18;

    if (y < 8) {
      y =
        point.y +
        18;
    }

    if (
      y + boxHeight >
      height -
        padding.bottom
    ) {
      y =
        point.y -
        boxHeight -
        18;
    }

    return {
      x,
      y,
      width: boxWidth,
      height: boxHeight,
    };
  };

  const boxesOverlap = (
    a: AnnotationBox,
    b: AnnotationBox,
    margin = 8,
  ) => {
    return !(
      a.x + a.width + margin < b.x ||
      b.x + b.width + margin < a.x ||
      a.y + a.height + margin < b.y ||
      b.y + b.height + margin < a.y
    );
  };

  const moveBoxAway = (
    box: AnnotationBox,
    reference: AnnotationBox,
  ): AnnotationBox => {
    let moved = {
      ...box,
    };

    const canMoveUp =
      reference.y -
        box.height -
        14 >
      8;

    const canMoveDown =
      reference.y +
        reference.height +
        14 +
        box.height <
      height -
        padding.bottom;

    if (canMoveUp) {
      moved.y =
        reference.y -
        box.height -
        14;
    } else if (canMoveDown) {
      moved.y =
        reference.y +
        reference.height +
        14;
    } else {
      const moveLeft =
        reference.x -
        box.width -
        18;

      const moveRight =
        reference.x +
        reference.width +
        18;

      if (moveLeft > 8) {
        moved.x = moveLeft;
      } else if (
        moveRight +
          box.width <
        width - 8
      ) {
        moved.x = moveRight;
      }
    }

    moved.x = Math.max(
      8,
      Math.min(
        width -
          moved.width -
          8,
        moved.x,
      ),
    );

    moved.y = Math.max(
      8,
      Math.min(
        height -
          padding.bottom -
          moved.height,
        moved.y,
      ),
    );

    return moved;
  };

  if (
    data.keys.length === 0
  ) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Sin información para
        graficar.
      </div>
    );
  }

  let peakAnnotation =
    peakPoint
      ? annotationPosition(
          peakPoint,
          "above",
        )
      : null;

  let averageAnnotation =
    averagePoint
      ? annotationPosition(
          averagePoint,
          averagePoint.y <
            padding.top +
              chartHeight / 2
            ? "below"
            : "above",
        )
      : null;

  if (
    peakAnnotation &&
    averageAnnotation &&
    boxesOverlap(
      peakAnnotation,
      averageAnnotation,
      10,
    )
  ) {
    averageAnnotation =
      moveBoxAway(
        averageAnnotation,
        peakAnnotation,
      );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {data.series.map(
          (
            series,
            index,
          ) => (
            <div
              key={
                series.area
              }
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    palette[
                      index %
                        palette.length
                    ],
                }}
              />

              {series.area}
            </div>
          ),
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[850px] w-full"
          role="img"
          aria-label="Evolución del consumo por área"
        >
          {gridValues.map(
            (
              value,
              index,
            ) => {
              const y =
                yFor(value);

              return (
                <g
                  key={`${value}-${index}`}
                >
                  <line
                    x1={
                      padding.left
                    }
                    x2={
                      width -
                      padding.right
                    }
                    y1={y}
                    y2={y}
                    stroke={
                      Math.abs(
                        value,
                      ) <
                      finalRange *
                        0.001
                        ? "#94a3b8"
                        : "#e2e8f0"
                    }
                    strokeWidth={
                      Math.abs(
                        value,
                      ) <
                      finalRange *
                        0.001
                        ? "1.3"
                        : "1"
                    }
                  />

                  <text
                    x={
                      padding.left -
                      10
                    }
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#64748b"
                  >
                    {money(
                      value,
                    )}
                  </text>
                </g>
              );
            },
          )}

          {hasNegative &&
            zeroY >=
              padding.top &&
            zeroY <=
              padding.top +
                chartHeight && (
              <line
                x1={
                  padding.left
                }
                x2={
                  width -
                  padding.right
                }
                y1={zeroY}
                y2={zeroY}
                stroke="#64748b"
                strokeWidth="1.3"
              />
            )}

          {data.keys.map(
            (
              key,
              index,
            ) => (
              <text
                key={key}
                x={xFor(
                  index,
                )}
                y={
                  height -
                  25
                }
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {labelFor(
                  key,
                )}
              </text>
            ),
          )}

          {data.series.map(
            (
              series,
              seriesIndex,
            ) => {
              const color =
                palette[
                  seriesIndex %
                    palette.length
                ];

              const points =
                series.values.map(
                  (
                    point,
                    index,
                  ) => ({
                    x: xFor(
                      index,
                    ),
                    y: yFor(
                      point.value,
                    ),
                    value:
                      point.value,
                  }),
                );

              const path =
                makeSmoothPath(
                  points,
                );

              return (
                <g
                  key={
                    series.area
                  }
                >
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {series.values.map(
                    (
                      point,
                      index,
                    ) => (
                      <circle
                        key={`${series.area}-${point.key}`}
                        cx={xFor(
                          index,
                        )}
                        cy={yFor(
                          point.value,
                        )}
                        r="2.7"
                        fill={
                          color
                        }
                      />
                    ),
                  )}
                </g>
              );
            },
          )}

          {peakPoint &&
            peakAnnotation && (
              <g>
                <circle
                  cx={
                    peakPoint.x
                  }
                  cy={
                    peakPoint.y
                  }
                  r="7"
                  fill={
                    palette[
                      peakPoint.areaIndex %
                        palette.length
                    ]
                  }
                  opacity="0.14"
                />

                <circle
                  cx={
                    peakPoint.x
                  }
                  cy={
                    peakPoint.y
                  }
                  r="4"
                  fill={
                    palette[
                      peakPoint.areaIndex %
                        palette.length
                    ]
                  }
                  stroke="white"
                  strokeWidth="1.5"
                />

                <line
                  x1={
                    peakPoint.x
                  }
                  y1={
                    peakPoint.y -
                    5
                  }
                  x2={
                    peakAnnotation.x +
                    12
                  }
                  y2={
                    peakAnnotation.y +
                    peakAnnotation.height
                  }
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                <rect
                  x={
                    peakAnnotation.x
                  }
                  y={
                    peakAnnotation.y
                  }
                  width={
                    peakAnnotation.width
                  }
                  height={
                    peakAnnotation.height
                  }
                  rx="8"
                  fill="rgba(255,255,255,0.84)"
                  stroke="#cbd5e1"
                />

                <circle
                  cx={
                    peakAnnotation.x +
                    12
                  }
                  cy={
                    peakAnnotation.y +
                    14
                  }
                  r="4"
                  fill={
                    palette[
                      peakPoint.areaIndex %
                        palette.length
                    ]
                  }
                />

                <text
                  x={
                    peakAnnotation.x +
                    22
                  }
                  y={
                    peakAnnotation.y +
                    17
                  }
                  fontSize="11"
                  fontWeight="600"
                  fill="#0f172a"
                >
                  Punto más alto
                </text>

                <text
                  x={
                    peakAnnotation.x +
                    12
                  }
                  y={
                    peakAnnotation.y +
                    34
                  }
                  fontSize="10"
                  fill="#475569"
                >
                  {peakPoint.area}
                </text>

                <text
                  x={
                    peakAnnotation.x +
                    12
                  }
                  y={
                    peakAnnotation.y +
                    49
                  }
                  fontSize="10"
                  fill="#475569"
                >
                  {labelFor(
                    peakPoint.key,
                  )}{" "}
                  ·{" "}
                  {money(
                    peakPoint.value,
                  )}
                </text>
              </g>
            )}

          {averagePoint &&
            averageAnnotation && (
              <g>
                <circle
                  cx={
                    averagePoint.x
                  }
                  cy={
                    averagePoint.y
                  }
                  r="4"
                  fill={
                    palette[
                      averagePoint.areaIndex %
                        palette.length
                    ]
                  }
                  stroke="white"
                  strokeWidth="1.5"
                />

                <line
                  x1={
                    averagePoint.x
                  }
                  y1={
                    averagePoint.y -
                    4
                  }
                  x2={
                    averageAnnotation.x +
                    12
                  }
                  y2={
                    averageAnnotation.y +
                    averageAnnotation.height
                  }
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                <rect
                  x={
                    averageAnnotation.x
                  }
                  y={
                    averageAnnotation.y
                  }
                  width={
                    averageAnnotation.width
                  }
                  height={
                    averageAnnotation.height
                  }
                  rx="8"
                  fill="rgba(255,255,255,0.84)"
                  stroke="#cbd5e1"
                />

                <circle
                  cx={
                    averageAnnotation.x +
                    12
                  }
                  cy={
                    averageAnnotation.y +
                    14
                  }
                  r="4"
                  fill={
                    palette[
                      averagePoint.areaIndex %
                        palette.length
                    ]
                  }
                />

                <text
                  x={
                    averageAnnotation.x +
                    22
                  }
                  y={
                    averageAnnotation.y +
                    17
                  }
                  fontSize="11"
                  fontWeight="600"
                  fill="#0f172a"
                >
                  Referencia promedio
                </text>

                <text
                  x={
                    averageAnnotation.x +
                    12
                  }
                  y={
                    averageAnnotation.y +
                    34
                  }
                  fontSize="10"
                  fill="#475569"
                >
                  {averagePoint.area}
                </text>

                <text
                  x={
                    averageAnnotation.x +
                    12
                  }
                  y={
                    averageAnnotation.y +
                    49
                  }
                  fontSize="10"
                  fill="#475569"
                >
                  Cerca de{" "}
                  {money(
                    averageValue,
                  )}
                </text>
              </g>
            )}
        </svg>
      </div>
    </div>
  );
}