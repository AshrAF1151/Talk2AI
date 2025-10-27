import { ELEVENLABS_API_KEY } from "../config";

export default function useElevenLabsTTS(onAudio, onError) {
  const generateVoice = async (text, voiceId) => {
    const elevenKey = ELEVENLABS_API_KEY;

    if (!elevenKey) {
      onError("Missing ELEVENLABS_API_KEY in config.js");
      return;
    }

    if (!voiceId) {
      onError("Missing voiceId for ElevenLabs TTS");
      return;
    }

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.4, similarity_boost: 0.9 },
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to generate voice");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      onAudio(url);

      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      onError("ElevenLabs Error: " + err.message);
    }
  };

  return { generateVoice };
}