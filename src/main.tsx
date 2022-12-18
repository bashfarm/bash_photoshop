import React from 'react';
import PanelController from './controllers/PanelController';
import { entrypoints } from 'uxp';
import { ContextManager } from './panels';

import './style.css';

entrypoints.setup({
    panels: {
        contextmanager: PanelController(<ContextManager />, {}),
    },
});
