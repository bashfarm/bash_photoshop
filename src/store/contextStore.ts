import produce from 'immer';
import LayerAIContext from 'models/LayerAIContext';
import { Layer } from 'photoshop/dom/Layer';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
// // These are examples of what the objects that should be going in
// let promptStyleRef = {
// 	"id" : "id", // for figuring out the images and prompts used effeciently in a database and during analysis
// 	"prompt":"", // for the prompt to be used in the image
// 	"processedPrompt": "", // for the actual input from the prompt to be used to "style" the image
// 	"isProcessed": false // to effeciently check if the prompt style reference has been processed for important keywords.
// }

// let smallDetail = {
// 	"prompt": "prompt", // The prompt that generated the asset, the fully generated one
// 	"detailName": "", // The part where the user has control of the prompt...what did they put in?  Lets call it detailName and guide the user in to making it a noun
// 	"numInLayer": 0, //
// 	"layer": "{Layer}" // we should get reference to the layer that this detail is on.
// }

// // We want to save this data to mine at some point I think.
// let AILayerContext = {
// 	"id": 0, // this should be the id number of the layer
// 	"smallDetails": [], // The details from the above object
// 	"layerRenegenerationPrompts": [],
// 	"currentPrompt": ""
//   "layers": [] // the layers that belong to the context
//   "history": [] // the hisory of the context
// }

// let sdStyle = {
// 	"name": "" // The name of the style to apply
// }

// let layerId2Context = {
// 	"1" : "1" // The id of the context
// }

export type ContextStoreState = {
    // these contexts do not ever get removed in the app.  There will be no REMOVE context from app or whatever function
    layerID2Context: Record<number, LayerAIContext>;
    contextCache: Record<number, LayerAIContext>;
    // this is a reverse lookup map to context to layers.  This is so we can keep the layers
    // in sync when we are detecting all the events
    setAILayerContext: (layerID: number, layerContext: LayerAIContext) => void;
    getAILayerContext: (layerId: number) => LayerAIContext;
    retreiveContextFromCache: (layerId: number) => LayerAIContext;
    removeAILayerContext: (layerId: number) => void;
    syncPhotoshopLayersAndContexts: (layers: Array<Layer>) => void;
    cacheDeattachedContexts: (layers: Array<Layer>) => Array<LayerAIContext>;
};

export const useContextStore = create(
    immer((set: any, get: any) => ({
        // this data structure is the main context store.  This is what we update the app with.
        layerID2Context: {},
        // this data structure is the cache we used to restore from, the user will hit ctrl+z at some point.
        contextCache: {},
        setAILayerContext: (layerID: number, layerContext: LayerAIContext) =>
            set((state: ContextStoreState) => {
                state.layerID2Context[layerID] = layerContext;
            }),
        getAILayerContext: (layerID: number) => get().layerID2Context[layerID],
        removeAILayerContext: (layerID: number) => {
            let layerContext = get().getAILayerContext(layerID);
            set((state: ContextStoreState) => {
                // making a copy for good measure
                if (layerContext) {
                    console.log('below is the context being removed');
                    console.log(layerContext);
                    state.contextCache[layerID] = layerContext.copy();
                    delete state.layerID2Context[layerID];
                }
            });
        },
        retreiveContextFromCache: (layerID: number) => {
            return get().contextCache[layerID];
        },
        syncPhotoshopLayersAndContexts: (layers: Array<Layer>) => {
            let activeLayerIDsWithContexts = Object.keys(
                get().layerID2Context
            ).map((key) => parseInt(key));
            set((state: ContextStoreState) => {
                let activeLayerIDsInApp = layers.map((layer) => layer.id);
                let layerIDsToCache = activeLayerIDsWithContexts.filter(
                    (x) => !activeLayerIDsInApp.includes(x)
                );
                console.log(layerIDsToCache);
                console.log('🔥🔥🔥🔥🔥🔥🔥');
                console.log(get().layerID2Context);
                for (let layerID of layerIDsToCache) {
                    state.removeAILayerContext(layerID);
                    // state.setAILayerContext(layerID, null);
                }
                console.log(get().layerID2Context);
                console.log('🔥🔥🔥🔥🔥🔥🔥');
            });
        },
        cacheDeattachedContexts: (layers: Array<Layer>) => {
            let currentLayerIDs = layers.map((layer) => layer.id);
            let layerID2Context = get().layerID2Context;

            let layerIDsWithContexts = Object.keys(layerID2Context).map((id) =>
                parseInt(id)
            );
            let detachedIDs = currentLayerIDs.filter(
                (x) => !layerIDsWithContexts.includes(x)
            );
            set((state: ContextStoreState) => {
                for (let id of detachedIDs) {
                    state.removeAILayerContext(id);
                }
            });
        },
    }))
);
