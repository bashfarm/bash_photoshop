import { E2ETestingPanel } from 'components/E2ETestingPanel';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { useEffect } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextItem } from '../components/ContextItem';
import photoshop from 'photoshop';
const app = photoshop.app;

// const events = [
//     { event: 'make' },
//     { event: 'select' },
//     { event: 'selectNoLayers' },
//     { event: 'move' },
//     { event: 'undoEvent' },
//     { event: 'undoEnum' },
// ];

// const deletEvent = [
// 	{ event: 'delete'}
// ]

const events = [
    'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

const deletEvent = ['delete'];

export const ContextManager = () => {
    let syncPhotoshopLayersAndContexts = useContextStore(
        (state: ContextStoreState) => state.syncPhotoshopLayersAndContexts
    );

    let retreiveContextFromCache = useContextStore(
        (state: ContextStoreState) => state.retreiveContextFromCache
    );
    let setAILayerContext = useContextStore(
        (state: ContextStoreState) => state.setAILayerContext
    );
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );

    let layerID2Context = useContextStore(
        (state: ContextStoreState) => state.layerID2Context
    );

    function onDelete(something: any) {
        console.log(something);
        syncPhotoshopLayersAndContexts(app.activeDocument.layers);
    }

    function onLayerChange() {
        for (let layer of app.activeDocument.layers) {
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

    /**
     * This creates the actual <ContextItem/>s list to be displayed.  This renders the contexts
     * in the order the layers are found in the document.
     * @returns
     */
    function createContextItems() {
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

    return (
        <>
            <E2ETestingPanel></E2ETestingPanel>
            {createContextItems()}
        </>
    );
};
