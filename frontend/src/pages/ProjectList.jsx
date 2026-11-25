import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Search, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-8 space-y-6 bg-[#0B1120] min-h-screen text-[#E2E8F0]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Projects</h1>
        {user?.role !== 'EMPLOYEE' && (
          <button
            onClick={() => navigate('/projects/create')}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-medium px-4 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add Project
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-[#172554] rounded-2xl border border-[#334155] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1E3A8A] text-[#94A3B8] text-xs uppercase">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Manager</th>
                <th className="p-4">Status</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {projects.map(project => (
                <tr key={project._id}>
                  <td className="p-4">{project.name}</td>
                  <td className="p-4">{project.projectManager?.fullName}</td>
                  <td className="p-4">{project.status}</td>
                  <td className="p-4">{project.progress}%</td>
                  <td className="p-4">
                    <button onClick={() => navigate(`/projects/${project._id}`)} className="text-[#2563EB]">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
