import React from 'react';
import PanelController from './controllers/PanelController';
import { entrypoints } from 'uxp';
import { SmallUiDetail, ContextManager, StyleReferences } from './panels';

import './style.css';

entrypoints.setup({
    panels: {
        contextmanager: PanelController(<ContextManager />, {}),
        smalluidetail: PanelController(<SmallUiDetail />, {}),
        stylereferences: PanelController(<StyleReferences />, {}),
    },
});
