import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="bg-red-50 p-4 rounded-2xl mb-6 shadow-sm border border-red-100">
        <ShieldAlert size={48} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Access Unauthorized</h1>
      <p className="text-sm text-slate-600 max-w-md text-center mb-6">
        You do not have the required permissions to access this module. Please contact your system administrator if you believe this is an error.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
