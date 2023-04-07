import React from 'react';
import * as Sentry from '@sentry/react';
import { CaptureConsole as CaptureConsoleIntegration } from '@sentry/integrations';
import { BrowserTracing } from '@sentry/tracing';
import { entrypoints } from 'uxp';
import './style.css';
import ContextManager from 'panels/ContextManager';
import PanelController from 'controllers/PanelController';

// Sentry.init({
//     dsn: 'https://97e4d1ee807344f0aecd87d54de4129d@o4504843737104384.ingest.sentry.io/4504843739463680',
//     integrations: [
//         new BrowserTracing(),
//         new CaptureConsoleIntegration({ levels: ['error'] }),
//     ],
//     // integrations: [new BrowserTracing(), new CaptureConsoleIntegration({ levels: ['error', 'debug']})],
//     tracesSampleRate: 1.0,
//     // attachStacktrace: true,
//     release: 'Bashful.0.0.1',
//     debug: true,
// });

// console.log = function() {};
// console.debug = function() {};

entrypoints.setup({
    panels: {
        contextmanager: PanelController(<ContextManager />, {}),
    },
});
