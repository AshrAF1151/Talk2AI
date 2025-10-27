export default function AvatarPanel({ src, name, status }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-lg overflow-hidden aspect-square">
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <span
          className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-gray-900 ${
            status === "Listening..."
              ? "bg-green-400 animate-pulse"
              : status === "Thinking..."
              ? "bg-yellow-400 animate-pulse"
              : "bg-gray-500"
          }`}
        ></span>
      </div>

      <h2 className="text-lg font-semibold mt-3 text-gray-100">{name}</h2>
      <p className="text-sm text-gray-400">{status}</p>
    </div>
  );
}