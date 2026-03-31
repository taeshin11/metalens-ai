export const collectData = async (keywords: string, paperCount: number) => {
  const webhookUrl = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK;
  if (!webhookUrl) return;

  try {
    let sid = sessionStorage.getItem('sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('sid', sid);
    }

    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords,
        paper_count: paperCount,
        language: navigator.language,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        session_id: sid,
      }),
    });
  } catch {
    // Silent fail — never block user experience
  }
};
