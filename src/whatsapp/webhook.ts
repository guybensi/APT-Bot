import { Router } from "express";
import { env } from "../config/env";
import { handleIncomingMessage } from "./handler";

type WhatsAppPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string;
          type?: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
};

type ParsedMessage = {
  from: string;
  text: string;
};

const parseMessages = (payload: WhatsAppPayload): ParsedMessage[] => {
  const messages: ParsedMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        if (message.type === "text" && message.from && message.text?.body) {
          messages.push({ from: message.from, text: message.text.body });
        }
      }
    }
  }

  return messages;
};

export const whatsappWebhook = Router();

whatsappWebhook.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.WA_WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

whatsappWebhook.post("/webhook", async (req, res) => {
  const messages = parseMessages(req.body ?? {});

  if (messages.length === 0) {
    return res.sendStatus(200);
  }

  await Promise.all(messages.map((message) => handleIncomingMessage(message)));
  return res.sendStatus(200);
});
