import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { immerable } from 'immer';
import PromptAIContext from 'models/PromptAIContext';
import { ContextType } from 'bashConstants';

export class ContextStoreState {
    [immerable] = true;
    layerContextCache: Record<string, LayerAIContext> = {};
    promptContextCache: Record<string, PromptAIContext> = {};
    layerContexts: Record<string, LayerAIContext> = {};
    promptContexts: Record<string, PromptAIContext> = {};
    set: any = null;
    get: any = null;
    constructor(set: any, get: any) {
        this.layerContextCache = {};
        this.promptContextCache = {};
        this.layerContexts = {};
        this.set = set;
        this.get = get;
    }
    public saveContextToStore = (context: LayerAIContext | PromptAIContext) => {
        try {
            this.set((state: ContextStoreState) => {
                if (context instanceof LayerAIContext) {
                    state.layerContexts[context.id] = context;
                } else if (context instanceof PromptAIContext) {
                    state.promptContexts[context.id] = context;
                }
            });
        } catch (e) {
            console.error(e);
        }
    };
    public removeContextFromStore = (
        contextID: string,
        contextType: ContextType
    ) => {
        try {
            this.set((state: ContextStoreState) => {
                if (contextType === ContextType.LAYER) {
                    state.layerContextCache[contextID] =
                        this.get().layerContexts[contextID];
                    delete state.layerContexts[contextID];
                } else if (contextType === ContextType.PROMPT) {
                    state.promptContextCache[contextID] =
                        this.get().promptContexts[contextID];
                    delete state.promptContexts[contextID];
                }
            });
        } catch (e) {
            console.error(e);
        }
    };
    public getContextFromCache = (
        contextID: string,
        contextType: ContextType
    ) => {
        try {
            if (contextType === ContextType.LAYER) {
                return this.get().layerContextCache[contextID];
            } else if (contextType === ContextType.PROMPT) {
                return this.get().promptContextCache[contextID];
            }
        } catch (e) {
            console.error(e);
        }
    };
    public getContextFromStore = (
        contextID: string,
        contextType: ContextType
    ) => {
        try {
            if (contextType === ContextType.LAYER) {
                return this.get().layerContexts[contextID];
            } else if (contextType === ContextType.PROMPT) {
                return this.get().promptContexts[contextID];
            }
        } catch (e) {
            console.error(e);
        }
    };
    public getContextsFromStore = (
        contextIDs: Array<string>,
        contextType: ContextType
    ) => {
        if (contextIDs) {
            return contextIDs.map((contextID) => {
                try {
                    if (contextType === ContextType.LAYER) {
                        return this.get().layerContexts[contextID];
                    } else if (contextType === ContextType.PROMPT) {
                        return this.get().promptContexts[contextID];
                    }
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
        console.log('yolo');
        this.setInstantiatedLayerContexts(stateData);
        this.setInstantiatedPromptContexts(stateData);
    };
    private setInstantiatedLayerContexts = (stateData: ContextStoreState) => {
        console.log(stateData.layerContexts);
        console.log(stateData);
        console.log(stateData);
        console.log(stateData['layerContexts']);
        console.log(Object.keys(stateData));
        this.set((state: any) => {
            for (let key of Object.keys(stateData.layerContexts)) {
                console.log(state.layerContexts[key]);
                console.log('before instantiation of layer context');
                let instantiatedLayerContext = new LayerAIContext(
                    stateData.layerContexts[key]
                );
                console.log('after instantiation of layer context');
                console.log(instantiatedLayerContext);
                state.layerContexts[instantiatedLayerContext.id] =
                    instantiatedLayerContext;
            }
        });
    };
    private setInstantiatedPromptContexts = (stateData: ContextStoreState) => {
        this.set((state: any) => {
            for (let key of Object.keys(stateData.layerContexts)) {
                let instantiatedPromptContext = new PromptAIContext(
                    stateData.promptContexts[key]
                );
                state.promptContexts[instantiatedPromptContext.id] =
                    instantiatedPromptContext;
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
