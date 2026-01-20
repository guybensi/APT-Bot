# apt-alert-bot

Simple health-check API with Postgres connectivity.

## Local setup

1. Install dependencies:
   - `npm install`
2. Create a `.env` file:
   - `cp .env.example .env`
3. Update `.env` with your Postgres connection values.
4. Run the server:
   - `npm run dev`

## Scripts

- `npm run dev` - start dev server with reload
- `npm run build` - compile TypeScript to `dist/`
- `npm start` - run compiled server

## Health endpoint

`GET /health` returns:

```
{ "ok": true, "db": true }
```

## Database notes

Preference flow state is stored per user in `user_state`. Minimal schema:

```
CREATE TABLE user_state (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  state TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```
