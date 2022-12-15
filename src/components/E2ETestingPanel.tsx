import React from 'react';
import { Button } from 'react-uxp-spectrum';
import {
    convertLayersToSmartObjects,
    convertLayerToSmartObject,
    getTopLayer,
} from 'services/layer_service';
import photoshop from 'photoshop';
import { ContextStoreState, useContextStore } from 'store/contextStore';

export function E2ETestingPanel() {
    const getLayerAssignment = useContextStore(
        (state: ContextStoreState) => state.getLayerAssignment
    );

    const saveLayerAssignment = useContextStore(
        (state: ContextStoreState) => state.saveLayerAssignment
    );
    return (
        <div>
            <h1>TEST NAME: Convert All Layers To Smart Objects</h1>
            <Button
                onClick={() =>
                    convertAllLayersToSmartObjects(
                        getLayerAssignment,
                        saveLayerAssignment
                    )
                }
            >
                Test
            </Button>
        </div>
    );
}

/**
 * TEST: Convert a layer to a smart object.
 * RESULT: Success
 * EVIDENCE: https://www.loom.com/share/e3ffad66ff404ff5a262e8f306830772
 */
function convertTopLayerToSmartObject() {
    let topLayer = getTopLayer();
    convertLayerToSmartObject(topLayer);
}

function convertAllLayersToSmartObjects(
    getLayerAssignment: Function,
    setLayerAssignment: Function
) {
    let layers = photoshop.app.activeDocument.layers;
    convertLayersToSmartObjects(layers, getLayerAssignment, setLayerAssignment);
}
