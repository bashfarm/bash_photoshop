import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ContextStoreState = {
    layerAssignments: Record<number, string>;
    contextCache: Record<string, LayerAIContext>;
    contexts: Record<string, LayerAIContext>;
    saveContextToStore: (layerContext: LayerAIContext) => void;
    removeContextFromStore: (contextID: string) => void;
    getLayerAssignment: (layerID: number) => string;
    saveLayerAssignment: (layerID: number, contextID: string) => void;
    removeLayerAssignment: (layerID: number) => void;
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
        removeLayerAssignment: (layerID: number) => {
            set((state: ContextStoreState) => {
                delete state.layerAssignments[layerID];
            });
        },
        getContextFromStore: (contextID: string) => {
            return get().contexts[contextID];
        },
        getLayerAssignment: (layerID: number) =>
            get().layerAssignments[layerID],
        saveLayerAssignment: (layerID: number, contextID: string) =>
            set((state: ContextStoreState) => {
                state.layerAssignments[layerID] = contextID;
            }),
        getContextFromCache: (contextID: string) => {
            return get().contextCache[contextID];
        },
    }))
);
