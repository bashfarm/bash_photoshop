import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { immerable } from 'immer';
import { logCallingFunction } from 'utils/general_utils';
import { BashfulObject } from 'models/BashfulObject';

export class ContextStoreState extends BashfulObject {
    [immerable] = true;
    layerContextCache: Record<string, LayerAIContext> = {};
    layerContexts: Record<string, LayerAIContext> = {};
    selectedAIBrushContext: LayerAIContext = null;
    set: any = null;
    get: any = null;
    constructor(set: any, get: any) {
        super();
        this.layerContextCache = {};
        this.layerContexts = {};
        this.selectedAIBrushContext = null;
        this.set = set;
        this.get = get;
    }

    public saveContextToStore = (context: LayerAIContext) => {
        logCallingFunction(this.saveContextToStore);
        try {
            this.set((state: ContextStoreState) => {
                state.layerContexts[context.id] = context;
            });
        } catch (e) {
            console.error(e);
        }
    };
    public removeContextFromStore = (contextID: string) => {
        logCallingFunction(this.removeContextFromStore);
        try {
            this.set((state: ContextStoreState) => {
                state.layerContextCache[contextID] =
                    this.get().layerContexts[contextID];
                delete state.layerContexts[contextID];
            });
        } catch (e) {
            console.error(e);
        }
    };
    public getContextFromCache = (contextID: string) => {
        try {
            return this.get().layerContextCache[contextID];
        } catch (e) {
            console.error(e);
        }
    };
    public getContextFromStore = (contextID: string) => {
        try {
            return this.get().layerContexts[contextID];
        } catch (e) {
            console.error(e);
        }
    };
    public getContextsFromStore = (contextIDs: Array<string>) => {
        if (contextIDs) {
            return contextIDs.map((contextID) => {
                try {
                    return this.get().layerContexts[contextID];
                } catch (e) {
                    console.error(e);
                }
            });
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
        logCallingFunction(this.setContextStore);
        this.setInstantiatedLayerContexts(stateData);
    };
    private setInstantiatedLayerContexts = (stateData: ContextStoreState) => {
        logCallingFunction(this.setInstantiatedLayerContexts);
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
