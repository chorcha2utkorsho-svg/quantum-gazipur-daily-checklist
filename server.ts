import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Strategic Analysis endpoint for Raji Sir (Boss) & Branch Supervisors
  app.post('/api/ai-analyze', async (req: Request, res: Response) => {
    try {
      const { date, employeesSummary, teamStats, branchStats, isBossView } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      const chowrastaStaff = (employeesSummary || []).filter((e: any) => e.branch === 'chowrasta');
      const rajbariStaff = (employeesSummary || []).filter((e: any) => e.branch === 'rajbari');

      const promptData = `
Date: ${date || 'Today'}
View Mode: ${isBossView ? "Central Command Dashboard (Dual Office Overview)" : 'Branch Supervisor Dashboard'}
Total Active Personnel: ${teamStats?.activeStaff || employeesSummary?.length || 0}
Average Task Completion: ${teamStats?.averageCompletion || 0}%
Total Pending Items: ${teamStats?.totalPendingItems || 0}

[1. Gazipur Branch]:
- Staff Count: ${chowrastaStaff.length}
- Staff Breakdown & Progress:
${chowrastaStaff
  .map(
    (emp: any) =>
      `  * ${emp.name} (${emp.role}): Completed ${emp.doneTasks}/${emp.totalTasks} (${emp.completionRate}%); Pending: ${
        emp.pendingReasons && emp.pendingReasons.length > 0
          ? emp.pendingReasons.map((p: any) => `"${p.task}": ${p.reason}`).join('; ')
          : 'All Completed'
      }`
  )
  .join('\n')}

[2. Gazipur Sadar Office]:
- Staff Count: ${rajbariStaff.length}
- Staff Breakdown & Progress:
${rajbariStaff
  .map(
    (emp: any) =>
      `  * ${emp.name} (${emp.role}): Completed ${emp.doneTasks}/${emp.totalTasks} (${emp.completionRate}%); Pending: ${
        emp.pendingReasons && emp.pendingReasons.length > 0
          ? emp.pendingReasons.map((p: any) => `"${p.task}": ${p.reason}`).join('; ')
          : 'All Completed'
      }`
  )
  .join('\n')}
`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemInstruction = `You are a world-class organizational executive and strategic advisor advising Mr. Raji ("Raji Sir"), the Main Boss & Central Director of "Quantum Gazipur Cell", supervising two offices:
1. 1. Gazipur Branch
2. 2. Gazipur Sadar Office

Both offices run the exact same daily management framework and 20 core operational tasks.

Analyze the dual-office daily performance, compare Gazipur Branch vs Gazipur Sadar Office, and provide actionable, respectful, and authoritative strategic counsel in English.

Structure your response using the following 4 Markdown sections:
1. 👑 **Executive Summary (Dual-Office Overview)**: Comparative synthesis between Gazipur Branch and Gazipur Sadar Office, identifying which office is ahead and overall operational health.
2. 🏢 **Branch-Specific Observations & Identified Bottlenecks**: Analysis of specific staff members and pending task causes in Gazipur Branch vs Gazipur Sadar Office.
3. 🎯 **Immediate Directives & Orders for Branch Incharges**: Specific actionable instructions for Raji Sir to issue today to the Gazipur Branch Incharge and Sadar Office Incharge.
4. 🔄 **Personnel Allocation & Cross-Branch Optimization**: Strategies for reallocating duties or cross-office logistics to handle workload surges.

Keep the tone constructive, authoritative, empathetic, and executive-ready.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Generate an executive comparative analysis and actionable strategic counsel for Raji Sir across the two offices (1. Gazipur Branch, 2. Gazipur Sadar Office):\n\n${promptData}`,
                  },
                ],
              },
            ],
            config: {
              systemInstruction,
              temperature: 0.4,
            },
          });

          const aiText = response.text || '';
          return res.json({ success: true, analysis: aiText, source: 'gemini-3.8-flash' });
        } catch (genAiErr: any) {
          console.warn('Gemini API call failed, generating comprehensive local fallback:', genAiErr?.message);
        }
      }

      // Intelligent Fallback Analysis Engine if API key is not configured
      const lowPerformers = (employeesSummary || []).filter((e: any) => e.completionRate < 70);
      const highPerformers = (employeesSummary || []).filter((e: any) => e.completionRate >= 90);
      const allPendingReasons = (employeesSummary || []).flatMap((e: any) =>
        (e.pendingReasons || []).map((r: any) => `${e.name} (${e.role} - ${e.branch === 'chowrasta' ? 'Gazipur Branch' : 'Gazipur Sadar Office'}): ${r.task} - ${r.reason}`)
      );

      const fallbackAnalysis = `### 👑 Executive Summary (Dual-Office Overview)
- **Date**: ${date || 'Current Working Day'}
- **Central Observation**: Across the two centers of Quantum Gazipur Cell (**1. Gazipur Branch** and **2. Gazipur Sadar Office**), overall average task completion is **${teamStats?.averageCompletion || 0}%**.
- **Comparative State**:
  - **Gazipur Branch**: ${chowrastaStaff.length} active staff on duty.
  - **Gazipur Sadar Office**: ${rajbariStaff.length} active staff on duty.
- **Top Performers**: ${
        highPerformers.length > 0
          ? highPerformers.map((e: any) => `${e.name} (${e.completionRate}%)`).slice(0, 4).join(', ')
          : 'Staff performance is progressing steadily across both branches.'
      }

---

### 🏢 Branch-Specific Observations & Bottlenecks
- A total of **${teamStats?.totalPendingItems || 0} task(s)** are currently pending across both offices.
${
  allPendingReasons.length > 0
    ? allPendingReasons.slice(0, 6).map((r: string) => `- 🔍 ${r}`).join('\n')
    : '- No critical roadblocks reported; routine end-of-day closing is in progress.'
}
- **Critical Risk Alert**: Verify that cash closing, bKash MR reconciliations, and QMIS sync are completed before 5:30 PM at both locations.

---

### 🎯 Immediate Directives for Branch Incharges
1. **Gazipur Branch Incharge Directive**: Ensure 100% completion of front desk reconciliations and lock cash and MR reports by 5:00 PM.
2. **Gazipur Sadar Office Incharge Directive**: Rapidly clear pending donor interactions and complete sales follow-up documentation.
3. **Central Closing Mandate**: Submit verified daily checklist logs to Raji Sir's executive desk by 6:00 PM.

---

### 🔄 Personnel Allocation & Cross-Branch Optimization
- **Workload Balancing**: In the event of audits, heavy visitor footfall, or special programs, temporarily assign mobile coordinator support between branches.
- **Monthly Recognition**: Introduce a monthly performance badge to encourage healthy, collaborative excellence between Gazipur Branch and Gazipur Sadar Office.`;

      return res.json({ success: true, analysis: fallbackAnalysis, source: 'executive-rule-engine' });
    } catch (err: any) {
      console.error('AI analysis error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to generate analysis' });
    }
  });

  // Dedicated AI Strategic Insight endpoint for Office Assistant workflow optimization
  app.post('/api/ai-office-assistant-insights', async (req: Request, res: Response) => {
    try {
      const { assistant, date, completionLogs, summaryStats } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const assistantName = assistant?.name || 'Office Assistant';
      const assistantId = assistant?.employee_id || 'OA-01';
      const branchName =
        assistant?.branch === 'rajbari'
          ? '2. Gazipur Sadar Office'
          : assistant?.branch === 'chowrasta'
          ? '1. Gazipur Branch'
          : 'Quantum Gazipur Cell';

      const total = summaryStats?.total || (completionLogs || []).length || 0;
      const done = summaryStats?.done || (completionLogs || []).filter((l: any) => l.status === 'done').length || 0;
      const pending = summaryStats?.pending || (completionLogs || []).filter((l: any) => l.status === 'pending').length || 0;
      const percentage = summaryStats?.percentage || (total > 0 ? Math.round((done / total) * 100) : 0);

      const doneTasks = (completionLogs || []).filter((l: any) => l.status === 'done');
      const pendingTasks = (completionLogs || []).filter((l: any) => l.status === 'pending');

      const logsContext = `
Office Assistant: ${assistantName} (${assistantId})
Branch: ${branchName}
Date: ${date || 'Today'}
Total Tasks Assigned: ${total}
Tasks Completed: ${done} (${percentage}%)
Tasks Pending: ${pending}

[COMPLETED TASKS LOG]:
${
  doneTasks.length > 0
    ? doneTasks
        .map((t: any, i: number) => `${i + 1}. [${t.category || 'General'}] ${t.task_name} ${t.completed_at ? `(Completed at: ${t.completed_at})` : ''}`)
        .slice(0, 35)
        .join('\n')
    : 'No tasks marked as done yet.'
}

[PENDING TASKS & RECORDED REASONS]:
${
  pendingTasks.length > 0
    ? pendingTasks
        .map(
          (t: any, i: number) =>
            `${i + 1}. [${t.category || 'General'}] ${t.task_name} (Priority: ${t.priority || 'Normal'}) - Reason: "${t.reason_for_pending || 'No reason provided'}"`
        )
        .slice(0, 30)
        .join('\n')
    : 'All tasks currently completed or no pending logs recorded.'
}
`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const systemInstruction = `You are an elite operational efficiency strategist and executive organizational consultant for Quantum Foundation's Gazipur Cell.
You are analyzing the daily completion logs of the Office Assistant (In-Charge) who is responsible for daily office opening, meditation/sadhona atmosphere, accounts & cash management, front-desk coordination, donor service, and evening closing/QMIS reporting under Central Director Raji Sir.

Your primary mission:
Analyze the completion logs, detect bottlenecks, time leaks, and friction points, and provide EXACTLY 3 highly actionable, concrete workflow optimization steps specifically for this Office Assistant to dramatically improve efficiency, punctuality, and task completion.

You MUST return valid, parseable JSON conforming to this exact structure:
{
  "summary": "2-3 concise sentences synthesizing the daily completion logs and operational pace.",
  "overallHealth": "Optimal" | "Requires Attention" | "At Risk",
  "velocityScore": "e.g. 84/100",
  "topBottleneckCategory": "Name of category with most friction (e.g. Cash Closing & Reconciliation, Donor Follow-up, or Morning Routines)",
  "actionableSteps": [
    {
      "stepNumber": 1,
      "title": "Actionable imperative title (e.g. Front-Load Morning Routine & Desk Setup by 9:30 AM)",
      "category": "Time Management | Process Automation | Closing Protocol | Communication",
      "priority": "critical" | "high" | "medium",
      "problemIdentified": "Direct observation from the logs showing what caused delay or backlog",
      "actionPlan": [
        "Specific step 1 to execute",
        "Specific step 2 to execute",
        "Specific step 3 to execute"
      ],
      "expectedImpact": "Quantifiable efficiency gain (e.g. Saves 30-40 mins daily, guarantees 100% on-time closing)",
      "recommendedTimeSlot": "Specific time window (e.g. 09:00 AM - 09:30 AM)"
    },
    {
      "stepNumber": 2,
      "title": "Second actionable title",
      "category": "...",
      "priority": "...",
      "problemIdentified": "...",
      "actionPlan": ["...", "..."],
      "expectedImpact": "...",
      "recommendedTimeSlot": "..."
    },
    {
      "stepNumber": 3,
      "title": "Third actionable title",
      "category": "...",
      "priority": "...",
      "problemIdentified": "...",
      "actionPlan": ["...", "..."],
      "expectedImpact": "...",
      "recommendedTimeSlot": "..."
    }
  ],
  "executiveTakeaway": "A clear directive for Raji Sir and branch leadership to assist the office assistant.",
  "quantumAffirmation": "A brief, uplifting closing thought aligning with Quantum Foundation's spirit of dedication and excellence."
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Analyze these daily completion logs for the Office Assistant and generate exactly 3 actionable workflow optimization steps in JSON format:\n\n${logsContext}`,
                  },
                ],
              },
            ],
            config: {
              systemInstruction,
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);

          if (parsed && Array.isArray(parsed.actionableSteps) && parsed.actionableSteps.length > 0) {
            return res.json({
              success: true,
              data: parsed,
              source: 'gemini-3.8-flash',
            });
          }
        } catch (genAiErr: any) {
          console.warn('Gemini API call for Office Assistant insights failed or returned unexpected schema, using dynamic fallback engine:', genAiErr?.message);
        }
      }

      // Dynamic Rule-Based Fallback Analytical Engine
      const pendingCategories = pendingTasks.map((t: any) => t.category || 'Operational Routines');
      const categoryFrequency: Record<string, number> = {};
      pendingCategories.forEach((c: string) => {
        categoryFrequency[c] = (categoryFrequency[c] || 0) + 1;
      });
      const topCategory = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Closing & Financials';

      const fallbackSteps = [
        {
          stepNumber: 1,
          title: 'Front-Load Morning Desk Setup & Atmosphere Routines Before 9:30 AM',
          category: 'Time Management',
          priority: percentage < 60 ? 'critical' : 'high',
          problemIdentified: `Logs indicate ${pending} pending items. Delaying initial setup tasks (Desk Set-up, Meditation, Plant check) creates an operational ripple that pushes evening duties past the target 5:30 PM window.`,
          actionPlan: [
            'Arrive 15 minutes prior to opening to verify hardware, lights, and meditation sound setup.',
            'Batch all physical inspection checklist items (Desk, Plants, Cleanliness) into a single 20-minute unbroken sweep.',
            'Log and check off opening items before addressing incoming visitors or phone calls.',
          ],
          expectedImpact: 'Saves 25-35 minutes during peak mid-day hours and establishes a disciplined, focused environment.',
          recommendedTimeSlot: '09:00 AM - 09:30 AM',
        },
        {
          stepNumber: 2,
          title: `Pre-Audit & Batch-Process ${topCategory} at 2:00 PM`,
          category: 'Process Optimization',
          priority: 'high',
          problemIdentified: `Recorded pending logs show friction in "${topCategory}". Waiting until late afternoon leads to backlog accumulation when donor footfall and phone inquiries spike.`,
          actionPlan: [
            'Schedule a dedicated 30-minute quiet focus block at 2:00 PM to clear all accumulated vouchers, receipts, and communication logs.',
            'Pre-reconcile bKash MR tokens and donation entries before bank counter closing.',
            'Proactively request missing details from field coordinators or donors before 3:00 PM instead of waiting for end of day.',
          ],
          expectedImpact: 'Eliminates 80% of end-of-day data entry panic and prevents mismatched cash balances.',
          recommendedTimeSlot: '02:00 PM - 02:45 PM',
        },
        {
          stepNumber: 3,
          title: 'Enforce Dual-Check Closing Protocol & Automated QMIS Synchronization by 5:00 PM',
          category: 'Closing Protocol',
          priority: 'critical',
          problemIdentified: 'End-of-day closing tasks (Cash Closing, Mobile Placing, Log Update, Report to Raji Sir) are at risk of being rushed or delayed when issues accumulate from earlier shifts.',
          actionPlan: [
            'Initiate cash drawer counting and physical token reconciliation promptly at 4:45 PM.',
            'Securely lock official mobile devices and cash registers following the standard two-step verification checklist.',
            'Submit the final daily completion log summary to Raji Sir’s executive dashboard no later than 5:30 PM.',
          ],
          expectedImpact: 'Guarantees 100% compliance with central audit standards and ensures zero delayed daily logs.',
          recommendedTimeSlot: '04:45 PM - 05:30 PM',
        },
      ];

      const fallbackResult = {
        summary: `Performance analysis of ${assistantName}'s daily logs reveals a completion rate of ${percentage}% (${done}/${total} tasks completed). Operational velocity is steady, but optimization in morning front-loading and pre-closing reconciliations will streamline the workflow significantly.`,
        overallHealth: percentage >= 85 ? 'Optimal' : percentage >= 60 ? 'Requires Attention' : 'At Risk',
        velocityScore: `${percentage}/100`,
        topBottleneckCategory: topCategory,
        actionableSteps: fallbackSteps,
        executiveTakeaway: `Raji Sir can empower ${assistantName} by mandating a 2:00 PM quiet-hour for reconciliations and conducting a 5-minute review at 5:15 PM to ensure all closing items are locked.`,
        quantumAffirmation: 'Every completed duty with sincere attention is a service to human wellness. Through disciplined time-blocking, we create harmony and effortless excellence.',
      };

      return res.json({
        success: true,
        data: fallbackResult,
        source: 'strategic-heuristic-engine',
      });
    } catch (err: any) {
      console.error('AI Office Assistant insight error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to generate insight' });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
