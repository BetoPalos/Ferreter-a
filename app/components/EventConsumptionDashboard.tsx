"use client";

import { useMemo, useState } from "react";

type MetricMode = "amount" | "quantity" | "percentage";
type SortMode = "date" | "total" | "name";

type Consumption = {
  fechaEvento: string;
  evento: string;
  vendedor: string;
  area: string;
  material: string;
  cantidad: number;
  total: number;
};

const demoData: Consumption[] = [
  {
    fechaEvento: "2026-08-02",
    evento: "BODA SOFIA + DANIEL",
    vendedor: "JESUS S",
    area: "ESTRUCTURAS",
    material: "TORNILLERÍA Y FIJACIÓN",
    cantidad: 14,
    total: 3120,
  },
  {
    fechaEvento: "2026-08-02",
    evento: "BODA SOFIA + DANIEL",
    vendedor: "JESUS S",
    area: "SILLAS",
    material: "CINTA TRANSPARENTE",
    cantidad: 7,
    total: 620,
  },
  {
    fechaEvento: "2026-08-05",
    evento: "BODA ANA + CARLOS",
    vendedor: "HUMBERTO",
    area: "MESAS",
    material: "LIJA P/AGUA #220",
    cantidad: 8,
    total: 420,
  },
  {
    fechaEvento: "2026-08-05",
    evento: "BODA ANA + CARLOS",
    vendedor: "HUMBERTO",
    area: "CARPINTERIA",
    material: "THINNER",
    cantidad: 11,
    total: 1480,
  },
  {
    fechaEvento: "2026-08-08",
    evento: "CORPORATIVO NOVA",
    vendedor: "ARMANDO",
    area: "ACCESORIOS",
    material: "BROCHA GRANDE 4",
    cantidad: 6,
    total: 920,
  },
  {
    fechaEvento: "2026-08-08",
    evento: "CORPORATIVO NOVA",
    vendedor: "ARMANDO",
    area: "CARGAS",
    material: "CINTA CANELA",
    cantidad: 18,
    total: 1360,
  },
  {
    fechaEvento: "2026-08-08",
    evento: "CORPORATIVO NOVA",
    vendedor: "ARMANDO",
    area: "ESTRUCTURAS",
    material: "TAQUETES Y TORNILLOS",
    cantidad: 28,
    total: 5620,
  },
  {
    fechaEvento: "2026-08-12",
    evento: "BODA MARIA + ANDRES",
    vendedor: "JESUS S",
    area: "ACCESORIOS",
    material: "CINTA TRANSPARENTE",
    cantidad: 9,
    total: 1166.06,
  },
  {
    fechaEvento: "2026-08-12",
    evento: "BODA MARIA + ANDRES",
    vendedor: "JESUS S",
    area: "CARGAS",
    material: "EMPLAYE",
    cantidad: 2,
    total: 50,
  },
  {
    fechaEvento: "2026-08-12",
    evento: "BODA MARIA + ANDRES",
    vendedor: "JESUS S",
    area: "ESTRUCTURAS",
    material: "FERRETERÍA ESTRUCTURAL",
    cantidad: 31,
    total: 8201.51,
  },
  {
    fechaEvento: "2026-08-12",
    evento: "BODA MARIA + ANDRES",
    vendedor: "JESUS S",
    area: "SILLAS",
    material: "CONSUMIBLES MONTAJE",
    cantidad: 12,
    total: 2155.06,
  },
  {
    fechaEvento: "2026-08-12",
    evento: "BODA MARIA + ANDRES",
    vendedor: "JESUS S",
    area: "STAFF",
    material: "CONSUMIBLES STAFF",
    cantidad: 15,
    total: 2565.09,
  },
  {
    fechaEvento: "2026-08-16",
    evento: "BODA LUCIA + CRISTOBAL",
    vendedor: "HUMBERTO",
    area: "ACCESORIOS",
    material: "BROCHAS",
    cantidad: 9,
    total: 1019.15,
  },
  {
    fechaEvento: "2026-08-16",
    evento: "BODA LUCIA + CRISTOBAL",
    vendedor: "HUMBERTO",
    area: "MESAS",
    material: "LIJAS Y THINNER",
    cantidad: 20,
    total: 4912.09,
  },
];

const ALL_AREAS = [
  "ACCESORIOS",
  "CARGAS",
  "CARPINTERIA",
  "ESTRUCTURAS",
  "MESAS",
  "MULATTA",
  "SALAS",
  "SILLAS",
  "STAFF",
];

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 1,
  }).format(value);
}

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

export default function EventConsumptionDashboard() {
  const [dateFrom, setDateFrom] = useState("2026-08-01");
  const [dateTo, setDateTo] = useState("2026-08-31");

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const [metric, setMetric] = useState<MetricMode>("amount");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const eventOptions = unique(demoData.map((d) => d.evento));
  const vendorOptions = unique(demoData.map((d) => d.vendedor));

  const filtered = useMemo(() => {
    return demoData.filter((d) => {
      return (
        d.fechaEvento >= dateFrom &&
        d.fechaEvento <= dateTo &&
        (selectedAreas.length === 0 ||
          selectedAreas.includes(d.area)) &&
        (selectedEvents.length === 0 ||
          selectedEvents.includes(d.evento)) &&
        (selectedVendors.length === 0 ||
          selectedVendors.includes(d.vendedor))
      );
    });
  }, [
    dateFrom,
    dateTo,
    selectedAreas,
    selectedEvents,
    selectedVendors,
  ]);

  const eventRows = useMemo(() => {
    const map = new Map<
      string,
      {
        evento: string;
        fecha: string;
        vendedor: string;
        total: number;
        quantity: number;
        byArea: Record<
          string,
          { amount: number; quantity: number }
        >;
      }
    >();

    filtered.forEach((row) => {
      const key = `${row.fechaEvento}|${row.evento}`;

      if (!map.has(key)) {
        map.set(key, {
          evento: row.evento,
          fecha: row.fechaEvento,
          vendedor: row.vendedor,
          total: 0,
          quantity: 0,
          byArea: {},
        });
      }

      const item = map.get(key)!;

      item.total += row.total;
      item.quantity += row.cantidad;

      if (!item.byArea[row.area]) {
        item.byArea[row.area] = {
          amount: 0,
          quantity: 0,
        };
      }

      item.byArea[row.area].amount += row.total;
      item.byArea[row.area].quantity += row.cantidad;
    });

    let rows = [...map.values()];

    if (sortMode === "date") {
      rows.sort(
        (a, b) =>
          a.fecha.localeCompare(b.fecha) ||
          a.evento.localeCompare(b.evento),
      );
    }

    if (sortMode === "total") {
      rows.sort((a, b) => b.total - a.total);
    }

    if (sortMode === "name") {
      rows.sort((a, b) => a.evento.localeCompare(b.evento));
    }

    return rows;
  }, [filtered, sortMode]);

  const visibleAreas =
    selectedAreas.length > 0
      ? ALL_AREAS.filter((area) => selectedAreas.includes(area))
      : ALL_AREAS;

  const totalSpend = filtered.reduce((sum, d) => sum + d.total, 0);

  const totalQuantity = filtered.reduce(
    (sum, d) => sum + d.cantidad,
    0,
  );

  const eventCount = eventRows.length;

  const averageEvent =
    eventCount > 0 ? totalSpend / eventCount : 0;

  const largestEvent = [...eventRows].sort(
    (a, b) => b.total - a.total,
  )[0];

  const areaTotals = visibleAreas.map((area) => ({
    area,
    amount: filtered
      .filter((d) => d.area === area)
      .reduce((sum, d) => sum + d.total, 0),
    quantity: filtered
      .filter((d) => d.area === area)
      .reduce((sum, d) => sum + d.cantidad, 0),
  }));

  const largestArea = [...areaTotals].sort(
    (a, b) => b.amount - a.amount,
  )[0];

  const allCellValues = eventRows.flatMap((row) =>
    visibleAreas.map((area) => {
      const values = row.byArea[area];

      if (!values) return 0;

      if (metric === "amount") {
        return values.amount;
      }

      if (metric === "quantity") {
        return values.quantity;
      }

      return row.total
        ? (values.amount / row.total) * 100
        : 0;
    }),
  );

  const maxCellValue = Math.max(1, ...allCellValues);

  const getValue = (
    row: (typeof eventRows)[number],
    area: string,
  ) => {
    const values = row.byArea[area];

    if (!values) return 0;

    if (metric === "amount") {
      return values.amount;
    }

    if (metric === "quantity") {
      return values.quantity;
    }

    return row.total
      ? (values.amount / row.total) * 100
      : 0;
  };

  const formatMetric = (value: number) => {
    if (metric === "amount") {
      return money(value);
    }

    if (metric === "quantity") {
      return number(value);
    }

    return `${value.toFixed(1)}%`;
  };

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            Consumo por Evento
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Matriz ejecutiva de consumo de ferretería por evento y área.
          </p>
        </div>

        <div className="text-right text-sm text-slate-500">
          <div>Datos actualizados</div>
          <div className="font-medium text-slate-800">
            19 ago 2026 · 13:22
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
            options={ALL_AREAS}
            selected={selectedAreas}
            setSelected={setSelectedAreas}
          />

          <CompactMultiSelect
            title="Evento"
            options={eventOptions}
            selected={selectedEvents}
            setSelected={setSelectedEvents}
          />

          <CompactMultiSelect
            title="Vendedor"
            options={vendorOptions}
            selected={selectedVendors}
            setSelected={setSelectedVendors}
          />

          <div>
            <label className="text-xs font-medium text-slate-500">
              Ordenar por
            </label>

            <select
              value={sortMode}
              onChange={(e) =>
                setSortMode(e.target.value as SortMode)
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="date">
                Fecha
              </option>

              <option value="total">
                Mayor consumo
              </option>

              <option value="name">
                Nombre del evento
              </option>
            </select>
          </div>
        </div>

        <ActiveFilters
          groups={[
            {
              label: "Área",
              values: selectedAreas,
              clear: (value) =>
                setSelectedAreas(
                  selectedAreas.filter(
                    (item) => item !== value,
                  ),
                ),
            },
            {
              label: "Evento",
              values: selectedEvents,
              clear: (value) =>
                setSelectedEvents(
                  selectedEvents.filter(
                    (item) => item !== value,
                  ),
                ),
            },
            {
              label: "Vendedor",
              values: selectedVendors,
              clear: (value) =>
                setSelectedVendors(
                  selectedVendors.filter(
                    (item) => item !== value,
                  ),
                ),
            },
          ]}
          clearAll={() => {
            setSelectedAreas([]);
            setSelectedEvents([]);
            setSelectedVendors([]);
          }}
        />
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          title="Consumo del periodo"
          value={money(totalSpend)}
        />

        <Kpi
          title="Promedio por evento"
          value={money(averageEvent)}
        />

        <Kpi
          title="Evento con mayor consumo"
          value={
            largestEvent
              ? money(largestEvent.total)
              : "$0"
          }
          subtitle={largestEvent?.evento}
        />

        <Kpi
          title="Área con mayor consumo"
          value={
            largestArea
              ? money(largestArea.amount)
              : "$0"
          }
          subtitle={largestArea?.area}
        />
      </section>

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <div className="text-sm font-semibold">
            Vista de la matriz
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Cambia la métrica sin modificar los filtros.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetricButton
            active={metric === "amount"}
            onClick={() => setMetric("amount")}
          >
            $ Consumo
          </MetricButton>

          <MetricButton
            active={metric === "quantity"}
            onClick={() => setMetric("quantity")}
          >
            Cantidad
          </MetricButton>

          <MetricButton
            active={metric === "percentage"}
            onClick={() => setMetric("percentage")}
          >
            % del evento
          </MetricButton>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                Matriz de consumo por evento
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Haz clic en un evento para revisar el detalle de materiales.
              </p>
            </div>

            <div className="text-sm text-slate-400">
              {eventCount} eventos
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-max text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 font-medium">
                  Fecha
                </th>

                <th className="min-w-[260px] px-4 py-3 font-medium">
                  Evento
                </th>

                {visibleAreas.map((area) => (
                  <th
                    key={area}
                    className="min-w-[130px] whitespace-nowrap px-4 py-3 text-right font-medium"
                  >
                    {area}
                  </th>
                ))}

                <th className="min-w-[150px] bg-slate-100 px-4 py-3 text-right font-semibold">
                  Total
                </th>

                <th className="min-w-[140px] bg-slate-100 px-4 py-3 text-right font-semibold">
                  vs promedio
                </th>
              </tr>
            </thead>

            <tbody>
              {eventRows.map((row) => {
                const deviation = averageEvent
                  ? ((row.total - averageEvent) /
                      averageEvent) *
                    100
                  : 0;

                const rowId =
                  `${row.fecha}|${row.evento}`;

                const expanded =
                  expandedEvent === rowId;

                const detail = filtered.filter(
                  (d) =>
                    d.evento === row.evento &&
                    d.fechaEvento === row.fecha,
                );

                return (
                  <>
                    <tr
                      key={rowId}
                      onClick={() =>
                        setExpandedEvent(
                          expanded
                            ? null
                            : rowId,
                        )
                      }
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {row.fecha}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span>
                            {expanded ? "−" : "+"}
                          </span>

                          <span>
                            {row.evento}
                          </span>
                        </div>
                      </td>

                      {visibleAreas.map((area) => {
                        const value =
                          getValue(row, area);

                        const intensity =
                          maxCellValue > 0
                            ? value / maxCellValue
                            : 0;

                        return (
                          <td
                            key={area}
                            className="px-4 py-3 text-right"
                            style={{
                              backgroundColor:
                                value > 0
                                  ? `rgba(15, 23, 42, ${
                                      0.04 +
                                      intensity *
                                        0.16
                                    })`
                                  : undefined,
                            }}
                          >
                            {value
                              ? formatMetric(value)
                              : "—"}
                          </td>
                        );
                      })}

                      <td className="bg-slate-50 px-4 py-3 text-right font-semibold">
                        {metric === "amount"
                          ? money(row.total)
                          : metric ===
                              "quantity"
                            ? number(
                                row.quantity,
                              )
                            : "100%"}
                      </td>

                      <td
                        className={`bg-slate-50 px-4 py-3 text-right font-medium ${
                          deviation > 0
                            ? "text-rose-600"
                            : deviation < 0
                              ? "text-emerald-600"
                              : "text-slate-500"
                        }`}
                      >
                        {deviation > 0
                          ? "+"
                          : ""}
                        {deviation.toFixed(1)}%
                      </td>
                    </tr>

                    {expanded && (
                      <tr key={`${rowId}-detail`}>
                        <td
                          colSpan={
                            visibleAreas.length +
                            4
                          }
                          className="bg-slate-50 px-6 py-5"
                        >
                          <EventDetail
                            rows={detail}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {eventRows.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      visibleAreas.length + 4
                    }
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No hay eventos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100">
                <td className="px-4 py-3" />

                <td className="px-4 py-3 font-semibold">
                  Total por área
                </td>

                {visibleAreas.map((area) => {
                  const item =
                    areaTotals.find(
                      (d) => d.area === area,
                    );

                  const value =
                    metric === "amount"
                      ? item?.amount || 0
                      : metric === "quantity"
                        ? item?.quantity || 0
                        : totalSpend
                          ? ((item?.amount ||
                              0) /
                              totalSpend) *
                            100
                          : 0;

                  return (
                    <td
                      key={area}
                      className="px-4 py-3 text-right font-semibold"
                    >
                      {formatMetric(value)}
                    </td>
                  );
                })}

                <td className="bg-slate-200 px-4 py-3 text-right font-bold">
                  {metric === "amount"
                    ? money(totalSpend)
                    : metric ===
                        "quantity"
                      ? number(
                          totalQuantity,
                        )
                      : "100%"}
                </td>

                <td className="bg-slate-200 px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </section>
  );
}

function EventDetail({
  rows,
}: {
  rows: Consumption[];
}) {
  const grouped = unique(
    rows.map((d) => d.area),
  );

  return (
    <div>
      <div className="mb-4 text-sm font-semibold">
        Detalle del consumo
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {grouped.map((area) => {
          const areaRows =
            rows.filter(
              (d) => d.area === area,
            );

          const total =
            areaRows.reduce(
              (sum, d) =>
                sum + d.total,
              0,
            );

          return (
            <div
              key={area}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex justify-between gap-3">
                <div className="font-medium">
                  {area}
                </div>

                <div className="font-semibold">
                  {money(total)}
                </div>
              </div>

              <div className="space-y-2">
                {areaRows.map(
                  (row, index) => (
                    <div
                      key={`${row.material}-${index}`}
                      className="grid grid-cols-[1fr_auto_auto] gap-4 border-t border-slate-100 pt-2 text-sm"
                    >
                      <div>
                        {row.material}
                      </div>

                      <div className="text-slate-500">
                        {number(
                          row.cantidad,
                        )}{" "}
                        uds.
                      </div>

                      <div className="font-medium">
                        {money(
                          row.total,
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({
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

      <div className="mt-2 text-2xl font-semibold">
        {value}
      </div>

      {subtitle && (
        <div className="mt-1 truncate text-xs text-slate-400">
          {subtitle}
        </div>
      )}
    </div>
  );
}

function MetricButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
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
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
  setSelected: (
    value: string[],
  ) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const toggle = (
    value: string,
  ) => {
    if (
      selected.includes(value)
    ) {
      setSelected(
        selected.filter(
          (item) =>
            item !== value,
        ),
      );
    } else {
      setSelected([
        ...selected,
        value,
      ]);
    }
  };

  return (
    <div className="relative">
      <label className="text-xs font-medium text-slate-500">
        {title}
      </label>

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
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
          {options.map(
            (option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(
                    option,
                  )}
                  onChange={() =>
                    toggle(
                      option,
                    )
                  }
                />

                <span>
                  {option}
                </span>
              </label>
            ),
          )}

          {selected.length >
            0 && (
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
    clear: (
      value: string,
    ) => void;
  }[];
  clearAll: () => void;
}) {
  const filters =
    groups.flatMap(
      (group) =>
        group.values.map(
          (value) => ({
            group:
              group.label,
            value,
            clear: () =>
              group.clear(
                value,
              ),
          }),
        ),
    );

  if (
    filters.length === 0
  ) {
    return null;
  }

  const visible =
    filters.slice(0, 5);

  const remaining =
    Math.max(
      0,
      filters.length -
        visible.length,
    );

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
      <span className="text-xs font-medium text-slate-500">
        Filtros activos:
      </span>

      {visible.map(
        (filter) => (
          <button
            key={`${filter.group}-${filter.value}`}
            type="button"
            onClick={
              filter.clear
            }
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
          >
            {filter.group}:{" "}
            {filter.value} ×
          </button>
        ),
      )}

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