export const MAX_FEEDBACK_LENGTH = 1800;
export function publicFeedbackEndpoint(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || /(?:^|\.)discord(?:app)?\.com$/i.test(url.hostname) || /webhooks/i.test(url.pathname)) return '';
    return url.href;
  } catch { return ''; }
}
export function feedbackValidation(message) {
  if (!message.trim()) return 'Écris un message avant de l’envoyer.';
  if (message.length > MAX_FEEDBACK_LENGTH) return 'Ton message dépasse la limite de 1 800 unités UTF-16.';
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) return 'Retire les caractères de contrôle de ton message.';
  return '';
}
export function feedbackError(status) {
  return ({400:'Le relais a refusé le message. Vérifie son contenu et la configuration du relais.',413:'Le message est trop volumineux. Raccourcis-le avant de réessayer.',429:'Trop de retours ont été envoyés. Attends au moins 60 secondes avant de réessayer.',502:'Discord est indisponible ou sa réponse a été perdue. Ton retour a peut-être été reçu.',503:'Le relais est occupé. Réessaie plus tard.'})[status] || 'La réception du retour n’a pas pu être confirmée.';
}
export function mountFeedback(doc, configuredEndpoint, fetchImpl = fetch) {
  const endpoint = publicFeedbackEndpoint(configuredEndpoint);
  const dialog = doc.querySelector('#feedback-dialog'), form = doc.querySelector('#feedback-form');
  const field = doc.querySelector('#feedback-message'), send = doc.querySelector('#feedback-send');
  const status = doc.querySelector('#feedback-status'), count = doc.querySelector('#feedback-count');
  const unavailable = 'L’envoi de retours est indisponible : aucun relais HTTPS valide n’est configuré.';
  let pending = false;
  status.textContent = endpoint ? '' : unavailable;
  send.disabled = !endpoint;
  doc.querySelector('#feedback-open').addEventListener('click', () => { dialog.showModal(); field.focus(); });
  doc.querySelector('#feedback-close').addEventListener('click', () => dialog.close());
  field.addEventListener('input', () => {
    count.textContent = `${field.value.length} / 1 800`;
    field.removeAttribute('aria-invalid');
    status.textContent = endpoint ? '' : unavailable;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    if (!endpoint) { status.textContent = unavailable; return; }
    const message = field.value, error = feedbackValidation(message);
    if (error) { field.setAttribute('aria-invalid', 'true'); status.textContent = error; field.focus(); return; }
    pending = true; send.disabled = true; field.readOnly = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Envoi en cours… Attends la confirmation du relais.';
    try {
      const response = await fetchImpl(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message}), credentials:'omit', redirect:'error', referrerPolicy:'no-referrer', signal:AbortSignal.timeout(15000)});
      if (response.status !== 200) throw new Error(feedbackError(response.status));
      let body; try { body = await response.json(); } catch { throw new Error(feedbackError()); }
      if (body?.ok !== true) throw new Error(feedbackError());
      field.value = ''; count.textContent = '0 / 1 800';
      status.textContent = 'Merci ! Ton retour a été reçu par Discord.';
    } catch (error) {
      status.textContent = (error instanceof TypeError || error.name === 'TimeoutError' || error.name === 'AbortError' ? 'Connexion interrompue ou délai dépassé. La réception de ton retour est incertaine.' : error.message) + ' Ton texte est conservé. Aucune nouvelle tentative automatique ; tu peux réessayer manuellement.';
    } finally {
      pending = false; send.disabled = false; field.readOnly = false; form.removeAttribute('aria-busy');
    }
  });
}
