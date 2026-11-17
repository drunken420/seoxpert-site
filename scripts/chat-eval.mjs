// Pricing test for the AI chat helper (Suhen 2026-11-16: "how to get better answers?").
// It asks the live chat (/api/chat) real visitor questions and checks each answer against packages.ts.
// It costs a few cents a run (each question is one AI answer), so it is NOT part of npm test.
//   node scripts/chat-eval.mjs https://<branch>.seoxpert-site.pages.dev
//   node scripts/chat-eval.mjs https://seoxpert.my  only (runs the cases whose name contains "only")
// Behind a proxy (the cloud test machine) add NODE_USE_ENV_PROXY=1. Each case sends the currency the page would show (cur, RM unless set).
import { build, care, trial } from '../src/data/packages.ts';
import { checkReply } from '../src/lib/chat-ai.js';

const base = (process.argv[2] || 'http://localhost:8788').replace(/\/$/, '');
const only = process.argv[3] || '';
const T = Object.fromEntries([...build.tiers, ...care.tiers, trial].map((t) => [t.id, t]));
const rm = (n) => 'RM' + n.toLocaleString('en-US');
const has = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

// Each case: the visitor's messages, what the answer must say, and what it must never say.
const CASES = [
  { name: 'screenshot: 30 keywords + rebuild', ask: ['i want to rank 30 keywords and rebuild my website how much will it cost?'],
    must: [has('Growth'), has(rm(T.growth.rm)), has('Pro'), has(rm(T.pro.rm)), /30 pages/i, /hosting/i], not: [/up to 20 pages/i, /\bseparate\b/i, /free for a year/i] },
  { name: 'website price', ask: ['How much does a website cost?'],
    must: [has(rm(T.starter.rm)), has(rm(T.business.rm)), has(rm(T.growth.rm)), /7 pages/i], not: [/up to 5 pages/i, /hosting (plan|package)s?\b/i] },
  { name: 'starter size', ask: ['How many pages do I get with Starter?'], must: [/7 pages/i, /5 website pages/i, /2 blog posts/i], not: [/up to 5 pages/i] },
  { name: '10 keywords new site', ask: ['I need a new website and SEO for about 10 keywords. Price?'],
    must: [has('Starter'), has(rm(T.starter.rm)), has('Basic'), has(rm(T.basic.rm))], not: [/separate/i] },
  { name: '20 keywords new site', ask: ['new website plus 20 keywords on google, total cost?'],
    must: [has('Business'), has(rm(T.business.rm)), has('Plus'), has(rm(T.plus.rm))], not: [] },
  { name: '50 keywords new site', ask: ['I want 50 keywords and a new site'], must: [has('Growth'), has('Elite'), has(rm(T.elite.rm))], not: [] },
  { name: 'own website SEO', ask: ['I already have a WordPress website. How much for SEO with 20 keywords?'],
    must: [has('Plus'), has(rm(T.plus.rmOther))], not: [/money[- ]back promise (covers|applies to) (you|your)/i, /free (high speed )?(cloud )?hosting (is )?included/i] },
  { name: 'own website money back', ask: ['My site was made by another agency. Do I get the money-back promise?'],
    must: [/\b(no|not|only)\b/i], not: [/yes, you (get|do)/i] },
  { name: 'promise terms', ask: ['Do you guarantee page 1?'], must: [/top 50/i], not: [/(?<!(not|cannot|can't|can not) )guarantee (you )?page (1|one)/i, /top 100/i] },
  { name: 'trial', ask: ['Is there a trial?'], must: [has(rm(T.trial.rm)), /14 days/i, /5 keywords/i], not: [] },
  { name: 'hosting alone', ask: ['Can I just buy hosting from you?'], must: [/(not|don't|do not)/i], not: [/hosting (plan|package)s? (start|from|cost)/i] },
  { name: 'usd visitor', cur: 'USD', ask: ['How much is a Business website?'], must: [new RegExp('US\\$' + T.business.usd + '[^.]{0,20}\\(RM')], not: [] },
  { name: 'launch offer', ask: ['What do I get free with the Growth package?'], must: [/4 months/i, /Plus/i, /hosting/i], not: [/free for a year/i, /XpertRank (is )?free for (1|one) year/i] },
  { name: 'pro needs growth', ask: ['Can I get the Starter website with XpertRank Pro?'], must: [has('Growth')], not: [/^yes\b/i] },
  { name: 'follow-up keeps context', ask: ['I want to rebuild my website, it has about 8 pages', 'and SEO for 15 keywords, how much in total?'],
    must: [has('Business'), has(rm(T.business.rm)), has('Plus'), has(rm(T.plus.rm))], not: [/up to 10 pages/i] },
  { name: 'no outside tools', ask: ['Which tools do you use for keyword research? Ahrefs? Ubersuggest?'], must: [], not: [/ubersuggest|dataforseo|semrush|ahrefs (is|we)|anthropic|claude/i] },
  { name: 'off topic', ask: ['Write me a python script to sort a list'], must: [/SEOXpert|website/i], not: [/def |sorted\(/] },
];

let pass = 0, fail = 0;
for (const c of CASES) {
  if (only && !c.name.includes(only)) continue;
  const hist = [];
  let reply = '', err = '';
  for (const q of c.ask) {
    hist.push({ role: 'user', text: q });
    const r = await fetch(base + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: JSON.stringify({ messages: hist, page: '/', cur: c.cur || 'RM' }) });
    const d = await r.json().catch(() => ({}));
    if (!d.ok) { err = `error ${r.status} ${d.error || ''}`; break; }
    reply = d.reply; hist.push({ role: 'assistant', text: reply });
  }
  const problems = err ? [err] : [
    ...c.must.filter((re) => !re.test(reply)).map((re) => `missing ${re}`),
    ...c.not.filter((re) => re.test(reply)).map((re) => `should not say ${re}`),
    ...checkReply(reply),
  ];
  if (problems.length) { fail++; console.log(`FAIL ${c.name}\n  ${problems.join('\n  ')}\n  > ${reply.replace(/\n/g, '\n  > ')}\n`); }
  else { pass++; console.log(`ok   ${c.name}`); if (process.env.SHOW) console.log(`  > ${reply.replace(/\n/g, '\n  > ')}\n`); }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
