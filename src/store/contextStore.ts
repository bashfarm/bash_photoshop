import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { immerable } from 'immer';
import { BashfulObject } from 'models/BashfulObject';

export class ContextStoreState extends BashfulObject {
    [immerable] = true;
    layerContexts: Record<string, LayerAIContext> = {};
    regenDocument: any = null;
    layers: Record<string, any> = null;
    set: any = null;
    get: any = null;
    constructor(set: any, get: any) {
        super();
        this.layerContexts = {};
        this.set = set;
        this.get = get;
    }

    public getLayer = (layerId: string) => {
        return this.get().layers[layerId];
    };

    public setLayer = (layerId: string, layer: any) => {
        this.set((state: ContextStoreState) => {
            state.layers[layerId] = layer;
        });
    };

    public removeLayer = (layerId: string) => {
        this.set((state: ContextStoreState) => {
            delete state.layers[layerId];
        });
    };

    /**
     * Save the context to the context store.
     * @param context
     */
    public setRegeneratingDocument = (document: any) => {
        try {
            this.set((state: ContextStoreState) => {
                state.regenDocument = document;
            });
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Save the context to the context store.
     * @param context
     */
    public unSetRegeneratingDocument = () => {
        try {
            this.set((state: ContextStoreState) => {
                state.regenDocument = null;
            });
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Save the context to the context store.
     * @param context
     */
    public saveContextToStore = (context: LayerAIContext) => {
        try {
            this.set((state: ContextStoreState) => {
                state.layerContexts[context.id] = context;
            });
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Remove the context from the context store.
     * @param contextID
     */
    public removeContextFromStore = (contextID: string) => {
        try {
            this.set((state: ContextStoreState) => {
                delete state.layerContexts[contextID];
            });
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Get a specific context from the context store.
     * @param contextID
     * @returns
     */
    public getContextFromStore = (contextID: string) => {
        try {
            return this.get().layerContexts[contextID];
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Get all contexts from the context store.
     * @param contextIDs
     * @returns
     */
    public getContextsFromStore = () => {
        return this.get().layerContexts;
    };

    /**
     * Get the most updated context store.
     * @returns
     */
    public getContextStore = () => {
        try {
            return this.get();
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Sets the context store to the given state data.  This is typically used when loading a bashful project.
     * @param stateData
     */
    public setContextStore = (stateData: ContextStoreState) => {
        this.setInstantiatedLayerContexts(stateData);
    };

    /**
     * Instantiates the layer contexts from the given state data.
     * @param stateData
     */
    private setInstantiatedLayerContexts = (stateData: ContextStoreState) => {
        this.set((state: any) => {
            state.layerContexts = {};
            for (let key of Object.keys(stateData.layerContexts)) {
                let instantiatedLayerContext = new LayerAIContext(
                    stateData.layerContexts[key]
                );
                state.layerContexts[instantiatedLayerContext.id] =
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
            console.debug('CONTEXT STORE👊 NEW STATE:', get());
        },
        get,
        api
    );
// Create the context store
export const useContextStore = create(
    immer(
        log((set: any, get: any) => {
            return new ContextStoreState(set, get);
        })
    )
);
