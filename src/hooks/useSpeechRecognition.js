import { useState } from "react";
export default function useSpeechRecognition(onResult, setError) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setListening(true);
    setError("");

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setListening(false);
      onResult(text);
    };

    recognition.onerror = (err) => {
      setError("Speech recognition error: " + err.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
  };

  return { listening, startListening };
}