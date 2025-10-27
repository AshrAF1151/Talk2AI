export default function ChatMessage({ sender, text, avatarSrc }) {
  const isUser = sender === "user";
  return (
    <div
      className={`flex items-end space-x-3 ${
        isUser ? "justify-end text-right" : "justify-start text-left"
      }`}
    >
      {!isUser && <img src={avatarSrc} className="w-10 h-10 rounded-full" />}
      <div
        className={`max-w-[75%] p-3 rounded-2xl ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-800 text-gray-100 rounded-bl-none"
        }`}
      >
        {text}
      </div>
      {isUser && <img src={avatarSrc} className="w-10 h-10 rounded-full" />}
    </div>
  );
}