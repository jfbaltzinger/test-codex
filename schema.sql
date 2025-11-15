-- PostgreSQL schema for fitness/class reservation application
-- Users, memberships, credit packs, credit transactions, classes, sessions, reservations, and payments

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

-- Enumerated types ---------------------------------------------------------

CREATE TYPE user_role AS ENUM ('member', 'admin');

CREATE TYPE membership_status AS ENUM ('inactive', 'active', 'suspended', 'cancelled');

CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'attended', 'no_show');

CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'consumption', 'refund', 'adjustment');

CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- Utility functions --------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

-- Users --------------------------------------------------------------------

CREATE TABLE users (
    id                BIGSERIAL PRIMARY KEY,
    external_id       UUID,
    email             CITEXT NOT NULL,
    password_hash     TEXT,
    first_name        TEXT,
    last_name         TEXT,
    phone_number      TEXT,
    role              user_role NOT NULL DEFAULT 'member',
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    credit_balance    INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    UNIQUE (external_id)
);

CREATE UNIQUE INDEX idx_users_unique_email_active
    ON users (lower(email))
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Credit Packs -------------------------------------------------------------

CREATE TABLE credit_packs (
    id                BIGSERIAL PRIMARY KEY,
    name              TEXT NOT NULL,
    description       TEXT,
    credits_included  INTEGER NOT NULL CHECK (credits_included > 0),
    price_cents       INTEGER NOT NULL CHECK (price_cents >= 0),
    currency          CHAR(3) NOT NULL DEFAULT 'EUR',
    is_recurring      BOOLEAN NOT NULL DEFAULT FALSE,
    validity_days     INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_credit_packs_active
    ON credit_packs (is_recurring, deleted_at)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_credit_packs_set_updated_at
    BEFORE UPDATE ON credit_packs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Memberships --------------------------------------------------------------

CREATE TABLE memberships (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credit_pack_id    BIGINT REFERENCES credit_packs(id),
    status            membership_status NOT NULL DEFAULT 'inactive',
    auto_renew        BOOLEAN NOT NULL DEFAULT FALSE,
    started_at        DATE,
    expires_at        DATE,
    cancelled_at      TIMESTAMPTZ,
    metadata          JSONB,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_memberships_user_status
    ON memberships (user_id, status)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_memberships_set_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Classes ------------------------------------------------------------------

CREATE TABLE classes (
    id                BIGSERIAL PRIMARY KEY,
    slug              TEXT UNIQUE,
    name              TEXT NOT NULL,
    description       TEXT,
    default_credit_cost INTEGER NOT NULL DEFAULT 1 CHECK (default_credit_cost > 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_classes_active
    ON classes (deleted_at)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_classes_set_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Sessions -----------------------------------------------------------------

CREATE TABLE sessions (
    id                BIGSERIAL PRIMARY KEY,
    class_id          BIGINT NOT NULL REFERENCES classes(id),
    coach_name        TEXT,
    location          TEXT,
    start_at          TIMESTAMPTZ NOT NULL,
    end_at            TIMESTAMPTZ NOT NULL,
    capacity          INTEGER NOT NULL CHECK (capacity > 0),
    credit_cost       INTEGER NOT NULL CHECK (credit_cost > 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    CHECK (end_at > start_at)
);

CREATE INDEX idx_sessions_class_time
    ON sessions (class_id, start_at)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_sessions_start_at
    ON sessions (start_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_sessions_set_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Reservations -------------------------------------------------------------

CREATE TABLE reservations (
    id                BIGSERIAL PRIMARY KEY,
    session_id        BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status            reservation_status NOT NULL DEFAULT 'pending',
    checked_in_at     TIMESTAMPTZ,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_reservations_session
    ON reservations (session_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_reservations_user
    ON reservations (user_id)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_reservations_unique_active
    ON reservations (user_id, session_id)
    WHERE deleted_at IS NULL AND status <> 'cancelled';

CREATE TRIGGER trg_reservations_set_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Credits ------------------------------------------------------------------

CREATE TABLE credits (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_id     BIGINT REFERENCES memberships(id) ON DELETE SET NULL,
    credit_pack_id    BIGINT REFERENCES credit_packs(id) ON DELETE SET NULL,
    reservation_id    BIGINT REFERENCES reservations(id) ON DELETE SET NULL,
    type              credit_transaction_type NOT NULL,
    amount            INTEGER NOT NULL,
    description       TEXT,
    metadata          JSONB,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    CHECK (
        amount <> 0
        AND (
            (type = 'consumption' AND amount < 0)
            OR (type IN ('purchase', 'refund') AND amount > 0)
            OR (type = 'adjustment')
        )
    )
);

CREATE INDEX idx_credits_user_created_at
    ON credits (user_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_credits_reservation
    ON credits (reservation_id)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_credits_reservation_consumption
    ON credits (reservation_id)
    WHERE type = 'consumption' AND deleted_at IS NULL;

CREATE UNIQUE INDEX idx_credits_reservation_refund
    ON credits (reservation_id)
    WHERE type = 'refund' AND deleted_at IS NULL;

CREATE TRIGGER trg_credits_set_updated_at
    BEFORE UPDATE ON credits
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Payment Logs -------------------------------------------------------------

CREATE TABLE payment_logs (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_id     BIGINT REFERENCES memberships(id) ON DELETE SET NULL,
    credit_pack_id    BIGINT REFERENCES credit_packs(id) ON DELETE SET NULL,
    credit_id         BIGINT REFERENCES credits(id) ON DELETE SET NULL,
    provider          TEXT,
    provider_reference TEXT,
    status            payment_status NOT NULL DEFAULT 'pending',
    amount_cents      INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency          CHAR(3) NOT NULL DEFAULT 'EUR',
    payload           JSONB,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_payment_logs_user_status
    ON payment_logs (user_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_payment_logs_provider_reference
    ON payment_logs (provider, provider_reference)
    WHERE provider_reference IS NOT NULL;

CREATE TRIGGER trg_payment_logs_set_updated_at
    BEFORE UPDATE ON payment_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Trigger functions for credit balance ------------------------------------

CREATE OR REPLACE FUNCTION adjust_user_credit_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    delta INTEGER;
    updated_balance INTEGER;
BEGIN
    IF TG_OP = 'INSERT' THEN
        delta := NEW.amount;
        UPDATE users
        SET credit_balance = credit_balance + delta
        WHERE id = NEW.user_id
        RETURNING credit_balance INTO updated_balance;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'User % does not exist', NEW.user_id;
        END IF;

        IF updated_balance < 0 THEN
            RAISE EXCEPTION 'Insufficient credits for user %', NEW.user_id;
        END IF;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.user_id <> OLD.user_id THEN
            -- Revert from old user
            UPDATE users
            SET credit_balance = credit_balance - OLD.amount
            WHERE id = OLD.user_id
            RETURNING credit_balance INTO updated_balance;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'User % does not exist', OLD.user_id;
            END IF;

            IF updated_balance < 0 THEN
                RAISE EXCEPTION 'Insufficient credits for user % after reassignment', OLD.user_id;
            END IF;

            -- Apply to new user
            UPDATE users
            SET credit_balance = credit_balance + NEW.amount
            WHERE id = NEW.user_id
            RETURNING credit_balance INTO updated_balance;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'User % does not exist', NEW.user_id;
            END IF;

            IF updated_balance < 0 THEN
                RAISE EXCEPTION 'Insufficient credits for user %', NEW.user_id;
            END IF;
        ELSE
            delta := NEW.amount - OLD.amount;
            UPDATE users
            SET credit_balance = credit_balance + delta
            WHERE id = NEW.user_id
            RETURNING credit_balance INTO updated_balance;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'User % does not exist', NEW.user_id;
            END IF;

            IF updated_balance < 0 THEN
                RAISE EXCEPTION 'Insufficient credits for user %', NEW.user_id;
            END IF;
        END IF;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users
        SET credit_balance = credit_balance - OLD.amount
        WHERE id = OLD.user_id
        RETURNING credit_balance INTO updated_balance;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'User % does not exist', OLD.user_id;
        END IF;

        IF updated_balance < 0 THEN
            RAISE EXCEPTION 'Credit balance for user % became negative on delete', OLD.user_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_credits_adjust_balance
    AFTER INSERT OR UPDATE OR DELETE ON credits
    FOR EACH ROW
    EXECUTE FUNCTION adjust_user_credit_balance();

-- Trigger to handle automatic credit consumption/refund on reservations ----

CREATE OR REPLACE FUNCTION handle_reservation_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    session_cost INTEGER;
    existing_consumption BIGINT;
    existing_refund BIGINT;
BEGIN
    -- Determine the credit cost of the related session
    SELECT credit_cost INTO session_cost
    FROM sessions
    WHERE id = COALESCE(NEW.session_id, OLD.session_id);

    IF session_cost IS NULL THEN
        RAISE EXCEPTION 'Unable to determine credit cost for session %', COALESCE(NEW.session_id, OLD.session_id);
    END IF;

    -- Handle insert events -------------------------------------------------
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'confirmed' AND NEW.deleted_at IS NULL THEN
            PERFORM 1
            FROM credits
            WHERE reservation_id = NEW.id AND type = 'consumption' AND deleted_at IS NULL;

            IF NOT FOUND THEN
                INSERT INTO credits (user_id, reservation_id, type, amount, description, created_at, updated_at)
                VALUES (NEW.user_id, NEW.id, 'consumption', -session_cost, 'Reservation confirmation', now(), now());
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle update events -------------------------------------------------
    IF TG_OP = 'UPDATE' THEN
        IF NEW.status <> OLD.status OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
            -- Confirmed reservation: ensure credit consumption exists
            IF NEW.status = 'confirmed' AND NEW.deleted_at IS NULL THEN
                SELECT id INTO existing_consumption
                FROM credits
                WHERE reservation_id = NEW.id AND type = 'consumption' AND deleted_at IS NULL
                LIMIT 1;

                IF existing_consumption IS NULL THEN
                    INSERT INTO credits (user_id, reservation_id, type, amount, description, created_at, updated_at)
                    VALUES (NEW.user_id, NEW.id, 'consumption', -session_cost, 'Reservation confirmation', now(), now());
                END IF;
            END IF;

            -- Cancelled reservation or soft delete: ensure refund exists
            IF (NEW.status = 'cancelled' OR NEW.deleted_at IS NOT NULL) THEN
                SELECT id INTO existing_consumption
                FROM credits
                WHERE reservation_id = NEW.id AND type = 'consumption' AND deleted_at IS NULL
                LIMIT 1;

                IF existing_consumption IS NOT NULL THEN
                    SELECT id INTO existing_refund
                    FROM credits
                    WHERE reservation_id = NEW.id AND type = 'refund' AND deleted_at IS NULL
                    LIMIT 1;

                    IF existing_refund IS NULL THEN
                        INSERT INTO credits (user_id, reservation_id, type, amount, description, created_at, updated_at)
                        VALUES (NEW.user_id, NEW.id, 'refund', session_cost, 'Reservation cancellation refund', now(), now());
                    END IF;
                END IF;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reservations_manage_credits
    AFTER INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION handle_reservation_credits();

-- Maintain session capacity ------------------------------------------------

CREATE OR REPLACE FUNCTION enforce_session_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_capacity INTEGER;
    confirmed_count INTEGER;
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'confirmed' AND NEW.deleted_at IS NULL THEN
            SELECT capacity INTO current_capacity
            FROM sessions
            WHERE id = NEW.session_id
            FOR UPDATE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Session % does not exist', NEW.session_id;
            END IF;

            SELECT COUNT(*) INTO confirmed_count
            FROM reservations
            WHERE session_id = NEW.session_id
              AND status = 'confirmed'
              AND deleted_at IS NULL;

            IF confirmed_count >= current_capacity THEN
                RAISE EXCEPTION 'Session % is full', NEW.session_id;
            END IF;
        END IF;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        IF (NEW.status = 'confirmed' AND NEW.deleted_at IS NULL) AND (OLD.status <> 'confirmed' OR OLD.deleted_at IS NOT NULL OR NEW.session_id <> OLD.session_id) THEN
            SELECT capacity INTO current_capacity
            FROM sessions
            WHERE id = NEW.session_id
            FOR UPDATE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Session % does not exist', NEW.session_id;
            END IF;

            SELECT COUNT(*) INTO confirmed_count
            FROM reservations
            WHERE session_id = NEW.session_id
              AND status = 'confirmed'
              AND deleted_at IS NULL
              AND id <> NEW.id;

            IF confirmed_count >= current_capacity THEN
                RAISE EXCEPTION 'Session % is full', NEW.session_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservations_enforce_capacity
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION enforce_session_capacity();

COMMIT;
