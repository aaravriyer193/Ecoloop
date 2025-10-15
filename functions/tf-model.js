// Netlify Function: /api/tf-model
// Returns the TFJS model and labels configuration used by classifier.html.
// You will add these files under /assets/tf/ in your site.
exports.handler = async (event) => {
  if(event.httpMethod !== 'GET') return send(405, { error:'GET only' });

  // Adjust paths if your model is elsewhere.
  const cfg = {
    modelUrl: '/assets/tf/model.json',
    labels: [
      // Provide the label list matching your model:
      // e.g., "paper", "cardboard", "plastic", "glass", "metal", "organic", "e-waste", "textile"
    ],
    inputSize: 224
  };
  return send(200, cfg);
};

function send(status, body){
  return { statusCode: status, headers:{ 'Content-Type':'application/json', 'Cache-Control':'no-store' }, body: JSON.stringify(body) };
}
