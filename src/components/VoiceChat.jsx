import { useState, useEffect, useRef } from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useOpenAIChat from "../hooks/useOpenAIChat";
// import useOpenRouterChat from "../hooks/useOpenRouterChat";
import AvatarPanel from "./AvatarPanel";
import ChatMessage from "./ChatMessage";
import MicButton from "./MicButton";
import JinnahImg from "../assets/Quid.png";
import UserImg from "../assets/user-avatar.png";

export default function VoiceChat() {
  const [messages, setMessages] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  
      //const voiceId = "wJtzq2sZIVQJXXASOxGT";
    // const voiceId = "A1WDuunUAFexr4L5vYGr";

  const personalities = [
    {
      key: "ai",
      name: "AI Assistant",
      voiceId: "UgBBYS2sOqTuMpoF3BR0",
      avatar: UserImg,
      systemPrompt:
        "You are a helpful, concise AI assistant. Be friendly, precise, and provide practical answers with minimal fluff.",
    },
    {
      key: "jinnah",
      name: "Muhammad Ali Jinnah",
      voiceId: "wJtzq2sZIVQJXXASOxGT",
      avatar: JinnahImg,
      systemPrompt:
        "You are Quaid-e-Azam Muhammad Ali Jinnah. Always respond in the first person as Jinnah. Use a formal, dignified, and principled tone. Emphasize constitutionalism, rule of law, unity, discipline, and faith. Do not say you are an AI or a language model; never use phrases like 'I am just a computer program.' Avoid anachronisms; if asked about events after 1948, answer hypothetically or state that they occurred beyond your lifetime. Keep replies concise yet eloquent.",
    },
  ];

  const [selectedKey, setSelectedKey] = useState(personalities[0].key);
  const selected = personalities.find((p) => p.key === selectedKey) ?? personalities[0];

  const { loading, sendToAI } = useOpenAIChat({
    onReply: (reply) => {
      setMessages((prev) => {
        if (prev.length && prev[prev.length - 1].sender === "ai") {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], text: reply };
          return next;
        }
        return [...prev, { sender: "ai", text: reply }];
      });
    },
    onAudio: setAudioUrl,
    onError: setError,
  });

  // const { loading, sendToAI } = useOpenRouterChat({
  //   onReply: (reply) => {
  //     setMessages((prev) => {
  //       if (prev.length && prev[prev.length - 1].sender === "ai") {
  //         const next = [...prev];
  //         next[next.length - 1] = { ...next[next.length - 1], text: reply };
  //         return next;
  //       }
  //       return [...prev, { sender: "ai", text: reply }];
  //     });
  //   },
  //   onAudio: setAudioUrl,
  //   onError: setError,
  // });

  const { listening, startListening } = useSpeechRecognition(async (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
    await sendToAI(text, selected.voiceId, selected.systemPrompt);
  }, setError);

  useEffect(() => {
    setMessages([]);
    setAudioUrl("");
  }, [selectedKey]);

  const listRef = useRef(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen w-full bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex">
      {/* Left side - Avatar panel */}
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-gray-900/70 border-r border-gray-800 p-6">
        <div className="w-full h-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight">PersonalityApp</h1>
            <div className="mt-10">
              <label className="block text-sm font-medium mb-2">Select personality</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                {personalities.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <AvatarPanel
              src={selected.avatar}
              name={selected.name}
              status={listening ? "Listening..." : loading ? "Thinking..." : "Ready"}
            />
          </div>
        </div>
      </div>

      {/* Right side - Chat messages */}
      <div className="flex-1 flex flex-col justify-between p-3 md:p-6">
        {/* Mobile header (hidden on md+) */}
        <div className="block md:hidden mb-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold tracking-tight">PersonalityApp</h1>
          </div>
          <label className="block text-xs font-medium mb-1">Select personality</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {personalities.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Mobile avatar preview */}
          <div className="mt-4 flex items-center justify-center">
            <AvatarPanel
              src={selected.avatar}
              name={selected.name}
              status={listening ? "Listening..." : loading ? "Thinking..." : "Ready"}
            />
          </div>
        </div>

        <div ref={listRef} className="overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              sender={msg.sender}
              text={msg.text}
              avatarSrc={msg.sender === "ai" ? selected.avatar : UserImg}
            />
          ))}
          {error && (
            <div className="text-red-400 text-sm mt-2 font-medium">{error}</div>
          )}
        </div>

        {audioUrl && (
          <audio controls className="mt-3 w-full rounded-lg">
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
        )}

        {/* Floating mic button */}
        <MicButton listening={listening} loading={loading} onClick={startListening} />
      </div>
    </div>
  );
}