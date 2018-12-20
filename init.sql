CREATE TABLE companies
(
	handle TEXT PRIMARY KEY,
	name TEXT UNIQUE NOT NULL,
	num_employees INTEGER,
	description TEXT,
	logo_url TEXT
)

CREATE TABLE jobs
(
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	salary FLOAT NOT NULL,
	equity FLOAT NOT NULL CONSTRAINT valid_percent_decimal CHECK (equity <= 1 AND equity >=0),
	company_handle TEXT REFERENCES companies(handle) ON DELETE CASCADE,
	date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
)