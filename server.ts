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
তারিখ: ${date || 'আজ'}
ভিউ মোড: ${isBossView ? 'মেইন বস রাজি স্যারের সেন্ট্রাল ড্যাশবোর্ড (দুটো ব্রাঞ্চ যৌথ চিত্র)' : 'ব্রাঞ্চ সুপারভাইজার ড্যাশবোর্ড'}
মোট সক্রিয় কর্মী: ${teamStats?.activeStaff || employeesSummary?.length || 0} জন
গড় টাস্ক সম্পন্ন হার: ${teamStats?.averageCompletion || 0}%
মোট অনিষ্পন্ন/পেন্ডিং কাজ: ${teamStats?.totalPendingItems || 0} টি

[১। চৌরাস্তা ব্রাঞ্চ (Chowrasta Branch)]:
- কর্মী সংখ্যা: ${chowrastaStaff.length} জন
- কর্মী বিবরণ ও প্রগ্রেস:
${chowrastaStaff
  .map(
    (emp: any) =>
      `  * ${emp.name} (${emp.role}): সম্পন্ন ${emp.doneTasks}/${emp.totalTasks} (${emp.completionRate}%); পেন্ডিং: ${
        emp.pendingReasons && emp.pendingReasons.length > 0
          ? emp.pendingReasons.map((p: any) => `"${p.task}": ${p.reason}`).join('; ')
          : 'সব সম্পন্ন'
      }`
  )
  .join('\n')}

[২। রাজবাড়ি ব্রাঞ্চ (Rajbari Branch)]:
- কর্মী সংখ্যা: ${rajbariStaff.length} জন
- কর্মী বিবরণ ও প্রগ্রেস:
${rajbariStaff
  .map(
    (emp: any) =>
      `  * ${emp.name} (${emp.role}): সম্পন্ন ${emp.doneTasks}/${emp.totalTasks} (${emp.completionRate}%); পেন্ডিং: ${
        emp.pendingReasons && emp.pendingReasons.length > 0
          ? emp.pendingReasons.map((p: any) => `"${p.task}": ${p.reason}`).join('; ')
          : 'সব সম্পন্ন'
      }`
  )
  .join('\n')}
`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemInstruction = `You are a world-class organizational executive and strategic advisor advising Mr. Raji ("রাজি স্যার"), the Main Boss & Central Director of "Quantum Gazipur Cell", supervising two branches:
1. চৌরাস্তা ব্রাঞ্চ (Chowrasta Branch)
2. রাজবাড়ি ব্রাঞ্চ (Rajbari Branch)

Both branches run the exact same daily management framework and 20 core operational tasks.

Analyze the dual-branch daily performance, compare Chowrasta vs Rajbari, and provide actionable, respectful, and authoritative strategic counsel in dignified Bengali (বাংলা).

Structure your response using the following 4 Markdown sections:
1. 👑 **রাজি স্যারের এক্সিকিউটিভ সামারি (উভয় ব্রাঞ্চের এক নজরে চিত্র)**: চৌরাস্তা ও রাজবাড়ি ব্রাঞ্চের পারফরম্যান্সের তুলনামূলক চিত্র, কোন ব্রাঞ্চ এগিয়ে এবং সার্বিক সেল স্বাস্থ্য।
2. 🏢 **ব্রাঞ্চভিত্তিক পর্যবেক্ষণ ও চিহ্নিত জটিলতা (Chowrasta vs Rajbari Issues)**: চৌরাস্তা ও রাজবাড়ি ব্রাঞ্চের নির্দিষ্ট কর্মী ও পেন্ডিং কাজের কারণসমূহের বিশ্লেষণ।
3. 🎯 **রাজি স্যারের তাৎক্ষণিক সিদ্ধান্ত ও দুই ব্রাঞ্চ ইনচার্জকে নির্দেশনা**: রাজি স্যার আজকেই চৌরাস্তা ইনচার্জ এবং রাজবাড়ি ইনচার্জকে কী কী সুনির্দিষ্ট নির্দেশ দেবেন।
4. 🔄 **কর্মী পদায়ন ও সম্পদ সমন্বয় পরামর্শ**: দুই ব্রাঞ্চের কাজের চাপ সামলাতে কর্মী দায়িত্ব পুনর্বণ্টন বা আন্তঃব্রাঞ্চ সহায়তার কৌশল।

Keep the tone constructive, authoritative, empathetic, and highly executive.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `রাজি স্যারের বস একাউন্টের জন্য গাজীপুরের দুটো ব্রাঞ্চের (১। চৌরাস্তা ব্রাঞ্চ, ২। রাজবাড়ি ব্রাঞ্চ) আজকের কর্মতৎপরতার তুলনামূলক বিশ্লেষণ ও পরামর্শ প্রস্তুত করুন:\n\n${promptData}`,
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
        (e.pendingReasons || []).map((r: any) => `${e.name} (${e.role} - ${e.branch === 'chowrasta' ? 'চৌরাস্তা' : 'রাজবাড়ি'}): ${r.task} - ${r.reason}`)
      );

      const fallbackAnalysis = `### 👑 রাজি স্যারের এক্সিকিউটিভ সামারি (উভয় ব্রাঞ্চের এক নজরে চিত্র)
- **তারিখ**: ${date || 'চলতি কার্যদিবস'}
- **সেন্ট্রাল পর্যবেক্ষণ**: গাজীপুর সেলের অধীন **১। চৌরাস্তা ব্রাঞ্চ** এবং **২। রাজবাড়ি ব্রাঞ্চ**-এর মোট সক্রিয় কর্মীদের সার্বিক গড় সম্পন্ন হার **${teamStats?.averageCompletion || 0}%**।
- **উভয় ব্রাঞ্চের তুলনামূলক অবস্থা**: 
  - **চৌরাস্তা ব্রাঞ্চ**: মোট ${chowrastaStaff.length} জন সক্রিয় কর্মী কার্যক্রম পরিচালনা করছেন।
  - **রাজবাড়ি ব্রাঞ্চ**: মোট ${rajbariStaff.length} জন সক্রিয় কর্মী কার্যক্রম পরিচালনা করছেন।
- **শীর্ষ পারফর্মার কর্মী**: ${
        highPerformers.length > 0
          ? highPerformers.map((e: any) => `${e.name} (${e.completionRate}%)`).slice(0, 4).join(', ')
          : 'উভয় ব্রাঞ্চের কর্মীদের কাজে স্বাভাবিক গতি রয়েছে।'
      }

---

### 🏢 ব্রাঞ্চভিত্তিক পর্যবেক্ষণ ও চিহ্নিত জটিলতা (Bottlenecks)
- পুরো সেলে সর্বমোট **${teamStats?.totalPendingItems || 0}টি টাস্ক** পেন্ডিং রয়েছে।
${
  allPendingReasons.length > 0
    ? allPendingReasons.slice(0, 6).map((r: string) => `- 🔍 ${r}`).join('\n')
    : '- কোনো কর্মী বিলম্বের বড় কোনো কারণ উল্লেখ করেননি; রুটিন ক্লোজিং বাকি।'
}
- **বিশেষ ঝুঁকি সতর্কতা**: দিনের শেষভাগে ক্যাশ ক্লোজিং, বিকাশ এমআর এবং কিউএমআইএস আপডেট উভয় ব্রাঞ্চেই সময়মতো সম্পন্ন হচ্ছে কিনা তা নিশ্চিত করা প্রয়োজন।

---

### 🎯 রাজি স্যারের তাৎক্ষণিক সিদ্ধান্ত ও ইনচার্জদের নির্দেশনা
1. **চৌরাস্তা ব্রাঞ্চ ইনচার্জকে নির্দেশনা**: ফ্রন্ট ডেস্ক ও রিসেপশন কার্যক্রম শতভাগ সম্পন্ন নিশ্চিত করে অপরাহ্ন ৫টার মধ্যে ক্যাশ ও এমআর ব্যালেন্স ফাইনাল করার আদেশ দিন।
2. **রাজবাড়ি ব্রাঞ্চ ইনচার্জকে নির্দেশনা**: গ্রাহক যোগাযোগ ও সেলস ফলোআপের তালিকা দ্রুত আপডেট করে পেন্ডিং কাজের সুরাহা করতে বলুন।
3. **সেন্ট্রাল ক্লোজিং নিশ্চিতকরণ**: রাজি স্যারের টেবিলে উভয় ব্রাঞ্চের দৈনিক চেকলিস্ট ও লগ রিপোর্ট সন্ধ্যা ৬টার মধ্যে স্বাক্ষরিত আকারে জমা দেওয়ার স্থায়ী নির্দেশনা জারি রাখুন।

---

### 🔄 কর্মী পদায়ন ও আন্তঃব্রাঞ্চ সমন্বয় পরামর্শ
- **ভারসাম্য রক্ষা**: কোনো ব্রাঞ্চে হঠাৎ অডিট বা বিশেষ ইভেন্ট থাকলে অপর ব্রাঞ্চের অতিরিক্ত লজিস্টিকস বা কো-অর্ডিনেটর কর্মীকে অস্থায়ীভাবে সমন্বয় করা যেতে পারে।
- **মাসিক পর্যালোচনা**: মাসের শেষে চৌরাস্তা ও রাজবাড়ি ব্রাঞ্চের কর্মীদের মধ্যে স্বাস্থ্যকর প্রতিযোগিতার লক্ষ্যে শ্রেষ্ঠ পারফরমার পুরস্কার প্রবর্তন বিবেচনা করতে পারেন।`;

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
