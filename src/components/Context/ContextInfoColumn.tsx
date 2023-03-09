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

    let { loading, value } = useAsyncEffect(async () => {
        if (layerContext.is_cloud_run == false) {
            return getAvailableModels();
        } else {
            return getAvailableModelConfigs();
        }
    }, [layerContext.is_cloud_run]);

    function getDropDownOptions() {
        if (loading) {
            return ['loading models...'];
        } else {
            if (layerContext.is_cloud_run == false) {
                return value
                    .map((modelObj: ModelResponse) => {
                        return modelObj.title;
                    })
                    .filter((name: string) => name != null);
            } else {
                return value
                    .map((modelObj: ModelConfigResponse) => {
                        return modelObj.display_name;
                    })
                    .filter((name: string) => name != null);
            }
        }
    }

    function getCorrectContextKey() {
        if (!layerContext.is_cloud_run) {
            return 'generationModelName' as keyof typeof LayerAIContext;
        }

        return 'model_config' as keyof typeof LayerAIContext;
    }

    try {
        return (
            <div className="flex flex-col min-w-fit justify-center">
                <ContextLabel
                    value={layerContext.currentLayer?.name}
                    labelText={'Layer Name:'}
                />
                {loading ? (
                    <ContextDropdown
                        label="Model:"
                        contextID={props.contextID}
                        contextType={ContextType.LAYER}
                        options={['loading models...']}
                    />
                ) : (
                    getDropDownOptions().length > 0 && (
                        <ContextDropdown
                            // Not sure why, but is_cloud_run is backwards
                            label={
                                !layerContext.is_cloud_run
                                    ? 'Model:'
                                    : 'Art Type:'
                            }
                            contextID={props.contextID}
                            contextType={ContextType.LAYER}
                            contextKey={getCorrectContextKey()}
                            options={getDropDownOptions()}
                            onChange={(event: any) => {
                                // swapModel(event.target.value);
                            }}
                        />
                    )
                )}
            </div>
        );
    } catch (e) {
        console.warn('probably a deleted current layer');
        return <DefaultContextInfoColumn></DefaultContextInfoColumn>;
    }
}
