import LayerAIContext from 'models/LayerAIContext';
import { Layer } from 'photoshop/dom/Layer';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ContextStoreState = {
    layerAssignments: Record<number, LayerAIContext>;
    contextCache: Record<string, LayerAIContext>;
    contexts: Record<string, LayerAIContext>;
    saveContextToStore: (layerContext: LayerAIContext) => void;
    removeContextFromStore: (contextID: string) => void;
    getLayerAssignment: (layerID: number) => LayerAIContext;
    saveLayerAssignment: (
        layerID: number,
        layerContext: LayerAIContext
    ) => void;
    getContextFromCache: (contextID: string) => LayerAIContext;
    getContextFromStore: (contextID: string) => LayerAIContext;
};

export const useContextStore = create(
    immer((set: any, get: any) => ({
        layerAssignments: {},
        contextCache: {},
        contexts: {},
        saveContextToStore: (layerContext: LayerAIContext) => {
            set((state: ContextStoreState) => {
                state.contexts[layerContext.id] = layerContext;
            });
        },
        removeContextFromStore: (contextID: string) => {
            set((state: ContextStoreState) => {
                state.contextCache[contextID] = get().contexts[contextID];
                delete state.contexts[contextID];
            });
        },
        getContextFromStore: (contextID: string) => {
            return get().contexts[contextID];
        },
        getLayerAssignment: (layerID: number) =>
            get().layerAssignments[layerID],
        saveLayerAssignment: (layerID: number, layerContext: LayerAIContext) =>
            set((state: ContextStoreState) => {
                state.layerAssignments[layerID] = layerContext;
            }),
        getContextFromCache: (contextID: string) => {
            return get().contextCache[contextID];
        },
    }))
);
