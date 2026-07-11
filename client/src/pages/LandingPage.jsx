import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import {
  UploadCloud,
  Cpu,
  LayoutDashboard,
  Filter,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  CheckCircle,
  FileText
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col dot-grid">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-xs font-semibold text-blue-700 mb-6 animate-bounce">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Powering Academic & Career Workflows</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl font-sans leading-none">
            Your AI-Powered <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Deadline & Task Extraction
            </span>{' '}
            Platform
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
            Stop manually copying dates from PDFs, screenshots, or emails. Upload circulars, placement letters, and WhatsApp notices. Let TaskPulse AI capture dates instantly.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 transition-all hover:-translate-y-0.5"
            >
              Start Free Today
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Interactive Mockup */}
          <div className="mt-16 mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-10 blur-xl -z-10" />
            <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-inner bg-slate-50 aspect-[16/10] flex flex-col">
              {/* Header Bar */}
              <div className="bg-white border-b border-slate-200 h-10 px-4 flex items-center justify-between shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-2xs font-semibold text-slate-400 select-none">TaskPulse AI Dashboard</div>
                <div className="w-12" />
              </div>
              {/* Content Panel */}
              <div className="p-6 flex flex-col md:flex-row gap-6 grow overflow-hidden select-none text-left">
                <div className="flex-1 space-y-4">
                  <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="h-3 w-12 bg-slate-100 rounded" />
                      <div className="h-6 w-8 bg-blue-100 rounded" />
                    </div>
                    <div className="h-20 bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="h-3 w-12 bg-slate-100 rounded" />
                      <div className="h-6 w-8 bg-rose-100 rounded" />
                    </div>
                    <div className="h-20 bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="h-3 w-12 bg-slate-100 rounded" />
                      <div className="h-6 w-8 bg-emerald-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-24 bg-white rounded-xl border border-slate-250 p-4 flex justify-between items-center shadow-sm">
                      <div className="space-y-2 grow">
                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-blue-50 rounded-full" />
                          <div className="h-5 w-20 bg-red-50 rounded-full" />
                        </div>
                      </div>
                      <div className="h-9 w-24 bg-blue-600 rounded-lg shrink-0" />
                    </div>
                    <div className="h-20 bg-white rounded-xl border border-slate-200 p-4 opacity-50 flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-3.5 w-40 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-4 shrink-0 flex flex-col justify-center items-center text-center space-y-3">
                  <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-28 bg-slate-200 rounded mx-auto" />
                    <div className="h-2 w-36 bg-slate-100 rounded mx-auto" />
                  </div>
                  <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Seamless Automation
            </h2>
            <p className="mt-4 text-slate-600">
              Stop stressing about scattered schedules. TaskPulse AI captures data from multiple formats and aggregates it inside a unified workspace.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mb-4 shadow-sm shadow-blue-50">
                <UploadCloud className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Drag & Drop Upload</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Accepts images, text files, and PDFs. Simply drop them into the workspace to begin processing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mb-4 shadow-sm shadow-blue-50">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Optical OCR</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Extracts text from screenshots, scanned circulars, and event flyers instantly using OCR.Space.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mb-4 shadow-sm shadow-blue-50">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Gemini Task Structuring</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Understands raw context and extracts clear dates, categories, priorities, and descriptions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mb-4 shadow-sm shadow-blue-50">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Unified Dashboard</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Filter by Today, This Week, or category, track status metrics, and manage priorities with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Three Steps to Total Control
            </h2>
            <p className="mt-4 text-slate-600">
              No manual inputs. No copy-pasting. Just upload and let the platform do the work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-20 right-20 h-0.5 bg-slate-200 -z-10 -translate-y-6" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-md font-bold text-blue-600 text-lg mb-6 z-10">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Files</h3>
              <p className="text-sm text-slate-600 max-w-xs">
                Drag and drop your syllabus PDF, internship circular image, or college fee email screenshot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-md font-bold text-blue-600 text-lg mb-6 z-10">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">AI Extraction</h3>
              <p className="text-sm text-slate-600 max-w-xs">
                Our OCR parses characters, and Google Gemini organizes the items, finding deadlines and priorities.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-md font-bold text-blue-600 text-lg mb-6 z-10">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Review & Complete</h3>
              <p className="text-sm text-slate-600 max-w-xs">
                View everything in a professional startup board. Get weekly insights and mark items complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute -inset-10 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-40 blur-3xl -z-10" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center rounded-3xl border border-blue-100 bg-blue-50/30 p-12 shadow-sm relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Never miss an interview or assignment again.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            TaskPulse AI structures dates, times, and categories in seconds so you can execute instead of tracking.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              TaskPulse<span className="text-blue-600">AI</span>
            </span>
            <span className="text-xs text-slate-400 select-none">|</span>
            <span className="text-xs text-slate-500">© 2026 TaskPulse. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs text-slate-500 font-medium">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="mailto:support@taskpulse.ai" className="hover:text-blue-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
