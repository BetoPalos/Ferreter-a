"use client";

import { useMemo, useState } from "react";

type Recommendation = "Mover" | "Mover parcial" | "Mantener";
type UsageFilter = "Sin uso" | "Uso ≤ 20%" | "Uso > 20%";

const rawData = [
  {
    area: "Mesas",
    product: "Mesa Nona Mosaico Terracota",
    available: 48,
    repair: 4,
    peak: 12,
    price: 3200,
    eventDate: "2026-10-18",
  },
  {
    area: "Mesas",
    product: "Mesa Modelo T",
    available: 34,
    repair: 2,
    peak: 4,
    price: 2500,
    eventDate: "2026-10-17",
  },
  {
    area: "Iluminación",
    product: "Mantis Infinite Triangular",
    available: 18,
    repair: 2,
    peak: 6,
    price: 1800,
    eventDate: "2026-12-11",
  },
  {
    area: "Iluminación",
    product: "Mantis Round",
    available: 24,
    repair: 1,
    peak: 4,
    price: 1700,
    eventDate: "2026-12-11",
  },
  {
    area: "Iluminación",
    product: "Jolt Bar IP",
    available: 16,
    repair: 2,
    peak: 8,
    price: 1450,
    eventDate: "2026-12-11",
  },
  {
    area: "Iluminación",
    product: "Blade Zoom",
    available: 20,
    repair: 3,
    peak: 2,
    price: 1550,
    eventDate: "2026-12-11",
  },
  {
    area: "Mantelería",
    product: "Mantel Natural Rayas Beige Óvalo",
    available: 70,
    repair: 5,
    peak: 0,
    price: 1330,
    eventDate: null,
  },
  {
    area: "Mantelería",
    product: "Mantel Natural Raya Verde Olivo",
    available: 62,
    repair: 3,
    peak: 8,
    price: 1330,
    eventDate: "2026-11-22",
  },
  {
    area: "Estructuras",
    product: "Pérgola de Truss 3×3×3",
    available: 8,
    repair: 1,
    peak: 0,
    price: 7500,
    eventDate: null,
  },
  {
    area: "Estructuras",
    product: "Mampara Curva Los Hilos",
    available: 6,
    repair: 0,
    peak: 2,
    price: 18000,
    eventDate: "2026-09-28",
  },
  {
    area: "Accesorios",
    product: "Lámpara de Barro Ziba",
    available: 40,
    repair: 5,
    peak: 6,
    price: 650,
    eventDate: "2026-10-04",
  },
  {
    area: "Ferretería",
    product: "Malla Sombra ACDS 20×10",
    available: 12,
    repair: 1,
    peak: 0,
    price: 5500,
    eventDate: null,
  },
  {
    area: "Sillas",
    product: "Silla Crossback Natural",
    available: 180,
    repair: 12,
    peak: 42,
    price: 850,
    eventDate: "2026-11-08",
  },
  {
    area: "Sillas",
    product: "Silla Avant Garde Negra",
    available: 120,
    repair: 8,
    peak: 18,
    price: 950,
    eventDate: "2026-09-15",
  },
  {
    area: "Salas",
    product: "Sala Modular Arena",
    available: 24,
    repair: 2,
    peak: 4,
    price: 4200,
    eventDate: "2026-10-30",
  },
  {
    area: "Salas",
    product: "Sillón Curvo Natural",
    available: 18,
    repair: 1,
    peak: 0,
    price: 3800,
    eventDate: null,
  },
];

function calculateRow(
  item: (typeof rawData)[number],
  analysisDate: string,
) {
  const total = item.available + item.repair;

  const isWithinAnalysis =
    item.eventDate !== null && item.eventDate <= analysisDate;

  const effectivePeak = isWithinAnalysis ? item.peak : 0;
  const keep20 = Math.ceil(total * 0.2);
  const minKeep = Math.max(keep20, effectivePeak);
  const movable = Math.max(0, total - minKeep);
  const useRatio = total ? effectivePeak / total : 0;

  let recommendation: Recommendation;

  if (effectivePeak === 0) {
    recommendation = "Mover";
  } else if (useRatio <= 0.2) {
    recommendation = "Mover parcial";
  } else {
    recommendation = "Mantener";
  }

  return {
    ...item,
    total,
    keep20,
    peak: effectivePeak,
    minKeep,
    movable,
    useRatio,
    recommendation,
  };
}

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

export default function InventoryDashboard() {
  const [analysisDate, setAnalysisDate] = useState("2026-12-31");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<
    Recommendation[]
  >([]);
  const [selectedUsage, setSelectedUsage] = useState<UsageFilter[]>([]);
  const [search, setSearch] = useState("");

  const processedData = useMemo(
    () => rawData.map((item) => calculateRow(item, analysisDate)),
    [analysisDate],
  );

  const areas = [...new Set(processedData.map((d) => d.area))].sort();

  const rows = useMemo(() => {
    return processedData
      .filter((d) => {
        const areaOk =
          selectedAreas.length === 0 || selectedAreas.includes(d.area);

        const statusOk =
          selectedStatuses.length === 0 ||
          selectedStatuses.includes(d.recommendation);

        const usageLabels: UsageFilter[] = [];

        if (d.peak === 0) usageLabels.push("Sin uso");
        if (d.peak > 0 && d.useRatio <= 0.2) {
          usageLabels.push("Uso ≤ 20%");
        }
        if (d.useRatio > 0.2) usageLabels.push("Uso > 20%");

        const usageOk =
          selectedUsage.length === 0 ||
          selectedUsage.some((item) => usageLabels.includes(item));

        const searchOk =
          !search ||
          d.product.toLowerCase().includes(search.toLowerCase());

        return areaOk && statusOk && usageOk && searchOk;
      })
      .sort(
        (a, b) =>
          a.area.localeCompare(b.area) ||
          a.product.localeCompare(b.product),
      );
  }, [
    processedData,
    selectedAreas,
    selectedStatuses,
    selectedUsage,
    search,
  ]);

  const movableUnits = rows.reduce((sum, d) => sum + d.movable, 0);
  const unusedProducts = rows.filter((d) => d.peak === 0).length;
  const movableValue = rows.reduce(
    (sum, d) => sum + d.movable * d.price,
    0,
  );

  const recommendationTotals = ["Mover", "Mover parcial", "Mantener"].map(
    (name) => ({
      name,
      value: rows
        .filter((d) => d.recommendation === name)
        .reduce((sum, d) => sum + d.total, 0),
    }),
  );

  const maxRecommendation = Math.max(
    1,
    ...recommendationTotals.map((d) => d.value),
  );

  const demandTop = [...rows]
    .sort((a, b) => b.useRatio - a.useRatio)
    .slice(0, 6);

  const hasActiveFilters =
    selectedAreas.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedUsage.length > 0 ||
    search.trim() !== "";

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            Inventario Movible
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Inventario, demanda futura y capacidad potencial de traslado
            entre bodegas.
          </p>
        </div>

        <div className="text-right text-sm text-slate-500">
          <div>Datos actualizados</div>
          <div className="font-medium text-slate-800">
            19 ago 2026 · 12:46
          </div>
        </div>
      </div>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid items-end gap-3 lg:grid-cols-5">
          <div>
            <label className="text-xs font-medium text-slate-500">
              Analizar demanda hasta
            </label>

            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={analysisDate}
              onChange={(e) => setAnalysisDate(e.target.value)}
            />
          </div>

          <CompactMultiSelect
            title="Área"
            options={areas}
            selected={selectedAreas}
            setSelected={setSelectedAreas}
          />

          <CompactMultiSelect
            title="Clasificación"
            options={["Mover", "Mover parcial", "Mantener"]}
            selected={selectedStatuses}
            setSelected={(values) =>
              setSelectedStatuses(values as Recommendation[])
            }
          />

          <CompactMultiSelect
            title="Uso futuro"
            options={["Sin uso", "Uso ≤ 20%", "Uso > 20%"]}
            selected={selectedUsage}
            setSelected={(values) =>
              setSelectedUsage(values as UsageFilter[])
            }
          />

          <div>
            <label className="text-xs font-medium text-slate-500">
              Buscar producto
            </label>

            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Mesa, silla, sala..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <ActiveFilters
            areas={selectedAreas}
            statuses={selectedStatuses}
            usage={selectedUsage}
            search={search}
            clearArea={(value) =>
              setSelectedAreas(
                selectedAreas.filter((item) => item !== value),
              )
            }
            clearStatus={(value) =>
              setSelectedStatuses(
                selectedStatuses.filter((item) => item !== value),
              )
            }
            clearUsage={(value) =>
              setSelectedUsage(
                selectedUsage.filter((item) => item !== value),
              )
            }
            clearSearch={() => setSearch("")}
            clearAll={() => {
              setSelectedAreas([]);
              setSelectedStatuses([]);
              setSelectedUsage([]);
              setSearch("");
            }}
          />
        )}
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          title="Productos analizados"
          value={number(rows.length)}
        />

        <Metric
          title="Unidades movibles"
          value={number(movableUnits)}
          subtitle="sin comprometer demanda"
        />

        <Metric
          title="Sin uso futuro"
          value={number(unusedProducts)}
        />

        <Metric
          title="Valor potencial a mover"
          value={money(movableValue)}
        />
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">
              Inventario por recomendación
            </h3>

            <span className="text-sm text-slate-400">
              unidades
            </span>
          </div>

          <div className="space-y-5">
            {recommendationTotals.map((item) => {
              const width = `${
                (item.value / maxRecommendation) * 100
              }%`;

              return (
                <div key={item.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{item.name}</span>

                    <span className="font-medium">
                      {number(item.value)}
                    </span>
                  </div>

                  <div className="h-4 rounded-full bg-slate-100">
                    <div
                      className="h-4 rounded-full bg-slate-800"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">
              Demanda máxima vs inventario
            </h3>

            <span className="text-sm text-slate-400">
              hasta {analysisDate}
            </span>
          </div>

          <div className="space-y-4">
            {demandTop.map((d) => {
              const pct = Math.min(
                100,
                Math.round(d.useRatio * 100),
              );

              return (
                <div key={d.product}>
                  <div className="mb-1 flex justify-between gap-4 text-sm">
                    <span className="truncate">{d.product}</span>
                    <span className="font-medium">{pct}%</span>
                  </div>

                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Pico {d.peak} de {d.total} unidades
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <h3 className="font-semibold">
          Criterio ejecutivo
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          El análisis considera únicamente la demanda existente hasta la
          fecha seleccionada. Un producto es candidato a mover cuando el
          inventario que permanece cubre el máximo uso simultáneo esperado.
          También se identifica cuándo basta conservar el 20% del
          inventario total.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h3 className="font-semibold">
              Detalle por producto
            </h3>

            <div className="mt-1 text-xs text-slate-400">
              Análisis hasta {analysisDate}
            </div>
          </div>

          <span className="text-sm text-slate-400">
            {rows.length} productos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {[
                  "Área",
                  "Producto",
                  "Disponible",
                  "Reparación",
                  "Total",
                  "20%",
                  "Pico demanda",
                  "Mover",
                  "Recomendación",
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
              {rows.map((d) => (
                <tr
                  key={d.product}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-3">
                    {d.area}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {d.product}
                  </td>

                  <td className="px-4 py-3">
                    {d.available}
                  </td>

                  <td className="px-4 py-3">
                    {d.repair}
                  </td>

                  <td className="px-4 py-3">
                    {d.total}
                  </td>

                  <td className="px-4 py-3">
                    {d.keep20}
                  </td>

                  <td className="px-4 py-3">
                    {d.peak}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {d.movable}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                      {d.recommendation}
                    </span>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No hay productos con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function Metric({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">
        {title}
      </div>

      <div className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </div>

      {subtitle && (
        <div className="mt-1 text-xs text-slate-400">
          {subtitle}
        </div>
      )}
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
        selected.filter((item) => item !== value),
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
  areas,
  statuses,
  usage,
  search,
  clearArea,
  clearStatus,
  clearUsage,
  clearSearch,
  clearAll,
}: {
  areas: string[];
  statuses: string[];
  usage: string[];
  search: string;
  clearArea: (value: string) => void;
  clearStatus: (value: string) => void;
  clearUsage: (value: string) => void;
  clearSearch: () => void;
  clearAll: () => void;
}) {
  const filters = [
    ...areas.map((value) => ({
      group: "Área",
      value,
      clear: () => clearArea(value),
    })),

    ...statuses.map((value) => ({
      group: "Clasificación",
      value,
      clear: () => clearStatus(value),
    })),

    ...usage.map((value) => ({
      group: "Uso",
      value,
      clear: () => clearUsage(value),
    })),

    ...(search.trim()
      ? [
          {
            group: "Búsqueda",
            value: search.trim(),
            clear: clearSearch,
          },
        ]
      : []),
  ];

  const visible = filters.slice(0, 5);
  const remaining = Math.max(0, filters.length - visible.length);

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
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
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