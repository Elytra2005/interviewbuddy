-- Anti-Cheat Interview Platform — Database Schema
-- Run against a PostgreSQL database: psql -d your_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Interviewers / Admins ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  role            VARCHAR(50)  DEFAULT 'interviewer'
                    CHECK (role IN ('admin', 'interviewer')),
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── Interview Templates ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               VARCHAR(255) NOT NULL,
  problem_statement   TEXT         NOT NULL,
  duration_minutes    INTEGER      DEFAULT 60 CHECK (duration_minutes > 0),
  created_by          UUID         REFERENCES users(id) ON DELETE SET NULL,
  -- minimal: only tab-switch; standard: + paste/insertion; full: all signals
  monitoring_level    VARCHAR(50)  DEFAULT 'standard'
                        CHECK (monitoring_level IN ('minimal', 'standard', 'full')),
  language            VARCHAR(50)  DEFAULT 'javascript',
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── Invited Candidates ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id      UUID         NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  email             VARCHAR(255) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  invite_token      VARCHAR(255) UNIQUE NOT NULL,
  token_expires_at  TIMESTAMPTZ  NOT NULL,
  status            VARCHAR(50)  DEFAULT 'invited'
                      CHECK (status IN ('invited', 'in_progress', 'completed', 'expired')),
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── Interview Sessions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id        UUID         NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interview_id        UUID         NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  session_token       VARCHAR(255) UNIQUE NOT NULL,
  started_at          TIMESTAMPTZ,
  ended_at            TIMESTAMPTZ,
  webcam_snapshot     TEXT,        -- base64-encoded JPEG taken at session start
  consent_given       BOOLEAN      DEFAULT FALSE,
  consent_given_at    TIMESTAMPTZ,
  risk_score          DECIMAL(5,2) DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status              VARCHAR(50)  DEFAULT 'pending'
                        CHECK (status IN ('pending', 'active', 'completed', 'abandoned')),
  final_code          TEXT,
  created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── Suspicious / Notable Event Log ─────────────────────────────────────────
-- All entries are SIGNALS, not proof. Human review is required.
CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID         NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type   VARCHAR(100) NOT NULL,
  severity     VARCHAR(50)  NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  details      JSONB        DEFAULT '{}',
  timestamp    TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── Code Snapshots (for playback) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS code_snapshots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID  NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  content      TEXT  NOT NULL,
  char_count   INTEGER DEFAULT 0,
  timestamp    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Interviewer Notes ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviewer_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT DEFAULT '',
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, user_id)
);

-- ─── Screen Capture Frames ──────────────────────────────────────────────────
-- Periodic JPEG snapshots of the candidate's screen (every 30s).
-- frame_data is a base64 data URL.  Human review required before any use.
CREATE TABLE IF NOT EXISTS screen_frames (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID         NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  frame_data   TEXT         NOT NULL,
  width        INTEGER,
  height       INTEGER,
  captured_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── Organisations ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_candidates_token       ON candidates(invite_token);
CREATE INDEX IF NOT EXISTS idx_candidates_interview   ON candidates(interview_id);
CREATE INDEX IF NOT EXISTS idx_sessions_candidate     ON sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token         ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_interview     ON sessions(interview_id);
CREATE INDEX IF NOT EXISTS idx_events_session         ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp       ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type            ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_snapshots_session      ON code_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp    ON code_snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_screen_frames_session  ON screen_frames(session_id);
CREATE INDEX IF NOT EXISTS idx_screen_frames_time     ON screen_frames(captured_at);
