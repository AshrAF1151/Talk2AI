export default function ActionButton({ listening, loading, onClick }) {
  const label = listening
    ? "Listening..."
    : loading
    ? "Thinking..."
    : "Start Talking";

  const style = listening
    ? "bg-red-500"
    : loading
    ? "bg-gray-400"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <button
      onClick={onClick}
      disabled={listening || loading}
      className={`px-5 py-2 rounded-xl text-white font-semibold transition ${style}`}
    >
      {label}
    </button>
  );
}