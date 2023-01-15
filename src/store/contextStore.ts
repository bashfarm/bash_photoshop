import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { immerable } from 'immer';

export class ContextStoreState {
    [immerable] = true;
    contextCache: Record<string, LayerAIContext> = {};
    contexts: Record<string, LayerAIContext> = {};
    set: any = null;
    get: any = null;
    constructor(set: any, get: any) {
        this.contextCache = {};
        this.contexts = {};
        this.set = set;
        this.get = get;
    }
    public saveContextToStore = (layerContext: LayerAIContext) => {
        try {
            this.set((state: ContextStoreState) => {
                console.log(state);
                state.contexts[layerContext.id] = layerContext;
            });
        } catch (e) {
            console.error(e);
        }
    };
    public removeContextFromStore = (contextID: string) => {
        try {
            this.set((state: ContextStoreState) => {
                state.contextCache[contextID] = this.get().contexts[contextID];
                delete state.contexts[contextID];
            });
        } catch (e) {
            console.error(e);
        }
    };
    public getContextFromCache = (contextID: string) => {
        try {
            return this.get().contextCache[contextID];
        } catch (e) {
            console.error(e);
        }
    };
    public getContextFromStore = (contextID: string) => {
        try {
            return this.get().contexts[contextID];
        } catch (e) {
            console.error(e);
        }
    };
    public getContextsFromStore = (contextIDs?: Array<string>) => {
        if (contextIDs) {
            return contextIDs.map((contextID) => {
                try {
                    return this.get().contexts[contextID];
                } catch (e) {
                    console.error(e);
                }
            });
        }

        try {
            return this.get().contexts.values();
        } catch (e) {
            console.error(e);
        }
    };
    public getContextStore = () => {
        try {
            return this.get();
        } catch (e) {
            console.error(e);
        }
    };
    public setContextStore = (stateData: ContextStoreState) => {
        this.contexts = {};
        this.set((state: any) => {
            for (let key of Object.keys(stateData.contexts)) {
                let instantiatedLayerContext = new LayerAIContext(
                    stateData.contexts[key]
                );
                state.contexts[instantiatedLayerContext.id] =
                    instantiatedLayerContext;
            }
        });
    };
}

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
            return new ContextStoreState(set, get);
        })
    )
);
