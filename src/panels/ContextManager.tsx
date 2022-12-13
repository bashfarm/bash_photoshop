import { E2ETestingPanel } from 'components/E2ETestingPanel';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { useEffect } from 'react';
import { Button } from 'react-uxp-spectrum';
import { createNewLayer } from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextItem } from '../components/ContextItem';
import photoshop from 'photoshop';
import { randomlyPickLayerName } from 'utils/general_utils';
const app = photoshop.app;

// const events = [
//     { event: 'make' },
//     { event: 'delete' },
//     { event: 'select' },
//     { event: 'selectNoLayers' },
//     { event: 'move' },
//     { event: 'undoEvent' },
//     { event: 'undoEnum' },
// ];

const events = [
    'make',
    'delete',
    'select',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

export const ContextManager = () => {
    let setAILayerContext = useContextStore(
        (state: ContextStoreState) => state.setAILayerContext
    );
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );
    // checking to see if we are setting everything correctly
    let layerID2Contexts = useContextStore(
        (state: ContextStoreState) => state.layerID2Context
    );

    function onLayerChange() {
        for (let layer of app.activeDocument.layers) {
            // Check if the layer is managed by a context
            let layerContext: LayerAIContext = getAILayerContext(layer.id);

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

    // useEffect(() => {
    //     photoshop.action.addNotificationListener(events, onLayerChange);
    //     return () => {
    //         photoshop.action.removeNotificationListener(events, onLayerChange);
    //     };
    // });

    // // Only create the initial counts once.  Let the events figure out everythign else
    // useEffect(() => {
    //     CreateInitialContexts();
    // }, []);

    // /**
    //  * Create the initial contexts for the layers.  Should be done only once when the component first loads.
    //  */
    // function CreateInitialContexts() {
    //     try {
    //         for (let layer of app.activeDocument.layers) {
    //             if (!getAILayerContext(layer.id)) {
    //                 setAILayerContext(layer.id, new LayerAIContext(layer));
    //             }
    //         }
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    /**
     * This retrieves the documents contexts in order of the photoshop layers
     * @returns
     */
    function getContextsInLayerOrder() {
        try {
            let newOrderedContexts = [];
            for (let layer of app.activeDocument.layers) {
                let layerContext = getAILayerContext(layer.id);

                if (layerContext && layerContext.layers.length > 0) {
                    newOrderedContexts.push(layerContext);
                }
            }
            return newOrderedContexts;
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
        let contextList = getContextsInLayerOrder();
        console.log(layerID2Contexts);
        return (
            <>
                {contextList &&
                    contextList.map((context) => (
                        <ContextItem
                            key={context.id}
                            layerContext={context}
                        ></ContextItem>
                    ))}
            </>
        );
    }

    async function createNewContext() {
        let newLayer = await createNewLayer(
            `Context: ${randomlyPickLayerName()}`
        );
        let newContext = new LayerAIContext(newLayer);
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
            {createContextItems()}
        </>
    );
};
