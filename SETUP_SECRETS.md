# Secrets & Env Setup (Do Not Share)

This file explains what values you must add to your local `.env` file.
You must create and edit `.env` in the project root (same folder as `package.json`).
The app reads secrets ONLY from `.env`, not from this file.
Never share these values in chat or commit them to git.

## Required keys and how to get them

### PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
Your Postgres connection values.
- If you installed Postgres locally, these are from your local setup.
- `PGPASSWORD` is your DB user password (local).

### DATA_ENCRYPTION_KEY
Used to encrypt phone numbers.
- Must be **32 bytes** and **base64** encoded.
- How to generate (PowerShell):
  - `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))`

### PHONE_HASH_SALT
Used to hash phone numbers.
- Any strong random string is fine.
- Example (PowerShell):
  - `[Guid]::NewGuid().ToString("N")`

### WA_PHONE_NUMBER_ID
WhatsApp Cloud API phone number ID.
- Find it in Meta Business Manager:
  - WhatsApp Manager → Phone Numbers → your number → **Phone number ID**

### WA_ACCESS_TOKEN
WhatsApp Cloud API access token.
- Meta Developers → Your App → WhatsApp → API Setup.
- Use the **permanent** token for production.

### WA_WEBHOOK_VERIFY_TOKEN
Webhook verification token (you choose this).
- Create any random string and use the same value when you set up the webhook in Meta.
- Example (PowerShell):
  - `[Guid]::NewGuid().ToString("N")`

### WA_TEMPLATE_NEW_MATCH
Template name for match messages (already approved in WhatsApp).
- Meta → WhatsApp Manager → Message Templates → Template name.

### BASE_URL
Your public server URL (must be reachable by Meta).
- For local dev: use ngrok or similar.
- Example: `https://xxxxx.ngrok-free.app`

## Exactly where to put the values

1. Go to the project root folder (the one with `package.json`).
2. Create a file named `.env` (no extension).
3. Paste the keys below into `.env` and replace `replace_me` with your real values.

## Example `.env` (fill in your values)

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=apt_alert_bot
PGUSER=postgres
PGPASSWORD=replace_me
PORT=3000
DATA_ENCRYPTION_KEY=replace_me
PHONE_HASH_SALT=replace_me
WA_PHONE_NUMBER_ID=replace_me
WA_ACCESS_TOKEN=replace_me
WA_WEBHOOK_VERIFY_TOKEN=replace_me
WA_TEMPLATE_NEW_MATCH=replace_me
BASE_URL=https://your-public-url
```
