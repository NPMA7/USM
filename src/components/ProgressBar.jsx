import { useTeams } from "@/context/TeamContext";

export default function ProgressBar({ total, tournament_name }) {
  const { registeredTeams } = useTeams();
  
  const currentTeams = registeredTeams[tournament_name] || 0;
  const percentage = (currentTeams / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">{currentTeams} / {total} Tim</span>
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