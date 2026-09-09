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
