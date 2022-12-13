import React from 'react';
import { Button } from 'react-uxp-spectrum';
import {
    convertLayersToSmartObjects,
    convertLayerToSmartObject,
    getTopLayer,
} from 'services/layer_service';
import photoshop from 'photoshop';

export function E2ETestingPanel() {
    return (
        <>
            <h1>TEST NAME: Convert All Layers To Smart Objects</h1>
            <Button onClick={() => convertAllLayersToSmartObjects()}>
                Test
            </Button>
        </>
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

function convertAllLayersToSmartObjects() {
    let layers = photoshop.app.activeDocument.layers;
    convertLayersToSmartObjects(layers);
}
