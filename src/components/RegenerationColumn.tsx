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
    contextID: string;
};

/**
 * The component for the ride hand side of the context item UI.  This is responsible for styling and etc.  This might bneed to be revamped.
 * @param {*}
 * @returns
 */
export const RegenerationColumn = (props: RegenerationColumnProps) => {
    let [imageProgress, setImageProgress] = useState(0);

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    let saveLayerAssignment = useContextStore(
        (state: ContextStoreState) => state.saveLayerAssignment
    );

    async function regenerateLayer(width: number, height: number) {
        try {
            let layerAIContext = getContextFromStore(props.contextID);
            let newLayer = await generateAILayer(width, height, layerAIContext);
            console.log('after regenerating image');
            let oldLayer = layerAIContext.currentLayer;
            let copyOfContext = layerAIContext.copy();

            copyOfContext.currentLayer = newLayer;
            saveContextToStore(copyOfContext);
            saveLayerAssignment(
                copyOfContext.currentLayer.id,
                copyOfContext.id
            );

            await moveLayer(
                newLayer,
                oldLayer,
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );
            await deleteLayer(oldLayer);
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
