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
tracker.start();

export default tracker;
