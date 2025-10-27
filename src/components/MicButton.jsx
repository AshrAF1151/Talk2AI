import { Mic, Loader2 } from "lucide-react";

export default function MicButton({ listening, loading, onClick }) {
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={onClick}
        disabled={listening || loading}
        className={`relative flex items-center justify-center rounded-full h-16 w-16 transition-all duration-300 ${
          listening
            ? "bg-red-600 animate-pulse"
            : loading
            ? "bg-gray-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
}