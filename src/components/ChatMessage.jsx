export default function ChatMessage({ sender, text, avatarSrc }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex items-end space-x-3 ${
        isUser ? "justify-end text-right" : "justify-start text-left"
      }`}
    >
      {/* Avatar (AI side) */}
      {!isUser && (
        <img
          src={avatarSrc}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover object-center flex-shrink-0"
        />
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[75%] p-3 rounded-2xl break-words ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-800 text-gray-100 rounded-bl-none"
        }`}
      >
        {text}
      </div>

      {/* Avatar (User side) */}
      {isUser && (
        <img
          src={avatarSrc}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover object-center flex-shrink-0"
        />
      )}
    </div>
  );
}