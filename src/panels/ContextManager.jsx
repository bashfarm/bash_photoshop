import { useEffect } from 'react';
import {
    createAILayerContext,
    createAILayerContextId,
    useAppStore,
} from '../store/appStore';

import { ContextItem } from '../components/ContextItem';
const photoshop = require('photoshop');
const app = photoshop.app;

const events = [
    { event: 'make' },
    { event: 'delete' },
    { event: 'select' },
    { event: 'selectNoLayers' },
    { event: 'move' },
    { event: 'undoEvent' },
    { event: 'undoEnum' },
];

export const ContextManager = () => {
    let layerAIContexts = useAppStore((state) => state.layerAIContexts);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);
    let getAILayerContext = useAppStore((state) => state.getAILayerContext);
    let removeLayerid2ContextId = useAppStore(
        (state) => state.removeLayerid2ContextId
    );
    let setLayerid2ContextId = useAppStore(
        (state) => state.setLayerid2ContextId
    );
    let getLayerid2ContextId = useAppStore(
        (state) => state.getLayerid2ContextId
    );

    const includesAny = (arr, values) => values.some((v) => arr.includes(v));

    function hasActiveLayers(context) {
        let contextLayers = context.layers;
        let docLayers = app.activeDocument.layers;
        return includesAny(contextLayers, docLayers);
    }

    function onLayerChange() {
        for (let layer of app.activeDocument.layers) {
            // Check if the layer has a context, if it has an id, then it has a context
            let layerContextId = getLayerid2ContextId(layer.id);
            if (!layerContextId) {
                // Lets get this layers context id so we can retrieve the right context
                // probably could just have this get the context outright, but I was having rerendering issues
                layerContextId = createAILayerContextId(layer);

                // Ok so since there wasn't a contextId, there wasn't a context for this layer in the store
                // so lets set that
                setAILayerContext(layerContextId, createAILayerContext(layer));

                // Ok so lets set that layer id to be mapped to the context id
                // we should be able to get it back later with getLayerid2ContextId()
                setLayerid2ContextId(layer.id, layerContextId);
            } else {
                // lets get this layers context
                let context = getAILayerContext(layerContextId);

                // does this context have any active layers?
                let isActive = hasActiveLayers(context);

                // if not, remove the mapping of the layer and the context by deleting the ID reference.
                // Don't delete the context just in case they do an "undo" and we want to reload it.
                // We just delete the reference to the context by id
                if (!isActive) {
                    removeLayerid2ContextId(layer.id);
                }
            }
        }
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onLayerChange);
        return () => {
            photoshop.action.removeNotificationListener(events, onLayerChange);
        };
    });

    // Only create the initial counts once.  Let the events figure out everythign else
    useEffect(() => {
        CreateInitialContexts();
    }, []);

    /**
     * Create the initial contexts for the layers.  Should be done only once when the component first loads.
     */
    function CreateInitialContexts() {
        try {
            let currentContextLayerId;
            for (let layer of app.activeDocument.layers) {
                currentContextLayerId = createAILayerContextId(layer);
                if (!layerAIContexts[currentContextLayerId]) {
                    let layerAIContext = createAILayerContext(layer);
                    setAILayerContext(currentContextLayerId, layerAIContext);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * This retrieves the documents contexts in order of the photoshop layers
     * @returns {Array}
     */
    function GetContextsInLayerOrder() {
        try {
            let newOrderedContexts = [];
            if (Object.keys(layerAIContexts).length > 0) {
                for (let layer of app.activeDocument.layers) {
                    let layerContext = getAILayerContext(
                        createAILayerContextId(layer)
                    );
                    if (layerContext && layerContext.layers.length > 0) {
                        newOrderedContexts.push(layerContext);
                    }
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
    function CreatecontextItems() {
        let contextList = GetContextsInLayerOrder();
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

    return <>{CreatecontextItems()}</>;
};
