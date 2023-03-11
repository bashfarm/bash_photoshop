import LayerAIContext from 'models/LayerAIContext';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { immerable } from 'immer';
import PromptAIContext from 'models/PromptAIContext';
import { ContextType } from 'bashConstants';
import { logCallingFunction } from 'utils/general_utils';
import { BashfulObject } from 'models/BashfulObject';

export class ContextStoreState extends BashfulObject {
    [immerable] = true;
    layerContextCache: Record<string, LayerAIContext> = {};
    promptContextCache: Record<string, PromptAIContext> = {};
    layerContexts: Record<string, LayerAIContext> = {};
    promptContexts: Record<string, PromptAIContext> = {};
    selectedPromptContext: PromptAIContext = null;
    set: any = null;
    get: any = null;
    constructor(set: any, get: any) {
        super();
        this.layerContextCache = {};
        this.promptContextCache = {};
        this.layerContexts = {};
        this.set = set;
        this.get = get;
    }
    public saveContextToStore = (context: LayerAIContext | PromptAIContext) => {
        logCallingFunction(this.saveContextToStore);
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
        logCallingFunction(this.removeContextFromStore);
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
        logCallingFunction(this.setContextStore);
        this.setInstantiatedLayerContexts(stateData);
        this.setInstantiatedPromptContexts(stateData);
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
    private setInstantiatedPromptContexts = (stateData: ContextStoreState) => {
        logCallingFunction(this.setInstantiatedPromptContexts);
        this.set((state: any) => {
            state.promptContexts = {};
            for (let key of Object.keys(stateData.layerContexts)) {
                let instantiatedPromptContext = new PromptAIContext(
                    stateData.promptContexts[key]
                );
                state.promptContexts[instantiatedPromptContext.id] =
                    instantiatedPromptContext;
            }
        });
    };
	public setSelectedPromptContext = (promptContext: PromptAIContext) => {
        logCallingFunction(this.setSelectedPromptContext);
        this.set((state: any) => {
            state.selectedPromptContext = promptContext;
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
