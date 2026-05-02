import Tracker from '@openreplay/tracker';
import trackerAssist from '@openreplay/tracker-assist';

const tracker = new Tracker({
  projectKey: 'CBrEq5LkXiLXfLPNWPPs',
  ingestPoint: 'https://monitor.edge.nanaska.com/ingest',
  defaultInputMode: 0,
  obscureTextNumbers: false,
  obscureTextEmails: false,
});

tracker.use(trackerAssist());

tracker
  .start()
  .then((result) => {
    console.log('[OpenReplay] started', result);
  })
  .catch((err) => {
    console.error('[OpenReplay] failed to start', err);
  });

if (typeof window !== 'undefined') {
  window.__openreplay = tracker;
}

export default tracker;
