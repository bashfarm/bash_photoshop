import React from 'react';
import PanelController from './controllers/PanelController';
import { entrypoints } from 'uxp';

import { UxpStorage } from './panels/UxpStorage.js';

entrypoints.setup({
    panels: {
        uxpstorage: PanelController(<UxpStorage />, {}),
    },
});
