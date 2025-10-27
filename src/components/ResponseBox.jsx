export default function ResponseBox({ reply, audioUrl }) {
  if (!reply) return null;
  return (
    <div>
      <p className="text-sm text-gray-500">AI Response:</p>
      <p className="p-3 bg-blue-50 rounded-lg">{reply}</p>
      {audioUrl && (
        <audio controls className="mt-2 w-full">
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}