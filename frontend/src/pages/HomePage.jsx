import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Calendar, 
  FileText, 
  Briefcase, 
  CheckSquare, 
  TrendingUp, 
  UserCheck, 
  DollarSign, 
  Package, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Lock, 
  ArrowRight, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  Layers
} from 'lucide-react';
import Chatbot from '../components/Chatbot';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-400" />,
      title: "Employee Management",
      description: "Manage comprehensive employee profiles, roles, departments, designations, and documentations."
    },
    {
      icon: <Building2 className="w-8 h-8 text-indigo-400" />,
      title: "Department Management",
      description: "Structure organization hierarchy, assign department heads, and track inter-department metrics."
    },
    {
      icon: <Calendar className="w-8 h-8 text-teal-400" />,
      title: "Attendance Management",
      description: "Track daily check-ins, check-outs, attendance history, and automated summary reports."
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-400" />,
      title: "Leave Management",
      description: "Streamline leave requests, manager approvals, leave balances, and calendar overviews."
    },
    {
      icon: <Briefcase className="w-8 h-8 text-amber-400" />,
      title: "Project Management",
      description: "Organize company projects, milestones, resource allocation, and progress tracking."
    },
    {
      icon: <CheckSquare className="w-8 h-8 text-green-400" />,
      title: "Task Management",
      description: "Assign tasks, set priorities, monitor deadlines, and track completion status across teams."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-rose-400" />,
      title: "Sales Management",
      description: "Manage sales pipelines, quotations, orders, and customer accounts efficiently."
    },
    {
      icon: <UserCheck className="w-8 h-8 text-cyan-400" />,
      title: "Customer Management",
      description: "Maintain customer relationship history, contact logs, and commercial records in one place."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-emerald-400" />,
      title: "Finance Management",
      description: "Monitor income, expenses, invoices, financial dashboards, and transaction histories."
    },
    {
      icon: <Package className="w-8 h-8 text-orange-400" />,
      title: "Inventory Management",
      description: "Track stock levels, product catalogs, categories, suppliers, and automated low-stock alerts."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-sky-400" />,
      title: "Reports & Analytics",
      description: "Generate comprehensive analytical reports across HR, Finance, Sales, and Inventory operations."
    }
  ];

  const benefits = [
    {
      icon: <Layers className="w-6 h-6 text-blue-400" />,
      title: "Centralized Management",
      description: "Unify all business departments into a single source of truth, eliminating data silos and communication gaps."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Improved Productivity",
      description: "Automate routine administrative tasks, streamline workflows, and empower staff to focus on strategic goals."
    },
    {
      icon: <Clock className="w-6 h-6 text-teal-400" />,
      title: "Real-Time Information",
      description: "Access up-to-the-minute operational metrics, inventory counts, attendance data, and financial statuses instantly."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      title: "Secure Role-Based Access",
      description: "Protect sensitive corporate assets with granular RBAC permissions tailored for Super Admins, Managers, and Employees."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "Better Business Decisions",
      description: "Leverage robust analytical dashboards and detailed reports to make informed, data-driven executive choices."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">EnterpriseERP</span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-medium hover:text-blue-400 transition-colors">Home</a>
              <a href="#features" className="text-sm font-medium hover:text-blue-400 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium hover:text-blue-400 transition-colors">About</a>
              <a href="#benefits" className="text-sm font-medium hover:text-blue-400 transition-colors">Benefits</a>
              <a href="#contact" className="text-sm font-medium hover:text-blue-400 transition-colors">Contact</a>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#172554] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white"
            >
              Home
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white"
            >
              Features
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white"
            >
              About
            </a>
            <a 
              href="#benefits" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white"
            >
              Benefits
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white"
            >
              Contact
            </a>
            <div className="pt-4 flex flex-col gap-3">
              <Link 
                to="/login" 
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0B1120] to-[#0B1120] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5" /> Next-Gen Enterprise Solution
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Manage Your Entire Business in One Powerful ERP Platform.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
              Streamline your HR, Finance, Sales, Inventory, and Projects with enterprise-grade precision, role-based security, and real-time operational intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-300 bg-[#172554] hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
              >
                Sign In <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Dashboard Preview / Illustration Mockup */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-30 pointer-events-none" />
            <div className="relative bg-[#172554] border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-400 font-mono">EnterpriseERP - Executive Dashboard Preview</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Total Employees</div>
                  <div className="text-2xl font-bold text-white">248</div>
                  <div className="text-xs text-emerald-400 mt-2 font-medium">+12% this month</div>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Monthly Revenue</div>
                  <div className="text-2xl font-bold text-white">$142,500</div>
                  <div className="text-xs text-emerald-400 mt-2 font-medium">+8.4% growth</div>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Active Projects</div>
                  <div className="text-2xl font-bold text-white">34</div>
                  <div className="text-xs text-blue-400 mt-2 font-medium">98% on track</div>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Inventory Health</div>
                  <div className="text-2xl font-bold text-white">99.4%</div>
                  <div className="text-xs text-emerald-400 mt-2 font-medium">Optimized</div>
                </div>
              </div>

              <div className="bg-[#0B1120] p-6 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Operational Synchronicity</h4>
                  <p className="text-xs text-slate-400 mt-1">All modules interconnected securely with role-based access control.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800/50">System Online</span>
                  <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-400 text-xs font-semibold border border-blue-800/50">Secure SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0B1120]/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Comprehensive Enterprise Modules</h2>
            <p className="text-base sm:text-lg text-slate-400">
              Designed to cover every operational aspect of your growing organization with modular perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-[#172554] border border-slate-700/60 rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#0B1120] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-400 text-xs font-semibold uppercase tracking-wide border border-indigo-800/50">
                About EnterpriseERP
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Empowering Organizations to Scale with Complete Operational Control.
              </h2>
              <p className="text-slate-400 leading-relaxed">
                EnterpriseERP is a state-of-the-art MERN stack Enterprise Resource Planning platform engineered to help organizations manage business operations from one centralized platform. By breaking down data silos across HR, Finance, Sales, Inventory, and Projects, our system provides leadership with actionable real-time insights and secure, role-based workflows.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="bg-[#172554] p-4 rounded-xl border border-slate-700/60">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-400 mt-1">Centralized Architecture</div>
                </div>
                <div className="bg-[#172554] p-4 rounded-xl border border-slate-700/60">
                  <div className="text-2xl font-bold text-white">Granular</div>
                  <div className="text-xs text-slate-400 mt-1">Role-Based Security</div>
                </div>
              </div>
            </div>

            <div className="bg-[#172554] border border-slate-700/60 rounded-2xl p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-semibold text-white">Core Architectural Pillars</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/50 border border-blue-700/50 flex items-center justify-center shrink-0 mt-1">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Enterprise Security</h4>
                    <p className="text-xs text-slate-400 mt-1">JWT authentication paired with strict role-based access control protecting all sensitive endpoints.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-teal-900/50 border border-teal-700/50 flex items-center justify-center shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">High Performance</h4>
                    <p className="text-xs text-slate-400 mt-1">Optimized MongoDB queries and responsive React frontend delivering lightning-fast execution.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-900/50 border border-purple-700/50 flex items-center justify-center shrink-0 mt-1">
                    <Layers className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Modular Scalability</h4>
                    <p className="text-xs text-slate-400 mt-1">Clean separation of concerns allowing departments to operate independently while synchronizing data seamlessly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-[#0B1120]/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Why Leading Enterprises Choose Us</h2>
            <p className="text-base sm:text-lg text-slate-400">
              Transform your organizational workflow and unlock unprecedented efficiency gains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-[#172554] border border-slate-700/60 rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#0B1120] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Get in Touch with Our Team</h2>
            <p className="text-base sm:text-lg text-slate-400">
              Have questions about implementation, pricing, or custom enterprise deployments? Reach out today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#172554] border border-slate-700/60 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-center mx-auto text-blue-400">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Email Us</h3>
              <p className="text-sm text-slate-400">
                <a href="mailto:info@softwalletinnovativetechnologies.cloud" className="hover:text-blue-400 transition-colors underline">
                  info@softwalletinnovativetechnologies.cloud
                </a>
              </p>
            </div>

            <div className="bg-[#172554] border border-slate-700/60 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Call Us</h3>
              <div className="flex flex-col space-y-1 text-sm text-slate-400">
                <a href="tel:+917599741491" className="hover:text-emerald-400 transition-colors">+91 7599741491</a>
                <a href="tel:+919596393658" className="hover:text-emerald-400 transition-colors">+91 9596393658</a>
              </div>
            </div>

            <div className="bg-[#172554] border border-slate-700/60 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Headquarters</h3>
              <p className="text-sm text-slate-400">Kupwara, Jammu & Kashmir - 193222, India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1120] border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">EnterpriseERP</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-slate-400">
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </div>

            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} EnterpriseERP Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Interactive Chatbot */}
      <Chatbot />
    </div>
  );
};

export default HomePage;
