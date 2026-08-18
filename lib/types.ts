/**
 * Tipos de la base de datos — reflejan a mano
 * supabase/migrations/20260817000000_schema.sql. No hay proyecto Supabase
 * conectado todavía para generarlos con `supabase gen types`; cuando lo
 * haya, este archivo se puede reemplazar por la salida de ese comando
 * (la forma pública `Database` es compatible).
 *
 * Los "Row" son `type`, no `interface`, a propósito: @supabase/postgrest-js
 * exige que cada tabla (`GenericTable`) tenga `Row/Insert/Update extends
 * Record<string, unknown>`, y una `interface` NO satisface esa constraint
 * aunque tenga exactamente las mismas propiedades que un `type` — es una
 * diferencia real de TypeScript, no un capricho de estilo. Con `interface`
 * acá, `.from("tabla").select("*")` se resuelve en silencio a `never`.
 */

export type LoadKind = "alta" | "media" | "colchon" | "fiestas";
export type LearnTrack = "rol" | "mercado" | "tool";
export type LearnMode = "bloque" | "chamba" | "tiempo_muerto" | "micro";
export type LearnBlock = "A" | "B" | "C";
export type ItemStatus = "pending" | "in_progress" | "done";
export type ResourceFormat =
  | "video"
  | "podcast"
  | "curso"
  | "interactivo"
  | "web"
  | "ppt"
  | "app"
  | "pdf"
  | "docx"
  | "md"
  | "otro";
export type ResourceLanguage = "es" | "en";
export type ResourceTier = "nucleo" | "utilitario" | "archivo";
export type ArtifactStatus = "pending" | "in_progress" | "done" | "blocked";
export type ConnectionStatus = "pending" | "done";
export type QuestType = "ejecutar" | "aprender" | "conectar" | "bonus";
export type StreakKindDb = "daily_english" | "weekly_log";
export type StreakEventAction = "marked" | "freeze" | "missed";
export type BossStatus = "pending" | "won" | "lost";

export type Phase = {
  id: string;
  created_at: string;
  user_id: string;
  number: number;
  name: string;
  rule: string;
  unlocked: boolean;
  unlocked_by_boss: number | null;
};

export type Boss = {
  id: string;
  created_at: string;
  user_id: string;
  number: number;
  name: string;
  date: string;
  criterion: string;
  status: BossStatus;
};

export type Week = {
  id: string;
  created_at: string;
  user_id: string;
  number: number;
  start_date: string;
  end_date: string;
  phase_number: number;
  focus: string;
  load: LoadKind;
  note: string | null;
};

export type LearnItem = {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  track: LearnTrack;
  title: string;
  mode: LearnMode;
  block: LearnBlock | null;
  chain: string | null;
  source: string | null;
  status: ItemStatus;
  target_week: number | null;
};

export type Resource = {
  id: string;
  created_at: string;
  user_id: string;
  learn_code: string;
  title: string;
  url: string | null;
  format: ResourceFormat;
  language: ResourceLanguage | null;
  duration_min: number | null;
  week: number | null;
  tier: ResourceTier;
  status: ItemStatus;
  notes: string | null;
  sort_order: number;
};

export type ArtifactGroup = {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  title: string;
  feeds: string[];
  target_week: number | null;
  starred: boolean;
};

export type Artifact = {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  group_code: string;
  title: string;
  consumes: string[];
  status: ArtifactStatus;
  phase_number: number;
  note: string | null;
};

export type Result = {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  title: string;
  criterion: string;
  achieved: boolean;
  achieved_at: string | null;
  target_month: string | null;
};

export type Connection = {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  person: string;
  role: string | null;
  unlocks: string | null;
  serves: string[];
  target_month: string | null;
  status: ConnectionStatus;
  unlocked_note: string | null;
};

export type Exposure = {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  type: string;
  required_output: string;
  cap_per_month: number | null;
  target_note: string | null;
};

export type ExposureEvent = {
  id: string;
  created_at: string;
  user_id: string;
  exposure_code: string;
  date: string;
  name: string;
  output: string | null;
  counts: boolean; // columna generada
};

export type Quest = {
  id: string;
  created_at: string;
  user_id: string;
  week_number: number;
  type: QuestType;
  title: string;
  ref_code: string | null;
  done: boolean;
};

export type Streak = {
  id: string;
  created_at: string;
  user_id: string;
  kind: StreakKindDb;
  current: number;
  longest: number;
  last_marked: string | null;
  freezes_total: number;
  freezes_used: number;
  quarter: string;
};

export type StreakEvent = {
  id: string;
  created_at: string;
  user_id: string;
  kind: StreakKindDb;
  period: string;
  action: StreakEventAction;
};

export type LogEntry = {
  id: string;
  created_at: string;
  user_id: string;
  week_number: number;
  date: string;
  what: string;
  evidence: string;
  ref_code: string | null;
};

export type AppEvent = {
  id: string;
  created_at: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
};

// ---------------------------------------------------------------------
// Forma "Database" al estilo del cliente tipado de Supabase. Insert/Update
// se derivan de Row a mano (Omit de las columnas con default + Partial).
//
// `Relationships: []` en cada tabla y `Views`/`Functions` vacíos a nivel
// de schema no son adorno: @supabase/postgrest-js exige esa forma exacta
// (GenericTable / GenericSchema) para que la inferencia de `.from(...)`
// funcione.
// ---------------------------------------------------------------------
type WithDefaults = "id" | "created_at" | "user_id";

type InsertOf<
  Row extends Record<WithDefaults, unknown>,
  OptionalAlsoKeys extends keyof Row = never,
> = Omit<Row, WithDefaults | OptionalAlsoKeys> &
  Partial<Pick<Row, WithDefaults>> &
  Partial<Pick<Row, OptionalAlsoKeys>>;

type UpdateOf<Row> = Partial<Row>;

type TableOf<
  Row extends Record<WithDefaults, unknown>,
  OptionalAlsoKeys extends keyof Row = never,
> = {
  Row: Row;
  Insert: InsertOf<Row, OptionalAlsoKeys>;
  Update: UpdateOf<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      phases: TableOf<Phase, "unlocked" | "unlocked_by_boss">;
      bosses: TableOf<Boss, "status">;
      weeks: TableOf<Week, "focus" | "note">;
      learn_items: TableOf<
        LearnItem,
        "block" | "chain" | "source" | "status" | "target_week"
      >;
      resources: TableOf<
        Resource,
        "url" | "language" | "duration_min" | "week" | "status" | "notes" | "sort_order"
      >;
      artifact_groups: TableOf<ArtifactGroup, "feeds" | "target_week" | "starred">;
      artifacts: TableOf<Artifact, "consumes" | "status" | "note">;
      results: TableOf<Result, "achieved" | "achieved_at" | "target_month">;
      connections: TableOf<
        Connection,
        "role" | "unlocks" | "serves" | "target_month" | "status" | "unlocked_note"
      >;
      exposures: TableOf<Exposure, "cap_per_month" | "target_note">;
      exposure_events: TableOf<ExposureEvent, "date" | "output" | "counts">;
      quests: TableOf<Quest, "ref_code" | "done">;
      streaks: TableOf<
        Streak,
        "current" | "longest" | "last_marked" | "freezes_total" | "freezes_used"
      >;
      streak_events: TableOf<StreakEvent>;
      log_entries: TableOf<LogEntry, "date" | "ref_code">;
      app_events: TableOf<AppEvent, "payload">;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
};
