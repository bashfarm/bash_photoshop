import React from 'react';
import PanelController from './controllers/PanelController';
import { entrypoints } from 'uxp';
import { SmallUiDetail, UxpStorage, StyleReferences } from './panels';

import './style.css';

entrypoints.setup({
    panels: {
        uxpstorage: PanelController(<UxpStorage />, {}),
        smalluidetail: PanelController(<SmallUiDetail />, {}),
        stylereferences: PanelController(<StyleReferences />, {}),
    },
});
