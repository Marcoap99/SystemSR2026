"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Block, PartialBlock } from "@blocknote/core";
import { saveResourceNotesAction, uploadNoteImageAction } from "@/lib/actions/notes";
import { updateResourceStatusAction } from "@/lib/actions/resources";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { EMPTY_NOTE_TEMPLATE } from "@/components/notes/note-template";
import type { ItemStatus, Resource } from "@/lib/types";

const STATUS_CYCLE: ItemStatus[] = ["pending", "in_progress", "done"];
const STATUS_LABEL: Record<ItemStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecho",
};
const STATUS_CLASSES: Record<ItemStatus, string> = {
  pending: "bg-badge-yellow-bg text-badge-yellow-text",
  in_progress: "bg-badge-blue-bg text-badge-blue-text",
  done: "bg-badge-green-bg text-badge-green-text",
};
const TIER_LABEL: Record<string, string> = { nucleo: "Núcleo", utilitario: "Utilitario", archivo: "Archivo" };
const FORMAT_LABEL: Record<string, string> = {
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
const LANGUAGE_LABEL: Record<string, string> = { es: "ES", en: "EN" };

type SaveStatus = "idle" | "saving" | "saved" | "error";

function initialBlocksFor(resource: Resource): PartialBlock[] {
  if (resource.notes === null) return EMPTY_NOTE_TEMPLATE;
  if (resource.notes.length === 0) return [{ type: "paragraph" }];
  return resource.notes as unknown as PartialBlock[];
}

/**
 * V1.3 parche sección 2 — el bloc de notas: modal superpuesto, backdrop
 * difuminado, foco atrapado, autosave a los 800ms. `locked` lo pasa
 * el mismo mecanismo de V1.2 (dependencia sin cerrar) -- si está
 * bloqueado, el editor abre de solo lectura, igual que ya hacía la
 * tarjeta con el textarea viejo.
 */
export function NotesModal({
  resource,
  locked,
  onClose,
}: {
  resource: Resource;
  locked: boolean;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState(0);
  const [status, setStatus] = useState<ItemStatus>(resource.status);
  const [statusPending, setStatusPending] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const pendingDocRef = useRef<Block[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Scroll de fondo bloqueado mientras el modal está abierto (AC2).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedFadeRef.current) clearTimeout(savedFadeRef.current);
    };
  }, []);

  const flushSave = useCallback(async (): Promise<boolean> => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const doc = pendingDocRef.current;
    if (doc === null) return true;
    setSaveStatus("saving");
    try {
      await saveResourceNotesAction(resource.id, doc as never);
      pendingDocRef.current = null;
      setSaveStatus("saved");
      setSavedAt(Date.now());
      if (savedFadeRef.current) clearTimeout(savedFadeRef.current);
      savedFadeRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
      return true;
    } catch {
      setSaveStatus("error");
      return false;
    }
  }, [resource.id]);

  const handleChangeDoc = useCallback(
    (doc: Block[]) => {
      pendingDocRef.current = doc;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void flushSave();
      }, 800);
    },
    [flushSave],
  );

  const requestClose = useCallback(async () => {
    const ok = await flushSave();
    if (!ok) return; // AC7: si falla el guardado, el modal no se cierra.
    if (reducedMotionRef.current) {
      onClose();
      return;
    }
    setClosing(true);
    setTimeout(onClose, 140);
  }, [flushSave, onClose]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      void requestClose();
      return;
    }
    if (e.key !== "Tab") return;
    const root = modalRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function cycleStatus() {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length]!;
    setStatus(next);
    setStatusPending(true);
    updateResourceStatusAction(resource.id, next).finally(() => setStatusPending(false));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 backdrop-blur-sm transition-opacity duration-150 motion-reduce:transition-none sm:p-4"
      onClick={() => void requestClose()}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className={
          "flex h-full w-full flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[80vh] sm:w-full sm:max-w-[720px] sm:rounded-card sm:border sm:border-border sm:shadow-card " +
          (closing ? "animate-modal-out" : "animate-modal-in")
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border p-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-text-muted">
              {resource.learn_code} · {TIER_LABEL[resource.tier]} · {FORMAT_LABEL[resource.format]}
              {resource.language ? ` · ${LANGUAGE_LABEL[resource.language]}` : ""}
              {resource.week ? ` · sem ${resource.week}` : ""}
            </p>
            <h2 id="notes-modal-title" className="mt-1 text-lg font-semibold text-text">
              {resource.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-border px-4 py-2">
          {resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              🔗 Abrir recurso
            </a>
          ) : null}
          {!locked ? (
            <button
              type="button"
              onClick={cycleStatus}
              disabled={statusPending}
              className={`ml-auto shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium transition-opacity disabled:opacity-60 ${STATUS_CLASSES[status]}`}
            >
              {STATUS_LABEL[status]}
            </button>
          ) : (
            <span className="ml-auto shrink-0 text-xs text-locked">🔒 Bloqueado por dependencia</span>
          )}
        </div>

        {uploadNotice ? (
          <p className="border-b border-border bg-warn/10 px-4 py-1.5 text-xs text-warn">{uploadNotice}</p>
        ) : null}

        <div className="flex-1 overflow-y-auto p-4">
          <NoteEditor
            initialContent={initialBlocksFor(resource)}
            editable={!locked}
            onChangeDoc={handleChangeDoc}
            onUploadStart={() => setUploadNotice(null)}
            onUploadError={(message) => setUploadNotice(`⚠ No se pudo subir la imagen — ${message} Pegala de nuevo para reintentar.`)}
            uploadImage={async (file) => {
              const formData = new FormData();
              formData.append("file", file);
              const result = await uploadNoteImageAction(resource.id, formData);
              if ("error" in result) throw new Error(result.error);
              return result.url;
            }}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs">
          {saveStatus === "error" ? (
            <span className="text-warn">⚠ No se pudo guardar</span>
          ) : saveStatus === "saving" ? (
            <span className="text-text-muted">Guardando…</span>
          ) : saveStatus === "saved" ? (
            <span key={savedAt} className="text-text-muted animate-save-check">
              Guardado ✓
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => void requestClose()}
            aria-label="Cerrar"
            className="rounded-badge px-2 py-1 text-text-muted hover:bg-bg hover:text-text"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
