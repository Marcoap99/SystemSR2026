/**
 * Tipos de la base de datos — reflejan a mano
 * supabase/migrations/20260817000000_schema.sql. No hay proyecto Supabase
 * conectado todavía para generarlos con `supabase gen types`; cuando lo
 * haya, este archivo se puede reemplazar por la salida de ese comando
 * (la forma pública `Database` es compatible).
 */

export type LoadKind = "alta" | "media" | "colchon" | "fiestas";
export type LearnTrack = "rol" | "mercado" | "tool";
export type LearnMode = "bloque" | "chamba" | "tiempo_muerto" | "micro";
export type LearnBlock = "A" | "B" | "C";
export type ItemStatus = "pending" | "in_progress" | "done";
export type ArtifactStatus = "pending" | "in_progress" | "done" | "blocked";
export type ConnectionStatus = "pending" | "done";
export type QuestType = "ejecutar" | "aprender" | "conectar" | "bonus";
export type StreakKindDb = "daily_english" | "weekly_log";
export type StreakEventAction = "marked" | "freeze" | "missed";
export type BossStatus = "pending" | "won" | "lost";

export interface Phase {
  id: string;
  created_at: string;
  user_id: string;
  number: number;
  name: string;
  rule: string;
  unlocked: boolean;
  unlocked_by_boss: number | null;
}

export interface Boss {
  id: string;
  created_at: string;
  user_id: string;
  number: number;
  name: string;
  date: string;
  criterion: string;
  status: BossStatus;
}

export interface Week {
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
}

export interface LearnItem {
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
}

export interface ArtifactGroup {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  title: string;
  feeds: string[];
  target_week: number | null;
  starred: boolean;
}

export interface Artifact {
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
}

export interface Result {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  title: string;
  criterion: string;
  achieved: boolean;
  achieved_at: string | null;
  target_month: string | null;
}

export interface Connection {
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
}

export interface Exposure {
  id: string;
  created_at: string;
  user_id: string;
  code: string;
  type: string;
  required_output: string;
  cap_per_month: number | null;
  target_note: string | null;
}

export interface ExposureEvent {
  id: string;
  created_at: string;
  user_id: string;
  exposure_code: string;
  date: string;
  name: string;
  output: string | null;
  counts: boolean; // columna generada
}

export interface Quest {
  id: string;
  created_at: string;
  user_id: string;
  week_number: number;
  type: QuestType;
  title: string;
  ref_code: string | null;
  done: boolean;
}

export interface Streak {
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
}

export interface StreakEvent {
  id: string;
  created_at: string;
  user_id: string;
  kind: StreakKindDb;
  period: string;
  action: StreakEventAction;
}

export interface LogEntry {
  id: string;
  created_at: string;
  user_id: string;
  week_number: number;
  date: string;
  what: string;
  evidence: string;
  ref_code: string | null;
}

export interface AppEvent {
  id: string;
  created_at: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------------
// Forma "Database" al estilo del cliente tipado de Supabase. Insert/Update
// se derivan de Row a mano (Omit de las columnas con default + Partial).
// ---------------------------------------------------------------------
type WithDefaults = "id" | "created_at" | "user_id";

type InsertOf<
  Row extends Record<WithDefaults, unknown>,
  OptionalAlsoKeys extends keyof Row = never,
> = Omit<Row, WithDefaults | OptionalAlsoKeys> &
  Partial<Pick<Row, WithDefaults>> &
  Partial<Pick<Row, OptionalAlsoKeys>>;

type UpdateOf<Row> = Partial<Row>;

export interface Database {
  public: {
    Tables: {
      phases: {
        Row: Phase;
        Insert: InsertOf<Phase, "unlocked" | "unlocked_by_boss">;
        Update: UpdateOf<Phase>;
      };
      bosses: {
        Row: Boss;
        Insert: InsertOf<Boss, "status">;
        Update: UpdateOf<Boss>;
      };
      weeks: {
        Row: Week;
        Insert: InsertOf<Week, "focus" | "note">;
        Update: UpdateOf<Week>;
      };
      learn_items: {
        Row: LearnItem;
        Insert: InsertOf<LearnItem, "block" | "chain" | "source" | "status" | "target_week">;
        Update: UpdateOf<LearnItem>;
      };
      artifact_groups: {
        Row: ArtifactGroup;
        Insert: InsertOf<ArtifactGroup, "feeds" | "target_week" | "starred">;
        Update: UpdateOf<ArtifactGroup>;
      };
      artifacts: {
        Row: Artifact;
        Insert: InsertOf<Artifact, "consumes" | "status" | "note">;
        Update: UpdateOf<Artifact>;
      };
      results: {
        Row: Result;
        Insert: InsertOf<Result, "achieved" | "achieved_at" | "target_month">;
        Update: UpdateOf<Result>;
      };
      connections: {
        Row: Connection;
        Insert: InsertOf<
          Connection,
          "role" | "unlocks" | "serves" | "target_month" | "status" | "unlocked_note"
        >;
        Update: UpdateOf<Connection>;
      };
      exposures: {
        Row: Exposure;
        Insert: InsertOf<Exposure, "cap_per_month" | "target_note">;
        Update: UpdateOf<Exposure>;
      };
      exposure_events: {
        Row: ExposureEvent;
        Insert: InsertOf<ExposureEvent, "date" | "output" | "counts">;
        Update: UpdateOf<ExposureEvent>;
      };
      quests: {
        Row: Quest;
        Insert: InsertOf<Quest, "ref_code" | "done">;
        Update: UpdateOf<Quest>;
      };
      streaks: {
        Row: Streak;
        Insert: InsertOf<
          Streak,
          "current" | "longest" | "last_marked" | "freezes_total" | "freezes_used"
        >;
        Update: UpdateOf<Streak>;
      };
      streak_events: {
        Row: StreakEvent;
        Insert: InsertOf<StreakEvent>;
        Update: UpdateOf<StreakEvent>;
      };
      log_entries: {
        Row: LogEntry;
        Insert: InsertOf<LogEntry, "date" | "ref_code">;
        Update: UpdateOf<LogEntry>;
      };
      app_events: {
        Row: AppEvent;
        Insert: InsertOf<AppEvent, "payload">;
        Update: UpdateOf<AppEvent>;
      };
    };
  };
}
