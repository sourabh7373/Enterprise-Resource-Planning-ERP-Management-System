export const AnalyticsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <h3 className="text-sm font-bold text-[#FFFFFF] mb-4">Employee Growth Trends</h3>
        <div className="h-48 flex items-center justify-center text-[#94A3B8] border border-dashed border-[#334155] rounded-xl bg-[#0F172A]/50 text-xs">
          Growth trend visualization graph
        </div>
      </div>

      <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm">
        <h3 className="text-sm font-bold text-[#FFFFFF] mb-4">Attendance Ratio</h3>
        <div className="h-48 flex items-center justify-center text-[#94A3B8] border border-dashed border-[#334155] rounded-xl bg-[#0F172A]/50 text-xs">
          Attendance ratio breakdown graph
        </div>
      </div>
    </div>
  );
};
