"use client";

import { useState } from "react";
import InventoryDashboard from "./components/InventoryDashboard";
import ConsumptionDashboard from "./components/ConsumptionDashboard";
import EventConsumptionDashboard from "./components/EventConsumptionDashboard";

type Tab =
  | "inventory"
  | "consumption"
  | "event-consumption";

export default function Home() {
  const [activeTab, setActiveTab] =
    useState<Tab>("inventory");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Dashboard Ejecutivo
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Inventario, consumos y análisis operativo.
            </p>
          </div>

          <div className="flex flex-wrap rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <TabButton
              active={activeTab === "inventory"}
              onClick={() => setActiveTab("inventory")}
            >
              Inventario Movible
            </TabButton>

            <TabButton
              active={activeTab === "consumption"}
              onClick={() => setActiveTab("consumption")}
            >
              Consumos de Ferretería
            </TabButton>

            <TabButton
              active={activeTab === "event-consumption"}
              onClick={() => setActiveTab("event-consumption")}
            >
              Consumo por Evento
            </TabButton>
          </div>
        </div>

        {/* Los 3 permanecen montados.
            Así cada uno conserva filtros, fechas, búsquedas, etc. */}
        <div
          className={
            activeTab === "inventory" ? "block" : "hidden"
          }
        >
          <InventoryDashboard />
        </div>

        <div
          className={
            activeTab === "consumption" ? "block" : "hidden"
          }
        >
          <ConsumptionDashboard />
        </div>

        <div
          className={
            activeTab === "event-consumption"
              ? "block"
              : "hidden"
          }
        >
          <EventConsumptionDashboard />
        </div>
      </div>
    </main>
  );
}

function TabButton({
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
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}