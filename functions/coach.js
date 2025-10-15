// Netlify Function: /api/coach
// POST { "prompt": "your text" }
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b';
const BASE  = 'https://generativelanguage.googleapis.com/v1beta';

exports.handler = async (event) => {
  try{
    if(event.httpMethod !== 'POST') return send(405, { error: 'POST only' });
    if(!API_KEY) return send(500, { error: 'Missing GEMINI_API_KEY' });

    const { prompt } = JSON.parse(event.body || '{}');
    if(!prompt) return send(400, { error: 'Missing prompt' });

    const url = `${BASE}/models/${MODEL}:generateContent?key=${API_KEY}`;
    const body = {
      contents: [{ role:'user', parts:[{text: `EcoLoop Coach:\n${prompt}`}] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 512 }
    };

    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(!r.ok) return send(r.status, { error: `Gemini ${r.status}` });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('\n') || '';

    return send(200, { text });
  }catch(e){
    return send(500, { error: e.message });
  }
};

function send(status, body){
  return { statusCode: status, headers:{ 'Content-Type':'application/json', 'Cache-Control':'no-store' }, body: JSON.stringify(body) };
}
