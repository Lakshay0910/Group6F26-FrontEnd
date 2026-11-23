
CREATE TABLE public.trips (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES public.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    CONSTRAINT valid_trip_status
        CHECK (status IN ('active', 'completed')),

    CONSTRAINT valid_trip_end
        CHECK (
            (status = 'active' AND ended_at IS NULL)
            OR
            (status = 'completed' AND ended_at >= started_at)
        )
);

CREATE UNIQUE INDEX one_active_trip_per_driver
ON public.trips(driver_id)
WHERE status = 'active';


CREATE TABLE public.trip_locations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id BIGINT NOT NULL
        REFERENCES public.trips(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_latitude
        CHECK (latitude BETWEEN -90 AND 90),

    CONSTRAINT valid_longitude
        CHECK (longitude BETWEEN -180 AND 180)
);

CREATE INDEX idx_trip_locations_trip_time
ON public.trip_locations(trip_id, recorded_at);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;
