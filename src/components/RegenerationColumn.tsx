import { ProgressResponse } from 'common/types/sdapi';
import React, { useEffect } from 'react';
import { useState } from 'react';
import Spectrum, { Progressbar } from 'react-uxp-spectrum';
import {
    generateAILayer,
    getImageProcessingProgress,
} from 'services/ai_service';
import {
    deleteLayer,
    moveLayer,
    scaleAndFitLayerToCanvas,
} from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ProgressButton } from './ProgressButton';
import photoshop from 'photoshop';
import { RegenerationToolbar } from './RegenerationToolbar';
import { BlenderIcon } from 'components/Icons';

const events = [
    'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

const deleteEvent = ['delete'];

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

    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let contexts = useContextStore(
        (state: ContextStoreState) => state.contexts
    );

    let [imageProgress, setImageProgress] = useState(0);
    let [selectedLayerName, setSelectedLayerName] = useState<string>(null);
    let [unSelecedLayers, setUnSelectedLayers] = useState<Array<string>>(null);

    /**
     * This will regenerate the layer in the context item.  This will also move the layer to the top of the layer stack.
     * If the deleteOldLayer is set to true, then the old layer will be deleted.
     * @param deleteOldLayer
     */
    async function regenerateLayer(deleteOldLayer: boolean = false) {
        try {
            let newLayer = await generateAILayer(layerContext);
            let oldLayer = layerContext.currentLayer;
            let copyOfContext = layerContext.copy();

            copyOfContext.currentLayer = newLayer;
            saveContextToStore(copyOfContext);

            await moveLayer(
                newLayer,
                oldLayer,
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );
            if (deleteOldLayer) {
                await deleteLayer(oldLayer);
            }
            setSelectedLayerName(newLayer.name);
            await scaleAndFitLayerToCanvas(newLayer);
        } catch (e) {
            console.error(e);
        }
    }

    function onLayerChange() {
        setUnSelectedLayers(getUnselectedLayerNames());
    }

    /**
     * This function is used as an event handler for the delete event.  This is used to delete the context from the store if the layer is deleted
     * from the active documents layers.
     */
    function onDelete() {
        try {
            getContextFromStore(props.contextID).currentLayer.id;
        } catch (e) {
            console.error(e);
            let copyOfContext = getContextFromStore(props.contextID).copy();
            console.log(copyOfContext);

            copyOfContext.currentLayer = null;
            saveContextToStore(copyOfContext);
        }

        setUnSelectedLayers(getUnselectedLayerNames());
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onLayerChange);
        photoshop.action.addNotificationListener(deleteEvent, onDelete);
        return () => {
            photoshop.action.removeNotificationListener(events, onLayerChange);
            photoshop.action.removeNotificationListener(deleteEvent, onDelete);
        };
    }, []);

    useEffect(() => {
        setUnSelectedLayers(getUnselectedLayerNames());
    }, [selectedLayerName]);

    function onDropDownSelect(layerName: string) {
        setSelectedLayerName(layerName);
        let copyOfContext = layerContext.copy();
        copyOfContext.currentLayer = photoshop.app.activeDocument.layers.filter(
            (layer) => layerName == layer.name
        )[0];

        saveContextToStore(copyOfContext);
    }

    /**
     * This retrieves the unselected layers through all the context items.  This isn't really implemented as of yet.
     *
     * TODO(): Implement this
     * @returns
     */
    function getUnselectedLayerNames() {
        return photoshop.app.activeDocument.layers.map((layer) => layer.name);
    }

    return (
        <>
            <div className="flex flex-col justify-between">
                <RegenerationToolbar contextID={props.contextID} />
                <ProgressButton
                    disabled={false}
                    // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                    //  512x512 is the cheapest.  We will have to have a final step of upscaling
                    longRunningFunction={async () => {
                        console.log('before regenerate');
                        await regenerateLayer(false);
                        console.log('after regenerate');
                    }}
                    progressQueryFunction={getImageProcessingProgress}
                    queryResponseParser={(response: ProgressResponse) =>
                        response['progress']
                    }
                    progressSetter={setImageProgress}
                    pollingSeconds={1}
                    icon={<BlenderIcon />}
                >
                    Regenerate Layer
                </ProgressButton>
                <Progressbar
                    min={0}
                    max={1}
                    value={imageProgress}
                    className="py-2 w-full"
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
