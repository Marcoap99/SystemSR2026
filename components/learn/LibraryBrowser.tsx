"use client";

import { useMemo, useState } from "react";
import { TrackSection } from "@/components/learn/TrackSection";
import { groupProgress } from "@/lib/domain/progress";
import type { LearnItemsData } from "@/lib/data/learn-items";
import type { ResourceFormat, ResourceTier } from "@/lib/types";

type WeekFilter = "current" | "all" | number;
type FormatFilter = "all" | ResourceFormat;
type TierFilter = "all" | ResourceTier;

const FORMAT_LABEL: Record<ResourceFormat, string> = {
  video: "Video",
  podcast: "Podcast",
  curso: "Curso",
  interactivo: "Interactivo",
  web: "Web",
  ppt: "PPT",
  app: "App",
  pdf: "PDF",
  docx: "DOCX",
  md: "MD",
  otro: "Otro",
};

const TIER_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: "all", label: "Todos los tiers" },
  { value: "nucleo", label: "Núcleo" },
  { value: "utilitario", label: "Utilitario" },
  { value: "archivo", label: "Archivo" },
];

/** Bloque A: filtros (semana/formato/tier) + biblioteca agrupada por track. */
export function LibraryBrowser({ data }: { data: LearnItemsData }) {
  const { currentWeekNumber, tracks, weeksWithResources, formatsPresent } = data;

  const [weekFilter, setWeekFilter] = useState<WeekFilter>(currentWeekNumber !== null ? "current" : "all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");

  const filteredTracks = useMemo(() => {
    return tracks.map((trackGroup) => {
      const items = trackGroup.items.map((g) => {
        const resources = g.resources.filter((r) => {
          if (weekFilter === "current" && r.week !== currentWeekNumber) return false;
          if (typeof weekFilter === "number" && r.week !== weekFilter) return false;
          if (formatFilter !== "all" && r.format !== formatFilter) return false;
          if (tierFilter !== "all" && r.tier !== tierFilter) return false;
          return true;
        });
        return { ...g, resources, progress: groupProgress(resources) };
      });
      const trackResources = items.flatMap((g) => g.resources);
      return { ...trackGroup, items, progress: groupProgress(trackResources) };
    });
  }, [tracks, weekFilter, formatFilter, tierFilter, currentWeekNumber]);

  const totalVisible = filteredTracks.reduce((n, t) => n + t.items.filter((g) => g.resources.length > 0).length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface p-3">
        <select
          value={String(weekFilter)}
          onChange={(e) => {
            const v = e.target.value;
            setWeekFilter(v === "current" || v === "all" ? v : Number(v));
          }}
          className="rounded-card border border-border px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
        >
          {currentWeekNumber !== null ? (
            <option value="current">Esta semana ({currentWeekNumber})</option>
          ) : null}
          <option value="all">Todas las semanas</option>
          {weeksWithResources.map((w) => (
            <option key={w} value={w}>
              Semana {w}
            </option>
          ))}
        </select>

        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value as FormatFilter)}
          className="rounded-card border border-border px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
        >
          <option value="all">Todos los formatos</option>
          {formatsPresent.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABEL[f]}
            </option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as TierFilter)}
          className="rounded-card border border-border px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
        >
          {TIER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {totalVisible === 0 ? (
        <p className="text-sm text-text-muted">Sin recursos para estos filtros.</p>
      ) : (
        filteredTracks.map((t) => (
          <TrackSection key={t.track} track={t.track} items={t.items} progress={t.progress} />
        ))
      )}
    </div>
  );
}
