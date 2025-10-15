// Netlify Function: /api/sustainable-finder
// POST { "query": "...", "region": "UAE", "budget": "low|mid|high" }
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b';
const BASE  = 'https://generativelanguage.googleapis.com/v1beta';

exports.handler = async (event) => {
  try{
    if(event.httpMethod !== 'POST') return send(405, { error: 'POST only' });
    if(!API_KEY) return send(500, { error: 'Missing GEMINI_API_KEY' });

    const { query, region = '', budget = '' } = JSON.parse(event.body || '{}');
    if(!query) return send(400, { error: 'Missing query' });

    const prompt = [
      `Suggest eco-friendly alternatives for: ${query}`,
      region ? `Region: ${region}` : '',
      budget ? `Budget: ${budget}` : '',
      `Return a concise JSON array with items [{name, summary, impact, savings}].`,
      `No external links. Keep text short and factual.`
    ].filter(Boolean).join('\n');

    const url = `${BASE}/models/${MODEL}:generateContent?key=${API_KEY}`;
    const body = {
      contents: [{ role:'user', parts:[{text: prompt}] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 400 }
    };

    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(!r.ok) return send(r.status, { error: `Gemini ${r.status}` });
    const data = await r.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('\n') || '[]';

    const items = safeJSON(raw);
    return send(200, { items: Array.isArray(items) ? items : [] });
  }catch(e){
    return send(500, { error: e.message });
  }
};

function safeJSON(t){
  try{
    const m = String(t).match(/\[([\s\S]*)\]/);
    return JSON.parse(m ? `[${m[1]}]` : t);
  }catch{ return []; }
}

function send(status, body){
  return { statusCode: status, headers:{ 'Content-Type':'application/json', 'Cache-Control':'no-store' }, body: JSON.stringify(body) };
}
