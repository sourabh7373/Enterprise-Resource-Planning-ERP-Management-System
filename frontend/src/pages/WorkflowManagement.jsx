import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle, Clock, Settings, Layers, ShieldCheck, Play, Pause, FileText, AlertCircle, Eye, Edit3, Send } from 'lucide-react';

const WorkflowManagement = () => {
  const [workflows, setWorkflows] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [inboxRequests, setInboxRequests] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [activeTab, setActiveTab] = useState('workflows'); // workflows, inbox, submitted, automation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Workflow Form State (Create / Edit)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    module: 'Expense',
    status: 'DRAFT',
    stages: [{ stageNumber: 1, stageName: 'Manager Review', approverType: 'Role', approverRole: 'Manager', requirements: '' }]
  });

  // Workflow Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Submit Approval Request Modal State
  const [showSubmitRequestModal, setShowSubmitRequestModal] = useState(false);
  const [submitRequestForm, setSubmitRequestForm] = useState({
    workflowId: '',
    title: '',
    description: '',
    amount: '',
    module: 'Expense',
    referenceId: 'REF-' + Math.floor(100000 + Math.random() * 900000),
    referenceModel: 'Expense'
  });

  // Request History Modal State
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);

  // Decision Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionComments, setDecisionComments] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  // Automation Rule Form State
  const [automationForm, setAutomationForm] = useState({
    name: '',
    description: '',
    triggerType: 'LOW_STOCK',
    thresholdValue: 10,
    isActive: true
  });
  const [showAutomationModal, setShowAutomationModal] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchWorkflows();
    fetchApprovalInbox();
    fetchSubmittedRequests();
    fetchAutomationRules();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await axios.get('/api/workflows', authHeaders);
      setWorkflows(res.data);
    } catch (err) {
      console.error('Error fetching workflows', err);
    }
  };

  const fetchApprovalInbox = async () => {
    try {
      const res = await axios.get('/api/workflows/requests?type=inbox', authHeaders);
      setInboxRequests(res.data);
    } catch (err) {
      console.error('Error fetching inbox', err);
    }
  };

  const fetchSubmittedRequests = async () => {
    try {
      const res = await axios.get('/api/workflows/requests?type=submitted', authHeaders);
      setApprovalRequests(res.data);
    } catch (err) {
      console.error('Error fetching submitted requests', err);
    }
  };

  const fetchAutomationRules = async () => {
    try {
      const res = await axios.get('/api/workflows/automation-rules', authHeaders);
      setAutomationRules(res.data);
    } catch (err) {
      console.error('Error fetching automation rules', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingWorkflowId(null);
    setWorkflowForm({
      name: '',
      description: '',
      module: 'Expense',
      status: 'DRAFT',
      stages: [{ stageNumber: 1, stageName: 'Manager Review', approverType: 'Role', approverRole: 'Manager', requirements: '' }]
    });
    setShowWorkflowModal(true);
  };

  const handleOpenEditModal = (wf) => {
    setEditingWorkflowId(wf._id);
    setWorkflowForm({
      name: wf.name || '',
      description: wf.description || '',
      module: wf.module || 'Expense',
      status: wf.status || 'DRAFT',
      stages: wf.stages && wf.stages.length ? wf.stages.map(s => ({ ...s })) : [{ stageNumber: 1, stageName: 'Manager Review', approverType: 'Role', approverRole: 'Manager', requirements: '' }]
    });
    setShowWorkflowModal(true);
  };

  const handleSaveWorkflow = async (e) => {
    e.preventDefault();
    try {
      if (editingWorkflowId) {
        await axios.put(`/api/workflows/${editingWorkflowId}`, workflowForm, authHeaders);
        setSuccessMessage('Workflow updated successfully!');
      } else {
        await axios.post('/api/workflows', workflowForm, authHeaders);
        setSuccessMessage('Workflow created successfully!');
      }
      setShowWorkflowModal(false);
      fetchWorkflows();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving workflow');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await axios.patch(`/api/workflows/${id}/status`, { status: newStatus }, authHeaders);
      fetchWorkflows();
      setSuccessMessage(`Workflow status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating status');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleOpenSubmitRequestModal = (wf) => {
    setSubmitRequestForm({
      workflowId: wf._id,
      title: `${wf.name} Request - ${new Date().toLocaleDateString()}`,
      description: `Approval request submitted under workflow: ${wf.name}`,
      amount: '',
      module: wf.module,
      referenceId: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      referenceModel: wf.module
    });
    setShowSubmitRequestModal(true);
  };

  const handleSubmitApprovalRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/workflows/requests', submitRequestForm, authHeaders);
      setSuccessMessage('Approval request submitted successfully!');
      setShowSubmitRequestModal(false);
      fetchSubmittedRequests();
      fetchApprovalInbox();
      setActiveTab('submitted');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting approval request');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleFetchRequestDetails = async (reqId) => {
    try {
      const res = await axios.get(`/api/workflows/requests/${reqId}`, authHeaders);
      setSelectedRequestDetails(res.data.request);
      setRequestHistory(res.data.history || []);
      setShowRequestDetailsModal(true);
    } catch (err) {
      setError('Error fetching request details');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedRequest) return;
    try {
      await axios.patch(`/api/workflows/requests/${selectedRequest._id}/decision`, {
        decision,
        comments: decisionComments
      }, authHeaders);
      setSuccessMessage(`Request successfully ${decision.toLowerCase()}!`);
      setShowDecisionModal(false);
      setSelectedRequest(null);
      setDecisionComments('');
      fetchApprovalInbox();
      fetchSubmittedRequests();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing decision');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSaveAutomationRule = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/workflows/automation-rules', automationForm, authHeaders);
      setSuccessMessage('Automation rule saved successfully!');
      setShowAutomationModal(false);
      fetchAutomationRules();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving automation rule');
      setTimeout(() => setError(''), 4000);
    }
  };

  const addStageToWorkflow = () => {
    setWorkflowForm({
      ...workflowForm,
      stages: [
        ...workflowForm.stages,
        { stageNumber: workflowForm.stages.length + 1, stageName: 'Secondary Review', approverType: 'Role', approverRole: 'Admin', requirements: '' }
      ]
    });
  };

  const removeStageFromWorkflow = (index) => {
    const newStages = workflowForm.stages.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stageNumber: idx + 1 }));
    setWorkflowForm({ ...workflowForm, stages: newStages });
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-blue-400" /> Workflow Automation & Approval System
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure multi-stage approval workflows, manage approval requests, and automation rules.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'workflows' && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition"
            >
              <Plus size={18} /> Create Workflow
            </button>
          )}
          {activeTab === 'automation' && (
            <button
              onClick={() => setShowAutomationModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition"
            >
              <Plus size={18} /> Add Automation Rule
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-3 font-medium text-sm border-b-2 transition flex items-center gap-2 ${activeTab === 'workflows' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Layers size={16} /> Workflows ({workflows.length})
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-3 font-medium text-sm border-b-2 transition flex items-center gap-2 ${activeTab === 'inbox' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Clock size={16} /> Approval Inbox ({inboxRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`pb-3 font-medium text-sm border-b-2 transition flex items-center gap-2 ${activeTab === 'submitted' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FileText size={16} /> My Requests ({approvalRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`pb-3 font-medium text-sm border-b-2 transition flex items-center gap-2 ${activeTab === 'automation' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Settings size={16} /> Automation Rules ({automationRules.length})
        </button>
      </div>

      {/* WORKFLOWS TAB */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((wf) => (
            <div key={wf._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-900/60 text-blue-300 text-xs px-2.5 py-1 rounded-md font-semibold">{wf.module}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${wf.status === 'ACTIVE' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'}`}>
                    {wf.status}
                  </span>
                </div>
                <h3
                  onClick={() => { setSelectedWorkflow(wf); setShowDetailsModal(true); }}
                  className="text-lg font-bold text-slate-100 mb-1 cursor-pointer hover:text-blue-400 transition"
                >
                  {wf.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{wf.description || 'No description provided.'}</p>
                <div className="border-t border-slate-700/60 pt-3 mb-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Approval Stages ({wf.stages?.length || 0})</h4>
                  <div className="space-y-2">
                    {wf.stages?.map((stage) => (
                      <div key={stage.stageNumber} className="bg-slate-900/60 p-2.5 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-blue-400 mr-2">Stage {stage.stageNumber}:</span>
                          <span className="text-slate-200">{stage.stageName}</span>
                        </div>
                        <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Approver: {stage.approverRole || stage.approverType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-700/60">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedWorkflow(wf); setShowDetailsModal(true); }}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1 transition"
                    title="View Details"
                  >
                    <Eye size={14} /> Details
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(wf)}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1 transition"
                    title="Edit Workflow"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                </div>
                <div className="flex gap-2">
                  {wf.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleOpenSubmitRequestModal(wf)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium text-white flex items-center gap-1 transition"
                      title="Submit Request Using Workflow"
                    >
                      <Send size={14} /> Submit Request
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleStatus(wf._id, wf.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${wf.status === 'ACTIVE' ? 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30' : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'}`}
                  >
                    {wf.status === 'ACTIVE' ? <Pause size={14} /> : <Play size={14} />}
                    {wf.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {workflows.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 bg-slate-800/40 rounded-xl border border-slate-800">
              <Layers size={48} className="mx-auto mb-3 opacity-40" />
              <p>No workflows configured yet. Create one to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* APPROVAL INBOX TAB */}
      {activeTab === 'inbox' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase border-b border-slate-700">
                <th className="p-4">Title / Module</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Workflow</th>
                <th className="p-4">Current Stage</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {inboxRequests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-750 transition">
                  <td className="p-4 font-medium text-slate-200">
                    <div>{req.title}</div>
                    <div className="text-xs text-slate-400">{req.module} {req.amount ? `• $${req.amount}` : ''}</div>
                  </td>
                  <td className="p-4 text-slate-300">{req.requester?.name || 'Unknown'}</td>
                  <td className="p-4 text-slate-300">{req.workflow?.name || 'N/A'}</td>
                  <td className="p-4">
                    <span className="bg-blue-900/50 text-blue-300 px-2.5 py-1 rounded text-xs font-semibold">
                      Stage {req.currentStageNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-amber-900/50 text-amber-300 px-2.5 py-1 rounded text-xs font-semibold">
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleFetchRequestDetails(req._id)}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      History
                    </button>
                    <button
                      onClick={() => { setSelectedRequest(req); setShowDecisionModal(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      Review & Decide
                    </button>
                  </td>
                </tr>
              ))}
              {inboxRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <Clock size={48} className="mx-auto mb-3 opacity-40" />
                    <p>No pending approvals in your inbox.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBMITTED REQUESTS TAB */}
      {activeTab === 'submitted' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase border-b border-slate-700">
                <th className="p-4">Title / Module</th>
                <th className="p-4">Workflow</th>
                <th className="p-4">Current Stage</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {approvalRequests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-750 transition">
                  <td className="p-4 font-medium text-slate-200">
                    <div>{req.title}</div>
                    <div className="text-xs text-slate-400">{req.module} {req.amount ? `• $${req.amount}` : ''}</div>
                  </td>
                  <td className="p-4 text-slate-300">{req.workflow?.name || 'N/A'}</td>
                  <td className="p-4">Stage {req.currentStageNumber}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${req.status === 'APPROVED' ? 'bg-emerald-900/60 text-emerald-300' : req.status === 'REJECTED' ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleFetchRequestDetails(req._id)}
                      className="bg-slate-700 hover:bg-slate-650 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ml-auto"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {approvalRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-40" />
                    <p>You have not submitted any approval requests.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* AUTOMATION RULES TAB */}
      {activeTab === 'automation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automationRules.map((rule) => (
            <div key={rule._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-indigo-900/60 text-indigo-300 text-xs px-2.5 py-1 rounded-md font-semibold">{rule.triggerType}</span>
                <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${rule.isActive ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                  {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">{rule.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{rule.description || 'No description provided.'}</p>
              <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg flex justify-between items-center">
                <span>Threshold Value:</span>
                <span className="font-bold text-blue-400">{rule.thresholdValue}</span>
              </div>
            </div>
          ))}
          {automationRules.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 bg-slate-800/40 rounded-xl border border-slate-800">
              <Settings size={48} className="mx-auto mb-3 opacity-40" />
              <p>No automation rules configured.</p>
            </div>
          )}
        </div>
      )}

      {/* WORKFLOW DETAILS MODAL */}
      {showDetailsModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
              <div>
                <span className="bg-blue-900/60 text-blue-300 text-xs px-2.5 py-1 rounded-md font-semibold">{selectedWorkflow.module}</span>
                <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedWorkflow.name}</h2>
              </div>
              <span className={`text-xs px-3 py-1 rounded-md font-semibold ${selectedWorkflow.status === 'ACTIVE' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'}`}>
                {selectedWorkflow.status}
              </span>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Description</h4>
                <p className="bg-slate-900 p-3 rounded-lg">{selectedWorkflow.description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Created By</span>
                  <span className="font-medium text-slate-200">{selectedWorkflow.createdBy?.name || 'Admin'} ({selectedWorkflow.createdBy?.email || 'N/A'})</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Creation Date</span>
                  <span className="font-medium text-slate-200">{new Date(selectedWorkflow.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Approval Stages in Sequence</h4>
                <div className="space-y-2">
                  {selectedWorkflow.stages?.map((stage) => (
                    <div key={stage.stageNumber} className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{stage.stageNumber}</span>
                          <span className="font-bold text-slate-100">{stage.stageName}</span>
                        </div>
                        {stage.requirements && <p className="text-xs text-slate-400 mt-1 ml-8">{stage.requirements}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-blue-300 font-medium">
                          Approver: {stage.approverRole || stage.approverType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
              {selectedWorkflow.status === 'ACTIVE' && (
                <button
                  onClick={() => { setShowDetailsModal(false); handleOpenSubmitRequestModal(selectedWorkflow); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                >
                  <Send size={16} /> Submit Request
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WORKFLOW MODAL */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-100">{editingWorkflowId ? 'Edit Approval Workflow' : 'Create Approval Workflow'}</h2>
            <form onSubmit={handleSaveWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Executive Expense Approval"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Workflow description..."
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Module</label>
                  <select
                    value={workflowForm.module}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, module: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Leave">Leave</option>
                    <option value="Purchase">Purchase</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Initial Status</label>
                  <select
                    value={workflowForm.status}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase">Approval Stages</span>
                  <button
                    type="button"
                    onClick={addStageToWorkflow}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Add Stage
                  </button>
                </div>
                {workflowForm.stages.map((stage, index) => (
                  <div key={index} className="bg-slate-900 p-3 rounded-lg border border-slate-700 mb-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-400">Stage {stage.stageNumber}</span>
                      {workflowForm.stages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStageFromWorkflow(index)}
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Stage Name (e.g. Finance Review)"
                      value={stage.stageName}
                      onChange={(e) => {
                        const newStages = [...workflowForm.stages];
                        newStages[index].stageName = e.target.value;
                        setWorkflowForm({ ...workflowForm, stages: newStages });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
                      required
                    />
                    <select
                      value={stage.approverRole}
                      onChange={(e) => {
                        const newStages = [...workflowForm.stages];
                        newStages[index].approverRole = e.target.value;
                        setWorkflowForm({ ...workflowForm, stages: newStages });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowWorkflowModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {editingWorkflowId ? 'Update Workflow' : 'Create Workflow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT APPROVAL REQUEST MODAL */}
      {showSubmitRequestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-100">Submit Approval Request</h2>
            <form onSubmit={handleSubmitApprovalRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  value={submitRequestForm.title}
                  onChange={(e) => setSubmitRequestForm({ ...submitRequestForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Q4 Software License Purchase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Module</label>
                  <input
                    type="text"
                    disabled
                    value={submitRequestForm.module}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-lg p-2.5 text-slate-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={submitRequestForm.amount}
                    onChange={(e) => setSubmitRequestForm({ ...submitRequestForm, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Optional amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description / Justification</label>
                <textarea
                  value={submitRequestForm.description}
                  onChange={(e) => setSubmitRequestForm({ ...submitRequestForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Provide details for approval..."
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowSubmitRequestModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST DETAILS & HISTORY MODAL */}
      {showRequestDetailsModal && selectedRequestDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
              <div>
                <span className="bg-blue-900/60 text-blue-300 text-xs px-2.5 py-1 rounded-md font-semibold">{selectedRequestDetails.module}</span>
                <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedRequestDetails.title}</h2>
              </div>
              <span className={`text-xs px-3 py-1 rounded-md font-semibold ${selectedRequestDetails.status === 'APPROVED' ? 'bg-emerald-900/60 text-emerald-300' : selectedRequestDetails.status === 'REJECTED' ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'}`}>
                {selectedRequestDetails.status}
              </span>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Workflow</span>
                  <span className="font-medium text-slate-200">{selectedRequestDetails.workflow?.name || 'N/A'}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Current Stage Number</span>
                  <span className="font-medium text-slate-200">Stage {selectedRequestDetails.currentStageNumber}</span>
                </div>
              </div>
              {selectedRequestDetails.description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Description</h4>
                  <p className="bg-slate-900 p-3 rounded-lg">{selectedRequestDetails.description}</p>
                </div>
              )}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Approval History / Timeline</h4>
                <div className="space-y-2">
                  {requestHistory.map((hist, i) => (
                    <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-blue-400">Stage {hist.stageNumber}: {hist.stageName}</span>
                        <span className="text-slate-400">{new Date(hist.timestamp || hist.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-slate-300 flex justify-between">
                        <span>Decision: <strong className="text-emerald-400">{hist.decision}</strong> by {hist.approver?.name || hist.approver?.email || (typeof hist.approver === 'object' ? JSON.stringify(hist.approver) : hist.approver) || 'User'}</span>
                        <span className="text-slate-400">Status: {hist.newStatus}</span>
                      </div>
                      {hist.comments && <div className="text-slate-400 italic mt-1">"{hist.comments}"</div>}
                    </div>
                  ))}
                  {requestHistory.length === 0 && (
                    <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg">No history recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={() => setShowRequestDetailsModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECISION MODAL */}
      {showDecisionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-slate-100">Review Approval Request</h2>
            <div className="bg-slate-900 p-3 rounded-lg mb-4 text-xs space-y-1 text-slate-300">
              <div className="font-bold text-slate-100 text-sm">{selectedRequest.title}</div>
              <div>Module: {selectedRequest.module} {selectedRequest.amount ? `• Amount: $${selectedRequest.amount}` : ''}</div>
              <div>Current Stage: Stage {selectedRequest.currentStageNumber}</div>
              <div>Requester: {selectedRequest.requester?.name || selectedRequest.requester?.email || (typeof selectedRequest.requester === 'object' ? JSON.stringify(selectedRequest.requester) : selectedRequest.requester) || 'Unknown'}</div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Comments / Reason</label>
              <textarea
                value={decisionComments}
                onChange={(e) => setDecisionComments(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Add comments for your decision..."
                rows="3"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDecisionModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision('REJECTED')}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={() => handleDecision('APPROVED')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
              >
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATION RULE MODAL */}
      {showAutomationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-100">Create Automation Rule</h2>
            <form onSubmit={handleSaveAutomationRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={automationForm.name}
                  onChange={(e) => setAutomationForm({ ...automationForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Critical Low Stock Alert"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Trigger Type</label>
                <select
                  value={automationForm.triggerType}
                  onChange={(e) => setAutomationForm({ ...automationForm, triggerType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="LOW_STOCK">Low Stock Alert</option>
                  <option value="OVERDUE_INVOICE">Overdue Invoice Alert</option>
                  <option value="PENDING_APPROVAL_REMINDER">Pending Approval Reminder</option>
                  <option value="TASK_DEADLINE">Task Deadline Notification</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Threshold Value</label>
                <input
                  type="number"
                  value={automationForm.thresholdValue}
                  onChange={(e) => setAutomationForm({ ...automationForm, thresholdValue: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  value={automationForm.description}
                  onChange={(e) => setAutomationForm({ ...automationForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  rows="2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAutomationModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;
