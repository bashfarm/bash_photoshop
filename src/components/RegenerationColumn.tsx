import { ProgressResponse } from 'common/types/sdapi';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { useState } from 'react';
import { Progressbar } from 'react-uxp-spectrum';
import {
    generateAILayer,
    getImageProcessingProgress,
} from 'services/ai_service';
import { deleteLayer, moveLayer } from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ProgressButton } from './ProgressButton';
import photoshop from 'photoshop';

export type RegenerationColumnProps = {
    layerID: number;
};

/**
 * The component for the ride hand side of the context item UI.  This is responsible for styling and etc.  This might bneed to be revamped.
 * @param {*}
 * @returns
 */
export const RegenerationColumn = (props: RegenerationColumnProps) => {
    let [imageProgress, setImageProgress] = useState(0);

    // When a new layer gets created we will need to see if it has an associated context with it.
    // So we need to have this layer2IdRegistry going.
    let setAILayerContext = useContextStore(
        (state: ContextStoreState) => state.setAILayerContext
    );
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );

    async function regenerateLayer(width: number, height: number) {
        try {
            let layerAIContext = getAILayerContext(props.layerID);
            let newLayer = await generateAILayer(width, height, layerAIContext);
            let oldLayer = layerAIContext.layers[0];
            let newGeneratedLayer = newLayer;

            moveLayer(
                newGeneratedLayer, // context now has the new layer as the first element
                oldLayer, // the context now has two layers it is managing, 0 being the generated, 1 being the old layer
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );

            deleteLayer(oldLayer);

            layerAIContext.layers = [newGeneratedLayer];
            setAILayerContext(newGeneratedLayer.id, layerAIContext);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <div className="flex flex-col justify-between">
                <ProgressButton
                    // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                    //  512x512 is the cheapest.  We will have to have a final step of upscaling
                    longRunningFunction={async () => {
                        console.log('before regenerate');
                        regenerateLayer(512, 512);
                        console.log('after regenerate');
                    }}
                    progressQueryFunction={getImageProcessingProgress}
                    queryResponseParser={(response: ProgressResponse) =>
                        response['progress']
                    }
                    progressSetter={setImageProgress}
                    pollingSeconds={1}
                >
                    Regenerate Layer
                </ProgressButton>
                <Progressbar
                    min={0}
                    max={1}
                    value={imageProgress}
                    className="py-2"
                ></Progressbar>
            </div>
        </>
    );
};
