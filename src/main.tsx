import React from 'react';
import PanelController from './controllers/PanelController';
import { entrypoints } from 'uxp';
import './style.css';
import ContextManager from 'components/ContextManager';

entrypoints.setup({
    panels: {
        contextmanager: PanelController(<ContextManager />, {}),
    },
});
