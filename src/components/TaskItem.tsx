import React, { useRef, useEffect } from 'react';
import { Check, AlertCircle, Clock, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { DailyLogItem } from '../types';

interface TaskItemProps {
  item: DailyLogItem;
  index: number;
  onToggleStatus: (taskName: string) => void;
  onUpdateReason: (taskName: string, reason: string) => void;
}

const COMMON_REASONS = [
  'Awaiting client response',
  'Postponed to afternoon',
  'Technical / server delay',
  'Pending external approvals',
  'Not required today',
];

export const TaskItem: React.FC<TaskItemProps> = ({
  item,
  index,
  onToggleStatus,
  onUpdateReason,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDone = item.status === 'done';

  // Auto-resize textarea according to scrollHeight
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(28, textareaRef.current.scrollHeight)}px`;
    }
  }, [item.reason_for_pending, isDone]);

  if (isDone) {
    return (
      <div
        id={`task-item-${index + 1}`}
        className="flex items-center group p-2.5 rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 select-none"
      >
        {/* Checked Box */}
        <button
          id={`task-toggle-${index + 1}`}
          type="button"
          onClick={() => onToggleStatus(item.task_name)}
          aria-label={`Mark task ${item.task_name} as pending`}
          className="w-5 h-5 rounded border border-emerald-500 bg-emerald-500/20 flex items-center justify-center mr-3 text-emerald-400 flex-shrink-0 cursor-pointer transition-all hover:scale-105"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Task Name */}
        <span
          onClick={() => onToggleStatus(item.task_name)}
          className="text-sm text-[#e5e5e5] flex-1 truncate cursor-pointer"
        >
          {index + 1}. {item.task_name}
        </span>

        {/* Completed Timestamp */}
        {item.completed_at && (
          <span className="text-[10px] text-[#8e9299] font-mono opacity-60 group-hover:opacity-100 transition-opacity">
            {new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    );
  }

  // Pending State with Input
  return (
    <div
      id={`task-item-${index + 1}`}
      className="flex flex-col p-2.5 bg-amber-500/5 rounded border border-amber-500/20 transition-all duration-200"
    >
      <div className="flex items-center mb-1">
        {/* Unchecked Box */}
        <button
          id={`task-toggle-${index + 1}`}
          type="button"
          onClick={() => onToggleStatus(item.task_name)}
          aria-label={`Mark task ${item.task_name} as done`}
          className="w-5 h-5 rounded border border-white/20 mr-3 flex-shrink-0 cursor-pointer hover:border-emerald-400/80 transition-colors"
        />

        {/* Task Title */}
        <span
          onClick={() => onToggleStatus(item.task_name)}
          className="text-sm font-medium text-amber-200 flex-1 truncate cursor-pointer"
        >
          {index + 1}. {item.task_name}
        </span>

        <span className="text-[10px] uppercase tracking-wider text-amber-400 font-mono">
          Pending
        </span>
      </div>

      {/* Auto-expanding Input for Reason */}
      <div className="ml-8 mt-0.5 space-y-1">
        <textarea
          ref={textareaRef}
          id={`reason-input-${index + 1}`}
          rows={1}
          value={item.reason_for_pending || ''}
          onChange={(e) => onUpdateReason(item.task_name, e.target.value)}
          placeholder="Reason for pending..."
          className="w-full bg-transparent border-none text-[12px] italic text-[#8e9299] focus:outline-none placeholder:text-white/20 focus:text-amber-100 resize-none py-0.5"
        />

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {COMMON_REASONS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onUpdateReason(item.task_name, chip)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                item.reason_for_pending === chip
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-[#8e9299] hover:text-[#e5e5e5]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
