-- =========================================================================
-- Smart Motor Vibration Monitoring - PostgreSQL / TimescaleDB Schema
-- High-performance time-series schema for tri-axial industrial motor monitoring
-- =========================================================================

-- Optional: Enable TimescaleDB extension for hypertable time partitioning
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. Sensor Readings Table
CREATE TABLE IF NOT EXISTS motor_vibration_readings (
    id BIGSERIAL,
    time TIMESTAMPTZ NOT NULL,
    device_id VARCHAR(64) NOT NULL DEFAULT 'ESP32-VIB-01',
    acc_x DOUBLE PRECISION,                     -- mm/s²
    acc_y DOUBLE PRECISION,                     -- mm/s²
    acc_z DOUBLE PRECISION,                     -- mm/s²
    vib_magnitude DOUBLE PRECISION,             -- Calculated: sqrt(x² + y² + z²)
    vib_ang_x DOUBLE PRECISION,                 -- Vibration angle X
    vib_ang_y DOUBLE PRECISION,                 -- Vibration angle Y
    vib_ang_z DOUBLE PRECISION,                 -- Vibration angle Z
    raw_timestamp VARCHAR(64),                  -- Preserves exact imported time string
    source VARCHAR(32) NOT NULL DEFAULT 'live', -- 'csv', 'live', 'simulation'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (time, id)
);

-- Convert to TimescaleDB Hypertable if TimescaleDB is installed
-- SELECT create_hypertable('motor_vibration_readings', 'time', if_not_exists => TRUE);

-- Indexes for lightning-fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_motor_readings_time ON motor_vibration_readings (time DESC);
CREATE INDEX IF NOT EXISTS idx_motor_readings_device ON motor_vibration_readings (device_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_motor_readings_source ON motor_vibration_readings (source, time DESC);

-- 2. Alerts and Threshold Events Table
CREATE TABLE IF NOT EXISTS motor_alerts (
    id VARCHAR(64) PRIMARY KEY,
    time TIMESTAMPTZ NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,              -- 'warning', 'critical'
    axis VARCHAR(32) NOT NULL,                  -- 'Acc_X', 'Acc_Y', 'Acc_Z', 'Magnitude'
    measured_value DOUBLE PRECISION NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    message TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_motor_alerts_time ON motor_alerts (time DESC);
CREATE INDEX IF NOT EXISTS idx_motor_alerts_sev ON motor_alerts (severity, acknowledged);

-- 3. IoT Registered Devices Table
CREATE TABLE IF NOT EXISTS motor_devices (
    device_id VARCHAR(64) PRIMARY KEY,
    device_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'hardware_not_connected', -- 'online', 'offline', 'hardware_not_connected'
    ip_address VARCHAR(45),
    firmware_version VARCHAR(32),
    sensor_model VARCHAR(64),
    sample_rate_hz INTEGER DEFAULT 100,
    last_seen TIMESTAMPTZ,
    total_packets BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial device registration
INSERT INTO motor_devices (device_id, device_name, status, ip_address, sensor_model)
VALUES ('ESP32-VIB-01', 'Primary Motor Drive End (DE) Sensor', 'hardware_not_connected', '192.168.1.120', 'MPU-6050 / ADXL345')
ON CONFLICT (device_id) DO NOTHING;
