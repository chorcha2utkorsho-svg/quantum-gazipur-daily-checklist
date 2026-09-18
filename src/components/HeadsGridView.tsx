import React, { useState, useRef } from 'react';
import {
  Receipt,
  Wallet,
  HeartHandshake,
  Calendar,
  Compass,
  MessageSquare,
  CheckSquare,
  Layers,
  Shield,
  FileSpreadsheet,
  Upload,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Search,
  BookOpen,
  Award,
  CircleDot,
  X,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { WorkflowCategory, WorkflowTask } from '../data/workflowData';
import { DailyLogItem, Employee } from '../types';

interface HeadsGridViewProps {
  categories: WorkflowCategory[];
  tasks: WorkflowTask[];
  dailyLogs: Record<string, DailyLogItem>;
  onSelectHead: (categoryId: string) => void;
  currentUser: Employee | null;
  selectedDate: string;
  onImportCustomHeadsAndTasks?: (newCategories: WorkflowCategory[], newTasks: WorkflowTask[]) => void;
}

// Icon mapping helper
function getHeadIcon(iconName: string, categoryId: string) {
  const normalized = (categoryId + ' ' + iconName).toLowerCase();
  if (normalized.includes('bill') || normalized.includes('voucher') || normalized.includes('receipt')) {
    return <Receipt className="w-6 h-6 text-blue-600" />;
  }
  if (normalized.includes('fund') || normalized.includes('wallet') || normalized.includes('cash')) {
    return <Wallet className="w-6 h-6 text-emerald-600" />;
  }
  if (normalized.includes('donation') || normalized.includes('patron') || normalized.includes('heart')) {
    return <HeartHandshake className="w-6 h-6 text-amber-600" />;
  }
  if (normalized.includes('inside') || normalized.includes('home') || normalized.includes('event')) {
    return <Calendar className="w-6 h-6 text-cyan-600" />;
  }
  if (normalized.includes('outside') || normalized.includes('campaign') || normalized.includes('compass')) {
    return <Compass className="w-6 h-6 text-violet-600" />;
  }
  if (normalized.includes('explore') || normalized.includes('outreach')) {
    return <Compass className="w-6 h-6 text-rose-600" />;
  }
  if (normalized.includes('comm') || normalized.includes('crm') || normalized.includes('message')) {
    return <MessageSquare className="w-6 h-6 text-teal-600" />;
  }
  if (normalized.includes('account') || normalized.includes('audit') || normalized.includes('ledger')) {
    return <FileText className="w-6 h-6 text-indigo-600" />;
  }
  return <Layers className="w-6 h-6 text-sky-600" />;
}

export const HeadsGridView: React.FC<HeadsGridViewProps> = ({
  categories,
  tasks,
  dailyLogs,
  onSelectHead,
  currentUser,
  selectedDate,
  onImportCustomHeadsAndTasks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddHeadModalOpen, setIsAddHeadModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [newHeadName, setNewHeadName] = useState('');
  const [newHeadNameBn, setNewHeadNameBn] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter categories by search
  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.nameBn && cat.nameBn.toLowerCase().includes(q)) ||
      cat.id.toLowerCase().includes(q)
    );
  });

  // Calculate stats for each category
  const getCategoryStats = (categoryId: string) => {
    const catTasks = tasks.filter((t) => t.category === categoryId);
    const total = catTasks.length;
    const done = catTasks.filter((t) => dailyLogs[t.name]?.status === 'done').length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percentage, remaining: total - done };
  };

  // Total overview stats
  const totalTasksCount = tasks.length;
  const totalDoneCount = tasks.filter((t) => dailyLogs[t.name]?.status === 'done').length;
  const overallPercentage = totalTasksCount > 0 ? Math.round((totalDoneCount / totalTasksCount) * 100) : 0;

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const newCategories: WorkflowCategory[] = [];
        const newTasks: WorkflowTask[] = [];

        // Check if sheets represent heads or if there's a master sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

          if (jsonData.length === 0) return;

          // If there's multiple sheets, each sheet can be a Head!
          // Or if single sheet with columns: "Head", "Task Name", "Details", "Priority"
          const headerRow = (jsonData[0] || []).map((h: any) => String(h).trim().toLowerCase());
          const headColIdx = headerRow.findIndex((h: string) => h.includes('head') || h.includes('category') || h.includes('বিভাগ'));
          const taskColIdx = headerRow.findIndex((h: string) => h.includes('task') || h.includes('name') || h.includes('কাজ') || h.includes('কাজের নাম'));
          const detailsColIdx = headerRow.findIndex((h: string) => h.includes('detail') || h.includes('বিবরণ') || h.includes('বর্ণনা'));
          const codeColIdx = headerRow.findIndex((h: string) => h.includes('code') || h.includes('আইডি'));
          const priorityColIdx = headerRow.findIndex((h: string) => h.includes('priority') || h.includes('গুরুত্ব'));

          if (headColIdx !== -1 && taskColIdx !== -1) {
            // Master table format
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (!row || !row[taskColIdx]) continue;
              const headName = String(row[headColIdx] || 'GENERAL').trim();
              const taskName = String(row[taskColIdx]).trim();
              const details = detailsColIdx !== -1 && row[detailsColIdx] ? String(row[detailsColIdx]).trim() : '';
              const code = codeColIdx !== -1 && row[codeColIdx] ? String(row[codeColIdx]).trim() : `TK-${i}`;
              const priorityVal = priorityColIdx !== -1 && row[priorityColIdx] ? String(row[priorityColIdx]).toLowerCase() : 'medium';
              const priority = priorityVal.includes('high') ? 'high' : priorityVal.includes('low') ? 'low' : 'medium';

              // Ensure category exists
              let cat = newCategories.find((c) => c.name.toLowerCase() === headName.toLowerCase());
              if (!cat) {
                cat = {
                  id: headName,
                  name: headName,
                  nameBn: headName,
                  taskCount: 0,
                  badgeBg: 'bg-indigo-50',
                  badgeText: 'text-indigo-700',
                  badgeBorder: 'border-indigo-200',
                  activeBg: 'bg-indigo-600 text-white',
                  iconName: 'Layers',
                };
                newCategories.push(cat);
              }
              cat.taskCount++;

              newTasks.push({
                id: `custom-excel-${i}-${Date.now()}`,
                code,
                name: taskName,
                details,
                category: cat.id,
                categoryBn: cat.nameBn,
                priority,
                order: i,
              });
            }
          } else {
            // Sheet represents the Head!
            const catId = sheetName.trim();
            let cat = newCategories.find((c) => c.id === catId);
            if (!cat) {
              cat = {
                id: catId,
                name: catId,
                nameBn: catId,
                taskCount: 0,
                badgeBg: 'bg-sky-50',
                badgeText: 'text-sky-700',
                badgeBorder: 'border-sky-200',
                activeBg: 'bg-sky-600 text-white',
                iconName: 'Layers',
              };
              newCategories.push(cat);
            }

            // Loop through rows
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (!row || !row[0]) continue;
              const taskName = String(row[0]).trim();
              const details = row[1] ? String(row[1]).trim() : '';
              cat.taskCount++;

              newTasks.push({
                id: `custom-excel-sheet-${catId}-${i}-${Date.now()}`,
                code: `${catId.slice(0, 3).toUpperCase()}-${i.toString().padStart(2, '0')}`,
                name: taskName,
                details,
                category: cat.id,
                categoryBn: cat.nameBn,
                priority: 'medium',
                order: i,
              });
            }
          }
        });

        if (newCategories.length > 0 && newTasks.length > 0) {
          onImportCustomHeadsAndTasks?.(newCategories, newTasks);
          setUploadStatus(`সফল হয়েছে! ${newCategories.length}টি হেড এবং মোট ${newTasks.length}টি কাজ এক্সেল থেকে যুক্ত হয়েছে।`);
          setTimeout(() => {
            setIsUploadModalOpen(false);
            setUploadStatus(null);
          }, 2000);
        } else {
          setUploadStatus('কোনো কার্যকর ডাটা পাওয়া যায়নি। অনুগ্রহ করে এক্সেল ফাইলের কলাম ফরম্যাট চেক করুন।');
        }
      } catch (err: any) {
        setUploadStatus('ফাইল পড়তে সমস্যা হয়েছে: ' + (err.message || 'অজানা ত্রুটি'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Add custom manual head
  const handleAddManualHead = () => {
    if (!newHeadName.trim()) return;
    const catId = newHeadName.trim().toUpperCase();
    const newCat: WorkflowCategory = {
      id: catId,
      name: newHeadName.trim(),
      nameBn: newHeadNameBn.trim() || newHeadName.trim(),
      taskCount: 0,
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      activeBg: 'bg-emerald-600 text-white',
      iconName: 'Layers',
    };
    onImportCustomHeadsAndTasks?.([newCat], []);
    setIsAddHeadModalOpen(false);
    setNewHeadName('');
    setNewHeadNameBn('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              কার্যক্রমের হেডসমূহ (Workflow Heads)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
              {categories.length}টি হেড
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            যেকোনো হেডের বক্সে ক্লিক করে তার ভেতরের নির্দিষ্ট কাজের তালিকায় প্রবেশ করুন।
          </p>
        </div>

        {/* Action Buttons: Import Excel & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="হেড খুঁজুন..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 w-36 sm:w-44 transition"
            />
          </div>

          {/* Import Excel Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="এক্সেল ফাইল থেকে নতুন হেড ও কাজের তালিকা ইম্পোর্ট করুন"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>এক্সেল ফাইল ইম্পোর্ট</span>
          </button>

          {/* Add Manual Head */}
          <button
            type="button"
            onClick={() => setIsAddHeadModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="ম্যানুয়ালি নতুন হেড যোগ করুন"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>নতুন হেড যোগ</span>
          </button>
        </div>
      </div>

      {/* Main Heads Grid: 3 columns layout matching the hand-drawn sketch exactly! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredCategories.map((cat, idx) => {
          const stats = getCategoryStats(cat.id);
          const isDone = stats.total > 0 && stats.done === stats.total;

          return (
            <div
              key={cat.id || idx}
              onClick={() => onSelectHead(cat.id)}
              className="group relative bg-white hover:bg-sky-50/30 rounded-2xl border border-slate-200 hover:border-sky-400 p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px]"
            >
              {/* Top of Card: Icon & Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-200 group-hover:border-sky-300 flex items-center justify-center shadow-2xs transition-colors">
                    {getHeadIcon(cat.iconName, cat.id)}
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : stats.done > 0
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isDone ? '১০০% সম্পন্ন' : `${stats.done}/${stats.total} সম্পন্ন`}
                  </span>
                </div>

                {/* Head Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors tracking-tight line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                  {cat.nameBn || cat.name}
                </p>
              </div>

              {/* Bottom of Card: Progress Bar & Enter Prompt */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-500'
                        : stats.percentage > 50
                        ? 'bg-sky-500'
                        : stats.percentage > 0
                        ? 'bg-indigo-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">
                    {stats.total} টি কাজ
                  </span>
                  <div className="flex items-center gap-1 font-bold text-sky-600 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-all">
                    <span>তালিকায় যান</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold">কোনো হেড পাওয়া যায়নি।</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-sky-600 hover:underline"
          >
            সার্চ ক্লিয়ার করুন
          </button>
        </div>
      )}

      {/* Modal: Import Excel File */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-2xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">এক্সেল থেকে হেড ও কাজ ইম্পোর্ট</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার কাছে থাকা এক্সেল (.xlsx, .xls) অথবা CSV ফাইলটি এখানে নির্বাচন করুন। ফাইলের শিটগুলো অথবা 'Head' কলাম স্বয়ংক্রিয়ভাবে আলাদা বক্স হিসেবে তৈরি হবে এবং ভিতরের কাজগুলো যুক্ত হবে।
            </p>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-8 h-8 text-emerald-600" />
              <div className="text-xs font-bold text-emerald-900">
                এক্সেল ফাইল নির্বাচন করতে এখানে ক্লিক করুন
              </div>
              <div className="text-[11px] text-slate-500">
                সাপোর্টেড ফরম্যাট: .xlsx, .xls, .csv
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploadStatus && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                {uploadStatus}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Head */}
      {isAddHeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-2xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">নতুন হেড যোগ করুন</h3>
              </div>
              <button
                onClick={() => setIsAddHeadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  হেডের নাম (ইংরেজি) *
                </label>
                <input
                  type="text"
                  value={newHeadName}
                  onChange={(e) => setNewHeadName(e.target.value)}
                  placeholder="যেমন: ACCOUNTS, LOGISTICS, ইত্যাদি"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  হেডের বিবরণ / নাম (বাংলা)
                </label>
                <input
                  type="text"
                  value={newHeadNameBn}
                  onChange={(e) => setNewHeadNameBn(e.target.value)}
                  placeholder="যেমন: হিসাব ও অডিট"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddHeadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAddManualHead}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition"
              >
                হেড তৈরি করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
