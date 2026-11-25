import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProject(data);
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
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        navigate('/projects');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete project');
      }
    } catch (err) {
      alert('An unexpected error occurred');
    }
  };

  if (loading) return <div className="p-8 text-[#E2E8F0]">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!project) return <div className="p-8 text-[#E2E8F0]">Project not found.</div>;

  return (
    <div className="p-8 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-[#94A3B8] hover:text-[#FFFFFF] mb-6">
        <ArrowLeft size={18} /> Back to Projects
      </button>
      <div className="bg-[#172554] p-8 rounded-2xl border border-[#334155]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#FFFFFF]">{project.name}</h1>
            <p className="text-[#94A3B8] mt-2">{project.description}</p>
          </div>
          {user?.role !== 'EMPLOYEE' && (
            <div className="flex gap-2">
              <button onClick={() => navigate(`/projects/edit/${id}`)} className="p-2 bg-[#334155] rounded-lg hover:bg-[#475569]"><Edit size={18} /></button>
              <button onClick={handleDelete} className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900"><Trash2 size={18} /></button>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="bg-[#0F172A] p-4 rounded-xl border border-[#334155]">
            <p className="text-xs text-[#94A3B8] uppercase">Status</p>
            <p className="text-lg font-semibold">{project.status}</p>
          </div>
          <div className="bg-[#0F172A] p-4 rounded-xl border border-[#334155]">
            <p className="text-xs text-[#94A3B8] uppercase">Progress</p>
            <p className="text-lg font-semibold">{project.progress || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
