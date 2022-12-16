import { ProgressResponse } from 'common/types/sdapi';
import LayerAIContext from 'models/LayerAIContext';
import React, { useEffect } from 'react';
import { useState } from 'react';
import Spectrum, { Progressbar } from 'react-uxp-spectrum';
import {
    generateAILayer,
    getImageProcessingProgress,
} from 'services/ai_service';
import { deleteLayer, moveLayer } from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ProgressButton } from './ProgressButton';
import photoshop from 'photoshop';
import { Layer } from 'photoshop/dom/Layer';

const events = [
    'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

export type RegenerationColumnProps = {
    contextID: string;
};

/**
 * The component for the ride hand side of the context item UI.  This is responsible for styling and etc.  This might bneed to be revamped.
 * @param {*}
 * @returns
 */
export const RegenerationColumn = (props: RegenerationColumnProps) => {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );
    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let [imageProgress, setImageProgress] = useState(0);
    let [selectedLayerName, setSelectedLayerName] = useState<string>(null);
    let [unSelecedLayers, setUnSelectedLayers] = useState<Array<string>>(null);

    async function regenerateLayer(width: number, height: number) {
        try {
            let newLayer = await generateAILayer(width, height, layerContext);
            console.log('after regenerating image');
            let oldLayer = layerContext.currentLayer;
            let copyOfContext = layerContext.copy();

            copyOfContext.currentLayer = newLayer;
            saveContextToStore(copyOfContext);

            await moveLayer(
                newLayer,
                oldLayer,
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );
            await deleteLayer(oldLayer);
            setSelectedLayerName(newLayer.name);
        } catch (e) {
            console.error(e);
        }
    }

    function onLayerChange() {
        // setUnassignedLayers(getUnassignedLayers());
    }

    useEffect(() => {
        // setUnassignedLayers(getUnassignedLayers());
        photoshop.action.addNotificationListener(events, onLayerChange);
        return () => {
            photoshop.action.removeNotificationListener(events, onLayerChange);
        };
    }, []);

    useEffect(() => {
        setUnSelectedLayers(getUnselectedLayerNames());
    }, [selectedLayerName]);

    function onDropDownSelect(layerName: string) {
        setSelectedLayerName(layerName);
        let copyOfContext = layerContext.copy();
        copyOfContext.currentLayer = photoshop.app.activeDocument.layers
            .map((layer) => layer)
            .filter((layer) => selectedLayerName == layer.name)[0];

        saveContextToStore(copyOfContext);
    }

    function getUnselectedLayerNames() {
        // return photoshop.app.activeDocument.layers.filter(layer => layer.id != selectedLayer.id)
        return photoshop.app.activeDocument.layers.map((layer) => layer.name);
    }

    return (
        <>
            <div className="flex flex-col justify-between">
                <ProgressButton
                    // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                    //  512x512 is the cheapest.  We will have to have a final step of upscaling
                    longRunningFunction={async () => {
                        console.log('before regenerate');
                        await regenerateLayer(512, 512);
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
                <Spectrum.Dropdown>
                    <Spectrum.Menu slot="options">
                        {unSelecedLayers &&
                            unSelecedLayers.map((layerName) => {
                                try {
                                    return (
                                        <Spectrum.MenuItem
                                            key={layerName}
                                            onClick={() =>
                                                onDropDownSelect(layerName)
                                            }
                                            selected={
                                                selectedLayerName == layerName
                                            }
                                        >
                                            {layerName}
                                        </Spectrum.MenuItem>
                                    );
                                } catch (e) {
                                    console.error(e);
                                }
                            })}
                    </Spectrum.Menu>
                </Spectrum.Dropdown>
            </div>
        </>
    );
};
