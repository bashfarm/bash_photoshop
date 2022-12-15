import { E2ETestingPanel } from 'components/E2ETestingPanel';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { useEffect } from 'react';
import { createNewLayer } from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextItem } from '../components/ContextItem';
import { randomlyPickLayerName } from 'utils/general_utils';
import photoshop from 'photoshop';
import { Button } from 'react-uxp-spectrum';
const app = photoshop.app;

const events = [
    // 'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

const deletEvent = ['delete'];

export const ContextManager = () => {
    const syncPhotoshopLayersAndContexts = useContextStore(
        (state: ContextStoreState) => state.syncPhotoshopLayersAndContexts
    );

    const retreiveContextFromCache = useContextStore(
        (state: ContextStoreState) => state.retreiveContextFromCache
    );
    const setAILayerContext = useContextStore(
        (state: ContextStoreState) => state.setAILayerContext
    );
    const getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );

    const layerID2Context = useContextStore(
        (state: ContextStoreState) => state.layerID2Context
    );

    function onDelete(something: any) {
        console.log(something);
        syncPhotoshopLayersAndContexts(app.activeDocument.layers);
    }

    function onLayerChange() {
        for (const layer of app.activeDocument.layers) {
            let layerContext: LayerAIContext = null;

            // if the context is in the cache it must have been deleted.  The user must have done a `ctrl+z` for this to retrieve anything
            // or the app is buggy lol ❤️‍🔥.
            layerContext = retreiveContextFromCache(layer.id);

            if (!layerContext) {
                // Check if the layer is managed by an active context
                layerContext = getAILayerContext(layer.id);
            }

            if (!layerContext) {
                // No layer context, lets create one then.
                layerContext = new LayerAIContext(layer);

                // Add the reference to our store so we can always get back to it.  undo and etc.
                // also need to have this set so we render the contextItem(s) properly
                setAILayerContext(layer.id, layerContext);
            }
        }

        // We won't remove any context.  What if the user deletes one and then does an `undo`?  We will have lost the context
        // so this function should just end.  We add contexts if they aren't there.  The other functions will have to manage the layers in the context
        // ... that is a problem.  WE can't detect and undo event.  We will have to sense the references to the layer from the store and update
        // layers based on that.  shit.
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onLayerChange);
        return () => {
            photoshop.action.removeNotificationListener(events, onLayerChange);
        };
    }, []);

    useEffect(() => {
        photoshop.action.addNotificationListener(deletEvent, onDelete);
        return () => {
            photoshop.action.removeNotificationListener(deletEvent, onDelete);
        };
    }, []);

    // Only create the initial counts once.  Let the events figure out everythign else
    useEffect(() => {
        CreateInitialContexts();
    }, []);

    /**
     * Create the initial contexts for the layers.  Should be done only once when the component first loads.
     */
    function CreateInitialContexts() {
        try {
            for (let layer of app.activeDocument.layers) {
                if (!getAILayerContext(layer.id)) {
                    setAILayerContext(layer.id, new LayerAIContext(layer));
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    // TODO: This can also be moved since it's using the store, and the store can be called from anywhere
    async function createNewContext() {
        const newLayer = await createNewLayer(
            `Context: ${randomlyPickLayerName()}`
        );
        const newContext = new LayerAIContext(newLayer);
        setAILayerContext(newLayer.id, newContext);
        return newContext;
    }

    return (
        <>
            <E2ETestingPanel></E2ETestingPanel>

            <div>
                <Button
                    onClick={async () => {
                        let newContext = await createNewContext();
                        console.log(newContext);
                    }}
                >
                    Create New Context
                </Button>
            </div>
            <ContextItems />
        </>
    );
};

/**
 * This creates the actual <ContextItem/>s list to be displayed.  This renders the contexts
 * in the order the layers are found in the document.
 * @returns
 */
// TODO: move to its own file or something else - needs refactoring though
function ContextItems() {
    return (
        <>
            {photoshop.app.activeDocument.layers &&
                photoshop.app.activeDocument.layers.map((layer) => {
                    console.log(layer);
                    return (
                        <ContextItem
                            key={layer.id}
                            layerID={layer.id}
                        ></ContextItem>
                    );
                })}
        </>
    );
}
