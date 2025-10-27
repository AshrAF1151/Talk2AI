import { useState, useCallback } from "react";
import useElevenLabsTTS from "./useElevenLabsTTS";
import { getEnv } from "../utils/env";

export default function useOpenRouterChat({ onReply, onAudio, onError }) {
  const [loading, setLoading] = useState(false);
  const { generateVoice } = useElevenLabsTTS(onAudio, onError);

  const sendToAI = useCallback(async (text, voiceId, systemPrompt, temperature) => {
    const apiKey = getEnv("VITE_OPENROUTER_API_KEY");
    if (!apiKey) return onError("Missing VITE_OPENROUTER_API_KEY");

    setLoading(true);
    onReply("");
    onAudio("");

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Optional but recommended — identify your app
          "HTTP-Referer": window.location.origin,
          "X-Title": "Your App Name",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", // ✅ same model, but use OpenRouter format
          stream: true,
          temperature: typeof temperature === "number" ? temperature : 0.4,
          messages: [
            { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
            { role: "user", content: text },
          ],
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (let line of lines) {
          line = line.replace(/^data: /, "").trim();
          if (line === "[DONE]") continue;

          try {
            const json = JSON.parse(line);
            const content = json?.choices?.[0]?.delta?.content;
            if (content) {
              partial += content;
              onReply(partial);
            }
          } catch {}
        }
      }

      if (partial) {
        await generateVoice(partial, voiceId);
      }
    } catch (err) {
      onError(err.message || "Failed to connect to OpenRouter");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, sendToAI };
}