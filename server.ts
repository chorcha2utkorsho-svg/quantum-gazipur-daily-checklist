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

  // AI Strategic Analysis endpoint for Office Assistant / Supervisor
  app.post('/api/ai-analyze', async (req: Request, res: Response) => {
    try {
      const { date, employeesSummary, teamStats } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      const promptData = `
তারিখ: ${date || 'আজ'}
মোট সক্রিয় কর্মী: ${teamStats?.activeStaff || employeesSummary?.length || 0} জন
গড় টাস্ক সম্পন্ন হার: ${teamStats?.averageCompletion || 0}%
মোট অনিষ্পন্ন/পেন্ডিং কাজ: ${teamStats?.totalPendingItems || 0} টি

কর্মীভিত্তিক তুলনামূলক রিপোর্ট:
${(employeesSummary || [])
  .map(
    (emp: any) => `
- নাম: ${emp.name} (রোল: ${emp.role})
  সম্পন্ন: ${emp.doneTasks}/${emp.totalTasks} (${emp.completionRate}%)
  পেন্ডিং টাস্ক ও কারণ: ${
    emp.pendingReasons && emp.pendingReasons.length > 0
      ? emp.pendingReasons.map((p: any) => `"${p.task}": ${p.reason}`).join('; ')
      : 'সব কাজ সম্পন্ন'
  }`
  )
  .join('\n')}
`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemInstruction = `You are an elite operational executive and managerial strategist advising the Office Assistant / Operations Supervisor of "Quantum Gazipur Cell (Raji sir Team)".
Your role is to analyze the daily comparative activity reports of employees across different roles (Accounts, Front Desk, Sales, Logistics, etc.) and provide crisp, professional, actionable strategic advice in clear and dignified Bengali.

Structure your response into the following 4 sections using Markdown:
1. 📊 **সার্বিক কার্যকারিতা ও তুলনামূলক সারসংক্ষেপ**: সামগ্রিক টিমের পারফরম্যান্স এবং কর্মীদের কাজের গতি মূল্যায়ন।
2. ⚠️ **চিহ্নিত সমস্যা ও বাধার ক্ষেত্রসমূহ (Critical Bottlenecks)**: যেসব কাজ পেন্ডিং রয়েছে এবং কর্মীদের দেওয়া কারণগুলোর অন্তর্নিহিত ঝুঁকি চিহ্নিত করা।
3. 🎯 **অফিস সহকারীর পরবর্তী সিদ্ধান্ত ও তাৎক্ষণিক পদক্ষেপ (Actionable Decisions)**: সুপারভাইজার হিসেবে তার আজকেই কী কী সুনির্দিষ্ট সিদ্ধান্ত নেওয়া উচিত।
4. 🔄 **কর্মী পদায়ন ও দায়িত্ব পুনর্বণ্টন পরামর্শ**: কাজের চাপ সামলাতে বা সমস্যা সমাধানে কোন কর্মীকে কীভাবে কাজে লাগানো যায় বা রোলে পরিবর্তন আনা প্রয়োজন কি না।

Keep the tone constructive, authoritative, empathetic, and highly practical.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `দয়া করে নিচের কর্মীবাহিনীর দৈনিক কাজের ডেটা পর্যালোচনা করে অফিস সহকারীর সিদ্ধান্ত গ্রহণের জন্য গভীর কৌশলগত বিশ্লেষণ ও পরামর্শ প্রদান করুন:\n\n${promptData}`,
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
        (e.pendingReasons || []).map((r: any) => `${e.name} (${e.role}): ${r.task} - ${r.reason}`)
      );

      const fallbackAnalysis = `### 📊 সার্বিক কার্যকারিতা ও তুলনামূলক সারসংক্ষেপ
- **তারিখ**: ${date || 'চলতি কার্যদিবস'}
- **টিমের কার্যক্ষমতা**: সক্রিয় কর্মীদের গড় সম্পন্ন হার **${teamStats?.averageCompletion || 0}%**।
- **শীর্ষ পারফর্মার**: ${
        highPerformers.length > 0
          ? highPerformers.map((e: any) => `${e.name} (${e.role} - ${e.completionRate}%)`).join(', ')
          : 'সকলের কাজে মাঝারি অগ্রগতি রয়েছে।'
      }
- **বিশেষ মনোযোগ প্রয়োজন**: ${
        lowPerformers.length > 0
          ? lowPerformers.map((e: any) => `${e.name} (${e.role} - ${e.completionRate}%)`).join(', ')
          : 'কোনো কর্মীর কাজ আশঙ্কাজনকভাবে ঝুলে নেই।'
      }

---

### ⚠️ চিহ্নিত সমস্যা ও বাধার ক্ষেত্রসমূহ (Bottlenecks)
- মোট **${teamStats?.totalPendingItems || 0}টি টাস্ক** এখনো অনিষ্পন্ন অবস্থায় রয়েছে।
${
  allPendingReasons.length > 0
    ? allPendingReasons.slice(0, 5).map((r: string) => `- 🔍 ${r}`).join('\n')
    : '- কোনো টাস্কের বিলম্বিত কারণ নথিভুক্ত হয়নি।'
}
- অর্থনৈতিক ও ক্লোজিং টাস্কগুলোতে (যেমন: ক্যাশ, বিকাশ এমআর ও লগ আপডেট) বিলম্ব হলে দিনের শেষে হিসাব মেলাতে জটিলতা তৈরি হতে পারে।

---

### 🎯 অফিস সহকারীর পরবর্তী সিদ্ধান্ত ও তাৎক্ষণিক পদক্ষেপ
1. **তাত্ক্ষণিক ফলো-আপ**: যেসকল কর্মীর সম্পন্ন হার ৭০%-এর নিচে, তাদের সাথে এখনই ৫ মিনিটের স্ট্যান্ডআপ মিটিং করে বাধার কারণ জেনে সমাধান দিন।
2. **পেন্ডিং কারণ যাচাই**: নথিভুক্ত কারণগুলো যৌক্তিক নাকি প্রক্রিয়াগত ত্রুটি—তা যাচাই করে ক্লিয়ারেন্স দিন।
3. **দিনের শেষ রিপোর্ট লক**: প্রতিদিন অফিস ত্যাগের পূর্বে সকল কর্মীর রিপোর্ট শতভাগ নিশ্চিত করে রাজী স্যার বা শীর্ষ ম্যানেজমেন্টে জমা দিন।

---

### 🔄 কর্মী পদায়ন ও দায়িত্ব পুনর্বণ্টন পরামর্শ
- **ভূমিকা পুনর্বণ্টন**: ফ্রন্ট ডেস্ক ও অ্যাকাউন্টস রোলের কর্মীদের ওপর কাজের চাপ বেশি থাকলে কাস্টমার রিলেশনস বা লজিস্টিকস থেকে সাময়িক সাপোর্ট দিন।
- **নতুন কর্মী নিয়োগ ও মূল্যায়ন**: নতুন কর্মীদের প্রাথমিক ৩ দিন মেন্টরিং রোলে রাখুন এবং তাদের কার্যকারিতা দেখে স্থায়ী পদের দায়িত্ব নির্ধারণ করুন।`;

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
