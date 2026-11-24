export const StatCard = ({ title, value, change, icon: Icon, trend }) => {
  return (
    <div className="bg-[#172554] p-6 rounded-2xl border border-[#334155] shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-[#FFFFFF] mt-1.5">{value}</h4>
        </div>
        <div className="p-3 bg-[#2563EB]/20 rounded-xl text-[#38BDF8] border border-[#2563EB]/40 flex items-center justify-center">
          <Icon size={22} />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
            trend === 'up' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-red-950/60 text-red-400 border border-red-800/50'
          }`}>
            {change}
          </span>
          <span className="text-xs text-[#94A3B8]">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
