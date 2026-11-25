import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, Save, X } from 'lucide-react';

export const ProjectForm = () => {
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const navigate = useNavigate();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(!!id);

  React.useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setValue('name', data.name);
            setValue('description', data.description);
            setValue('startDate', data.startDate?.split('T')[0]);
            setValue('endDate', data.endDate?.split('T')[0]);
            setValue('projectManager', data.projectManager?._id || data.projectManager);
            setValue('status', data.status);
          } else {
            setError(data.message || 'Failed to load project');
          }
        } catch (err) {
          setError('An unexpected error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const url = id ? `http://localhost:5000/api/projects/${id}` : 'http://localhost:5000/api/projects';
      const method = id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        navigate(id ? `/projects/${id}` : '/projects');
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${id ? 'update' : 'create'} project`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  if (loading) return <div className="p-8 text-[#E2E8F0]">Loading...</div>;

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="max-w-2xl mx-auto bg-[#172554] p-8 rounded-2xl border border-[#334155]">
        <h1 className="text-2xl font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Briefcase className="text-[#38BDF8]" /> {id ? 'Edit Project' : 'Create New Project'}
        </h1>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-xl mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input {...register('name', { required: true })} className="w-full p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} className="w-full p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" {...register('startDate', { required: true })} className="w-full p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" {...register('endDate', { required: true })} className="w-full p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Manager ID</label>
            <input {...register('projectManager', { required: true })} className="w-full p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]" />
          </div>
          {id && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="w-full p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]">
                <option value="PLANNED">PLANNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl flex items-center gap-2">
              <Save size={18} /> Save Project
            </button>
            <button type="button" onClick={() => navigate(id ? `/projects/${id}` : '/projects')} className="bg-[#334155] text-white px-6 py-2.5 rounded-xl flex items-center gap-2">
              <X size={18} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
