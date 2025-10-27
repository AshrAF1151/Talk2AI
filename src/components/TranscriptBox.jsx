export default function TranscriptBox({ transcript }) {
  if (!transcript) return null;
  return (
    <div>
      <p className="text-sm text-gray-500">You said:</p>
      <p className="p-3 bg-gray-100 rounded-lg">{transcript}</p>
    </div>
  );
}