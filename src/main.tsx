import React from 'react';
import { entrypoints } from 'uxp';
import './style.css';
import ContextManager from 'panels/ContextManager';
import ContextPalette from 'panels/ContextPalette';
import PanelController from 'controllers/PanelController';

entrypoints.setup({
    panels: {
        contextmanager: PanelController(<ContextManager />, {}),
        contextpalette: PanelController(<ContextPalette />, {}),
    },
});
