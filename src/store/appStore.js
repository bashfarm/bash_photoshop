import produce from 'immer';
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

// let layerId2ContextIdMap = {
// 	"1" : "1" // The id of the context
// }

// Immer store wrapper
export const immer = (config) => (set, get) =>
    config((fn) => set(produce(fn)), get);

// Zustand and Immer
export const useAppStore = create(
    immer((set, get) => ({
        promptStyleReferences: {},
        layerId2ContextIdMap: {},
        layerAIContexts: {},
        addPromptStyleRef: (promptStyleRef) =>
            set((state) => {
                state.promptStyleReferences[promptStyleRef.id] = promptStyleRef;
            }),
        setLayerid2ContextId: (layerId, contextId) =>
            set((state) => {
                state.layerId2ContextIdMap[layerId] = contextId;
            }),
        getLayerid2ContextId: (layerId) => get().layerId2ContextIdMap[layerId],
        removeLayerid2ContextId: (layerId) =>
            set((state) => {
                delete state.layerId2ContextIdMap[layerId];
            }),
        setAILayerContext: (intendedLayerContextId, layerAIContext) =>
            set((state) => {
                state.layerAIContexts[intendedLayerContextId] = layerAIContext;
            }),
        setAILayerContextPrompt: (layerAIContext, newPrompt) =>
            set((state) => {
                state.layerAIContexts[layerAIContext.id].currentPrompt =
                    newPrompt;
            }),
        getAILayerContext: (intendedLayerContextId) =>
            get().layerAIContexts[intendedLayerContextId],
        replaceAILayerContext: (
            oldLayerContextId,
            newLayerContextId,
            layerAIContext
        ) =>
            set((state) => {
                state.layerAIContexts[newLayerContextId] = layerAIContext;
                delete state.layerAIContexts[oldLayerContextId];
            }),
        addLayerToContext: (layer, layerAIContext) =>
            set((state) => {
                let layerContext = state.layerAIContexts[layerAIContext.id];
                if (!layerContext.layers.includes(layer))
                    layerContext.layers.push(layer);
            }),
        removeLayerToContext: (layer, layerAIContext) =>
            set((state) => {
                let layerContext = state.layerAIContexts[layerAIContext.id];
                if (layerContext.layers.includes(layer))
                    layerContext.layers.remove(layer);
            }),
        deleteContext: (layerAIContextID) =>
            set((state) => {
                delete state.layerAIContexts[layerAIContextID];
            }),
        sdStyles: {},
    }))
);

/**
 *
 * @param {number} id
 * @param {Array} details
 * @param {Array<String>} layerRenegenerationPrompts
 * @param {String} currentPrompt
 * @returns {Object} The object is an AI Layer context for the app state.
 */
export function createAILayerContext(
    layer,
    details = [],
    layerRenegenerationPrompts = [],
    currentPrompt = ''
) {
    return {
        id: createAILayerContextId(layer), // this should be the id number of the layer
        smallDetails: details, // The details from the above object
        layerRenegenerationPrompts: layerRenegenerationPrompts,
        currentPrompt: currentPrompt,
        layers: [layer],
        currentLayer: layer,
    };
}

export function createAILayerContextId(layer) {
    return parseInt(`${layer._id}${layer._docid}`);
}
