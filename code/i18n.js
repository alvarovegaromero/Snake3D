export function getLang() {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith('es') ? 'es' : 'en';
}

export async function loadTranslations() {
  const lang = getLang();
  const response = await fetch(`./code/i18n/${lang}.json`);
  return await response.json();
}