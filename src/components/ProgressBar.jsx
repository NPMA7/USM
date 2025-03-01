export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">{current} / {total} Tim</span>
        <span className="text-sm font-semibold text-gray-700">{percentage.toFixed(0)}%</span>
      </div>
      <div className="bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
} 