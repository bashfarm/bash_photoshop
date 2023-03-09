import { ContextType } from 'bashConstants';
import { ModelConfigResponse, ModelResponse } from 'common/types/sdapi';
import { useAsyncEffect } from 'hooks/fetchHooks';
import LayerAIContext from 'models/LayerAIContext';
import React, { useState } from 'react';
import {
    getAvailableModelConfigs,
    getAvailableModels,
    swapModel,
} from 'services/ai_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import ContextDropdown from './ContextDropdown';
import ContextLabel from './ContextLabel';

export type ContextInfoColumnProps = {
    contextID: string;
};

function DefaultContextInfoColumn() {
    return (
        <div className="flex flex-col min-w-fit justify-center">
            <ContextLabel value="No layer Selected" labelText={'Layer Name:'} />
            {/*<ContextLabel value="No layer Selected" labelText={'Context ID:'} /> */}
        </div>
    );
}

export default function ContextInfoColumn(props: ContextInfoColumnProps) {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID, ContextType.LAYER)
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let [modelConfigs, setModelConfigs] = useState<
        ModelResponse | ModelConfigResponse
    >(null);
    let [selectedModelConfig, setSelectedModelConfig] = useState<
        ModelResponse | ModelConfigResponse
    >(null);

    let { loading, value } = useAsyncEffect(async () => {
        if (layerContext.is_cloud_run == false) {
            return getAvailableModels();
        } else {
            return getAvailableModelConfigs();
        }
    }, []);

    try {
        return (
            <div className="flex flex-col min-w-fit justify-center">
                <ContextLabel
                    value={layerContext.currentLayer?.name}
                    labelText={'Layer Name:'}
                />
                {/* <ContextDropdown
					contextID={props.contextID}
					contextKey={
						'docType' as keyof typeof LayerAIContext
					}
					options={["illustration", "doodle", "photo", "dream", "3D animation"]} /> */}
                {loading ? (
                    <ContextDropdown
                        label="Model:"
                        contextID={props.contextID}
                        contextType={ContextType.LAYER}
                        options={['loading models...']}
                    />
                ) : (
                    <ContextDropdown
                        label="Model:"
                        contextID={props.contextID}
                        contextType={ContextType.LAYER}
                        contextKey={
                            'generationModelName' as keyof typeof LayerAIContext
                        }
                        options={value
                            .map(
                                (
                                    modelObj:
                                        | ModelResponse
                                        | ModelConfigResponse
                                ) => {
                                    return (
                                        (modelObj as ModelConfigResponse)
                                            ?.display_name ??
                                        (modelObj as ModelResponse).title
                                    );
                                }
                            )
                            .filter((name: string) => name != null)}
                        onChange={(event: any) => {
                            // swapModel(event.target.value);
                            let modelConfig = value.find(
                                (
                                    modelObj:
                                        | ModelResponse
                                        | ModelConfigResponse
                                ) => {
                                    return (
                                        (modelObj as ModelConfigResponse)
                                            ?.display_name ==
                                            event.target.value ||
                                        (modelObj as ModelResponse).title ==
                                            event.target.value
                                    );
                                }
                            );

                            if (modelConfig) {
                                setSelectedModelConfig(modelConfig);
                                let copyOfContext = layerContext.copy();
                                copyOfContext.model_config = (
                                    modelConfig as ModelConfigResponse
                                )?.name;
                                saveContextToStore(copyOfContext);
                                // copyOfContext.generationModelName = (modelConfig as ModelConfigResponse)?.display_name ?? (modelConfig as ModelResponse).title;
                            }
                        }}
                    />
                )}
            </div>
        );
    } catch (e) {
        console.warn('probably a deleted current layer');
        return <DefaultContextInfoColumn></DefaultContextInfoColumn>;
    }
}
