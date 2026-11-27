import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCcw } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! Welcome to EnterpriseERP. I am your assistant. How can I help you learn about our ERP platform today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What is EnterpriseERP?",
    "Employee Management",
    "Attendance Management",
    "Leave Management",
    "Project Management",
    "Finance Management",
    "Inventory Management",
    "User Roles"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Hello! Welcome to EnterpriseERP. I am your assistant. How can I help you learn about our ERP platform today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = (textToSend) => {
    const query = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!query) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text: query, timestamp: currentTime };
    setMessages(prev => [...prev, userMsg]);
    
    if (textToSend === undefined) {
      setInputMessage('');
    }
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getBotResponse(query);
      const botMsg = { sender: 'bot', text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const getBotResponse = (query) => {
    const q = query.toLowerCase().trim();

    // 1. Exact / Keyword Greetings Check (MUST be checked FIRST)
    if (
      q === 'hello' || q === 'hi' || q === 'hey' || q === 'good evening' ||
      q.startsWith('hello ') || q.startsWith('hi ') || q.startsWith('hey ')
    ) {
      return "Hello! Welcome to EnterpriseERP. How can I help you today?";
    }
    if (q === 'good morning' || q.startsWith('good morning')) {
      return "Good morning! Welcome to EnterpriseERP. What would you like to explore?";
    }
    if (q === 'good afternoon' || q.startsWith('good afternoon')) {
      return "Good afternoon! Welcome to EnterpriseERP. How can I assist you with your operations today?";
    }
    if (q === 'how are you' || q === 'how are you?' || q.includes('how are you')) {
      return "I'm doing great! I'm here to help you understand EnterpriseERP. What would you like to know?";
    }

    // 2. Thank-you messages
    if (
      q === 'thanks' || q === 'thank you' || q === 'thank you so much' ||
      q.includes('thank you') || q.includes('thanks')
    ) {
      return "You're welcome! I'm happy to help. Let me know if you need help with anything else.";
    }

    // 3. Farewells & Help
    if (q === 'bye' || q === 'goodbye' || q === 'see you' || q.includes('goodbye') || q.includes('farewell')) {
      return "Goodbye! Feel free to reach out whenever you have questions about EnterpriseERP. Have a wonderful day!";
    }
    if (q === 'help' || q === 'what can you do' || q.includes('what can you do')) {
      return "I can help you explore EnterpriseERP modules (HR, Attendance, Leave, Projects, Tasks, Sales, Finance, Inventory), explain user roles (Super Admin, HR Manager, Finance Manager, Employee, etc.), guide you on login, or explain features. Just ask!";
    }

    // 4. ERP Knowledge Base - General ERP (with exact required response text)
    if (
      q.includes('what is enterpriseerp') ||
      q.includes('what is enterprise erp') ||
      q.includes('tell me about enterpriseerp') ||
      q.includes('explain enterpriseerp') ||
      q.includes('what does this erp system do') ||
      q.includes('what is this platform') ||
      q.includes('what is this erp') ||
      q.includes('about enterpriseerp')
    ) {
      return "EnterpriseERP is an integrated Enterprise Resource Planning platform that helps organizations manage their business operations in one place. It brings together modules such as Human Resources, Attendance, Leave Management, Projects, Tasks, Sales, Finance, and Inventory, helping teams manage information and workflows more efficiently.";
    }
    if (q.includes('features') || q.includes('modules') || q.includes('what can it do') || q.includes('what problems does it solve')) {
      return "EnterpriseERP features 11 core modules: Employee Management, Department Management, Attendance Management, Leave Management, Project Management, Task Management, Sales Management, Customer Management, Finance Management, Inventory Management, and Reports & Analytics. It solves data silos and communication gaps by unifying corporate operations.";
    }
    if (q.includes('who can use') || q.includes('suitable for organizations') || q.includes('organizations')) {
      return "Yes! EnterpriseERP is fully suitable for growing and established organizations looking for secure role-based operational control across departments.";
    }

    // 5. Authentication and User Roles
    if (q.includes('role') || q.includes('super_admin') || q.includes('hr_manager') || q.includes('finance_manager') || q.includes('sales_manager') || q.includes('inventory_manager') || q.includes('employee')) {
      return "EnterpriseERP supports 6 primary roles with granular RBAC permissions:\n• SUPER_ADMIN: Full system administration and oversight.\n• HR_MANAGER: Employee records, departments, attendance, and leave approvals.\n• FINANCE_MANAGER: Income, expenses, invoices, and financial reports.\n• SALES_MANAGER: Sales pipelines, quotations, orders, and customers.\n• INVENTORY_MANAGER: Stock levels, products, categories, suppliers, and low-stock alerts.\n• EMPLOYEE: Personal attendance check-in/out, leave requests, tasks, and profile.";
    }
    if (q.includes('log in') || q.includes('login') || q.includes('sign in') || q.includes('access my dashboard') || q.includes('how do i log in')) {
      return "You can log in by clicking the 'Login' button in the top navigation bar or on the hero section. Access requires valid employee or admin credentials assigned by your organization.";
    }
    if (q.includes('forget my password') || q.includes('forgot password')) {
      return "Password recovery functionality is currently managed directly by your organization's Super Administrator or IT support desk.";
    }
    if (q.includes('unauthorized') || q.includes('why am i getting an unauthorized error')) {
      return "Unauthorized errors occur when your assigned user role does not have permission to access a specific restricted module or endpoint. Please contact your administrator if you believe this is an error.";
    }

    // 6. Employee Management
    if (q.includes('employee management') || q.includes('employee records') || q.includes('employee details')) {
      return "Employee Management allows HR managers and Super Admins to maintain comprehensive employee records, track personal details, department assignments, job designations, and documentations securely.";
    }

    // 7. Department Management
    if (q.includes('department management') || q.includes('departments')) {
      return "Department Management structures the organization hierarchy, assigns department heads, links employees to specific departments, and tracks inter-department metrics.";
    }

    // 8. Attendance Management
    if (q.includes('attendance') || q.includes('check in') || q.includes('check out')) {
      return "Attendance Management lets employees check in and check out daily while allowing managers to review attendance histories, monitor punctuality, and generate automated attendance summary reports.";
    }

    // 9. Leave Management
    if (q.includes('leave') || q.includes('apply for leave') || q.includes('leave status') || q.includes('approve leave')) {
      return "Leave Management enables staff to submit formal leave requests specifying leave type and dates, check leave balances, track manager approval statuses in real time, and view calendar overviews.";
    }

    // 10. Project Management
    if (q.includes('project management') || q.includes('projects')) {
      return "Project Management organizes company initiatives into structured projects with milestones, timelines, resource allocation, team assignments, and progress monitoring.";
    }

    // 11. Task Management
    if (q.includes('task') || q.includes('priorities') || q.includes('task status')) {
      return "Task Management allows managers and team leads to create tasks, assign them to staff, set priorities, and monitor progress across supported statuses: TODO, IN_PROGRESS, UNDER_REVIEW, COMPLETED, and ON_HOLD.";
    }

    // 12. Sales and Customer Management
    if (q.includes('sales') || q.includes('customer') || q.includes('quotation') || q.includes('sales order')) {
      return "Sales & Customer Management maintains customer relationship history, contact logs, commercial records, sales pipelines, quotations, and sales orders efficiently.";
    }

    // 13. Finance Management
    if (q.includes('finance') || q.includes('income') || q.includes('expense') || q.includes('invoice') || q.includes('transaction')) {
      return "Finance Management monitors business income, operational expenses, invoices, transaction histories, and provides executive financial dashboards and reports.";
    }

    // 14. Inventory Management
    if (q.includes('inventory') || q.includes('product') || q.includes('supplier') || q.includes('stock') || q.includes('low-stock')) {
      return "Inventory Management tracks product catalogs, categories, stock levels, suppliers, stock movements, and generates automated low-stock alerts when items fall below thresholds.";
    }

    // 15. Reports and Notifications
    if (q.includes('report') || q.includes('analytics') || q.includes('notification') || q.includes('announcement') || q.includes('activity logging')) {
      return "Reports & Analytics generate comprehensive analytical reports across HR, Finance, Sales, and Inventory operations, while notifications, announcements, and activity logging keep all staff informed of system events.";
    }

    // Default Fallback for Unrecognized / Unrelated Questions
    return "I specialize in EnterpriseERP modules (HR, Finance, Inventory, Attendance, Leave, Projects, Sales) and user roles. For specific personal account data or unrelated topics like '" + query + "', please log in to your dashboard or contact your system administrator.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-600/50 flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none"
          aria-label="Open Chatbot"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[540px] bg-[#0B1120] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#172554] px-4 py-3.5 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  EnterpriseERP Assistant <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear Chat"
                aria-label="Clear Chat"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close Chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0B1120]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-slate-700'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col max-w-[78%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-[#172554] text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.timestamp && (
                    <span className={`text-[10px] text-slate-500 mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-blue-400" />
                </div>
                <div className="bg-[#172554] px-3 py-2 rounded-xl border border-slate-700/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-2 bg-[#172554]/50 border-t border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 bg-[#0B1120] hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-700/80 rounded-full text-[11px] whitespace-nowrap transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#172554] border-t border-slate-700/60 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about features, login, HR, finance..."
              className="flex-1 bg-[#0B1120] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
