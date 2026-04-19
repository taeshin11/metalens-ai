import { clog } from './client-logger';

export const collectData = async (keywords: string, paperCount: number) => {
  const webhookUrl = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK;
  if (!webhookUrl) {
    clog.info('analytics_webhook_not_configured', 'collectData');
    return;
  }

  try {
    let sid = sessionStorage.getItem('sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('sid', sid);
      clog.info('analytics_sid_created', 'collectData');
    }

    clog.info('analytics_upload_start', 'collectData', { keywordsLen: keywords.length, paperCount });
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
    // no-cors mode returns opaque response; we can't read status but reach confirms network dispatch
    clog.info('analytics_upload_dispatched', 'collectData', { paperCount });
  } catch (err) {
    // Never block UX, but surface so an outage doesn't go unnoticed
    clog.error('analytics_upload_failed', 'collectData', err, { keywordsLen: keywords.length });
  }
};
