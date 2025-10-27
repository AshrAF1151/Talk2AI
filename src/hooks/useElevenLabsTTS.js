export default function useElevenLabsTTS(onAudio, onError) {
  const generateVoice = async (text, voiceId) => {
    if (!voiceId) {
      onError("Missing voiceId for ElevenLabs TTS");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });

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



// export default function useElevenLabsTTS(onAudio, onError) {
//   const generateVoice = async (text, voiceId) => {
//     const elevenKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

//     if (!elevenKey) {
//       onError("Missing VITE_ELEVENLABS_API_KEY");
//       return;
//     }

//     if (!voiceId) {
//       onError("Missing voiceId for ElevenLabs TTS");
//       return;
//     }

//     try {
//       const res = await fetch(
//         `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
//         {
//           method: "POST",
//           headers: {
//             "xi-api-key": elevenKey,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             text,
//             model_id: "eleven_multilingual_v2",
//             voice_settings: { stability: 0.4, similarity_boost: 0.9 },
//           }),
//         }
//       );

//       if (!res.ok) throw new Error("Failed to generate voice");
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       onAudio(url);

//       const audio = new Audio(url);
//       audio.play();
//     } catch (err) {
//       onError("ElevenLabs Error: " + err.message);
//     }
//   };

//   return { generateVoice };
// }