import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ContextStoreState = {
    selectedLayerNames: Array<string>;
    contextCache: Record<string, LayerAIContext>;
    contexts: Record<string, LayerAIContext>;
    saveContextToStore: (layerContext: LayerAIContext) => void;
    removeContextFromStore: (contextID: string) => void;
    getContextFromCache: (contextID: string) => LayerAIContext;
    getContextFromStore: (contextID: string) => LayerAIContext;
    saveSelectedLayerNames: (layerName: Array<string>) => void;
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
        log((set: any, get: any) => {
            let state: ContextStoreState = {
                contextCache: {},
                contexts: {},
                selectedLayerNames: [],
                saveSelectedLayerNames: (layerNames: Array<string>) => {
                    return set((state: ContextStoreState) => {
                        state.selectedLayerNames = layerNames;
                    });
                },
                saveContextToStore: (layerContext: LayerAIContext) => {
                    set((state: ContextStoreState) => {
                        state.contexts[layerContext.id] = layerContext;
                    });
                },
                removeContextFromStore: (contextID: string) => {
                    set((state: ContextStoreState) => {
                        state.contextCache[contextID] =
                            get().contexts[contextID];
                        delete state.contexts[contextID];
                    });
                },
                getContextFromStore: (contextID: string) => {
                    return get().contexts[contextID];
                },
                getContextFromCache: (contextID: string) => {
                    return get().contextCache[contextID];
                },
            };

            return state;
        })
    )
);
