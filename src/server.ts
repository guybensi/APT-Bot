import express from "express";
import { env } from "./config/env";
import { whatsappWebhook } from "./whatsapp/webhook";
import { startScheduler } from "./scheduler";
import { checkDbHealth } from "./db/health";

const app = express();
app.use(express.json());
app.use("/whatsapp", whatsappWebhook);

app.get("/health", async (_req, res) => {
  const db = await checkDbHealth();
  res.json({ ok: true, db });
});

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

startScheduler();
