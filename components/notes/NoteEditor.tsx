"use client";

import { useEffect, useMemo, useState } from "react";
import { es as esDictionary } from "@blocknote/core/locales";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import type { Block, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
  type DefaultReactSuggestionItem,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { noteEditorTheme } from "@/components/notes/blocknote-theme";
import { ImageLightbox } from "@/components/notes/ImageLightbox";

/**
 * V1.3 parche sección 3 — el slash menu por defecto de BlockNote trae
 * ~20 comandos; acá se recorta a los 8 bloques del parche (título
 * cuenta como 2 comandos, /h1 y /h2, sobre el mismo tipo de bloque). Se
 * reusan los items reales de BlockNote (onItemClick, icon) y solo se
 * pisan título/subtítulo/alias en español -- así el comportamiento de
 * inserción queda exactamente igual al que ya prueba la librería.
 */
const ALLOWED_KEYS = [
  "heading",
  "heading_2",
  "bullet_list",
  "numbered_list",
  "check_list",
  "quote",
  "code_block",
  "divider",
  "image",
] as const;

const SPANISH_LABEL: Record<(typeof ALLOWED_KEYS)[number], { title: string; subtext: string; aliases: string[] }> = {
  heading: { title: "Título 1", subtext: "Encabezado grande", aliases: ["h1", "titulo", "encabezado"] },
  heading_2: { title: "Título 2", subtext: "Encabezado mediano", aliases: ["h2", "subtitulo"] },
  bullet_list: { title: "Lista", subtext: "Lista con viñetas", aliases: ["lista", "vinetas"] },
  numbered_list: { title: "Lista numerada", subtext: "Lista con números", aliases: ["numerada", "numeros"] },
  check_list: { title: "Checklist", subtext: "Lista con casilleros", aliases: ["check", "checklist", "tareas"] },
  quote: { title: "Cita", subtext: "Bloque de cita", aliases: ["cita"] },
  code_block: { title: "Bloque de código", subtext: "Texto con formato monoespaciado", aliases: ["codigo", "code"] },
  divider: { title: "Separador", subtext: "Línea divisoria", aliases: ["divisor", "separador"] },
  image: { title: "Imagen", subtext: "Subir o pegar una imagen", aliases: ["imagen", "foto", "captura"] },
};

function isAllowedKey(key: string): key is (typeof ALLOWED_KEYS)[number] {
  return (ALLOWED_KEYS as readonly string[]).includes(key);
}

// El tipo público `DefaultReactSuggestionItem` le saca `key` a propósito
// (los items custom de un usuario no necesitan uno), pero los objetos
// reales que devuelve `getDefaultReactSlashMenuItems` sí lo traen --
// viene de un `...item` interno que nunca se tipó de vuelta. Sin este
// tipo local no hay forma de filtrar/indexar por key sin `any`.
type SlashItemWithKey = DefaultReactSuggestionItem & { key: string };

export function NoteEditor({
  initialContent,
  editable,
  onChangeDoc,
  onUploadStart,
  onUploadError,
  uploadImage,
}: {
  initialContent: PartialBlock[] | undefined;
  editable: boolean;
  onChangeDoc: (doc: Block[]) => void;
  onUploadStart?: () => void;
  onUploadError?: (message: string) => void;
  uploadImage: (file: File) => Promise<string>;
}) {
  const editor = useCreateBlockNote({
    initialContent,
    dictionary: esDictionary,
    uploadFile: async (file) => {
      onUploadStart?.();
      if (file.size > 5 * 1024 * 1024) {
        onUploadError?.("La imagen supera los 5 MB.");
        throw new Error("La imagen supera los 5 MB.");
      }
      try {
        return await uploadImage(file);
      } catch (err) {
        onUploadError?.(err instanceof Error ? err.message : "No se pudo subir la imagen.");
        throw err;
      }
    },
  });

  // AC3: al abrir el modal, el foco entra al editor. El editor se crea
  // fresco por cada apertura (NotesModal no persiste entre resource.id
  // distintos), así que este efecto corre una vez por apertura real.
  useEffect(() => {
    editor.focus();
  }, [editor]);

  // Click en una imagen del contenido -> agrandarla en un lightbox, en vez
  // de solo ubicar el cursor ahí. Delegado sobre el contenedor (no un
  // listener por imagen) porque BlockNote re-renderiza los bloques de
  // imagen libremente; escuchar acá cubre las que ya existen y las que se
  // suben después, sin re-suscribirse.
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const img = (e.target as HTMLElement).closest("img");
    if (img?.src) setLightboxSrc(img.src);
  }

  const slashMenuItems = useMemo<DefaultReactSuggestionItem[]>(() => {
    return (getDefaultReactSlashMenuItems(editor) as SlashItemWithKey[])
      .filter((item) => isAllowedKey(item.key))
      .map((item) => ({ ...item, ...SPANISH_LABEL[item.key as (typeof ALLOWED_KEYS)[number]] }));
  }, [editor]);

  return (
    <div onClickCapture={handleContentClick}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={{ light: noteEditorTheme, dark: noteEditorTheme }}
        slashMenu={false}
        onChange={() => onChangeDoc(editor.document)}
        className="bn-notes-editor"
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterSuggestionItems(slashMenuItems, query)}
        />
      </BlockNoteView>
      {lightboxSrc ? <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} /> : null}
    </div>
  );
}
