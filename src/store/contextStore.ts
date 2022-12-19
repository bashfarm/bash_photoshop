import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ContextStoreState = {
    layerAssignments: Record<number, string>;
    contextCache: Record<string, LayerAIContext>;
    contexts: Record<string, LayerAIContext>;
    saveContextToStore: (layerContext: LayerAIContext) => void;
    removeContextFromStore: (contextID: string) => void;
    getContextFromCache: (contextID: string) => LayerAIContext;
    getContextFromStore: (contextID: string) => LayerAIContext;
};

// Log every time state is changed
const log = (config: any) => (set: Function, get: Function, api: any) =>
    config(
        (...args: any) => {
            set(...args);
            console.log('CONTEXT STORE👊 NEW STATE:', get());
        },
        get,
        api
    );

export const useContextStore = create(
    immer(
        log((set: any, get: any) => ({
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
            getContextFromCache: (contextID: string) => {
                return get().contextCache[contextID];
            },
        }))
    )
);
