CREATE TYPE musicalkey AS ENUM(
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
    'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm',
    'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS samples (
    sample_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bpm INTEGER,
    sample_name VARCHAR(255) NOT NULL,
    sample_url VARCHAR(500),
    musical_key musicalkey,
    tags VARCHAR(50)[],
    uploader_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_samples (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    sample_id UUID REFERENCES samples(sample_id) ON DELETE CASCADE,
    save_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, sample_id)
);