import { env } from "../config/env";

type WhatsAppTextPayload = {
  messaging_product: "whatsapp";
  to: string;
  type: "text";
  text: {
    body: string;
  };
};

type WhatsAppTemplatePayload = {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: {
      code: string;
    };
  };
};

const sendMessage = async (payload: WhatsAppTextPayload | WhatsAppTemplatePayload) => {
  const url = `https://graph.facebook.com/v20.0/${env.WA_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WA_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${errorText}`);
  }
};

export const sendText = async (to: string, text: string): Promise<void> => {
  await sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  });
};

export const sendTemplate = async (
  to: string,
  templateName: string,
  languageCode: string
): Promise<void> => {
  await sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode }
    }
  });
};
