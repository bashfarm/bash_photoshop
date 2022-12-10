import produce from 'immer';
import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';

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
    // this is a reverse lookup map to context to layers.  This is so we can keep the layers
    // in sync when we are detecting all the events
    contextID2LayerIDs: Record<number, Array<number>>;
    setAILayerContext: (layerID: number, layerContext: LayerAIContext) => void;
    getAILayerContext: (layerId: number) => LayerAIContext;
    getContextLayerIDs: (contextID: number) => Array<number>;
};

// Immer store wrapper
export const immer = (config: any) => (set: any, get: any) =>
    config((fn: any) => set(produce(fn)), get);

// Don't think I want a remove.  When the user does an undo, I want the context to be available when we detect that layer again.  The context just won't be
// active without layers.
export const useContextStore = create(
    immer((set: any, get: any) => ({
        // these contexts do not ever get removed in the app
        layerID2Context: {},
        contextID2LayerIDs: {},
        setAILayerContext: (layerID: number, layerContext: LayerAIContext) =>
            set((state: ContextStoreState) => {
                state.layerID2Context[layerID] = layerContext;

                // setAILayercontext gets
                let layerIDs = state.contextID2LayerIDs[layerContext.id];

                // Chekc if the context has layers registered.  If it does, well lets keep them
                if (Array.isArray(layerIDs)) {
                    layerIDs = [
                        layerID,
                        ...layerContext.layers.map((layer) => layer.id),
                    ];
                } else {
                    layerIDs = [layerID];
                }
                state.contextID2LayerIDs[layerContext.id] = layerIDs;
            }),
        getAILayerContext: (layerID: number) => get().layerID2Context[layerID],
        getContextLayerIDs: (contextID: number) =>
            get().contextID2LayerIDs[contextID],
    }))
);
