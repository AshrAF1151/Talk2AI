import { useState, useCallback } from "react";
import useElevenLabsTTS from "./useElevenLabsTTS";

export default function useOpenAIChat({ onReply, onAudio, onError }) {
  const [loading, setLoading] = useState(false);
  const { generateVoice } = useElevenLabsTTS(onAudio, onError);

  const sendToAI = useCallback(async (text, voiceId, systemPrompt, temperature) => {
    if (!text?.trim()) return onError("No input text provided");

    setLoading(true);
    onReply("");
    onAudio("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId,
          systemPrompt: systemPrompt || "You are a helpful AI assistant.",
          temperature: typeof temperature === "number" ? temperature : 0.4,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      // Read streaming response
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
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, sendToAI };
}