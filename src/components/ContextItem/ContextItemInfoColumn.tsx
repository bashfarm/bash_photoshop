import { ModelConfigResponse, ModelResponse } from 'common/types/sdapi';
import { Automatic1111Section } from 'components/toolSections/Automatic1111Section';
import { ToolbarDivider } from 'components/toolSections/ToolBarDivider';
import { useAsyncEffect } from 'hooks/fetchHooks';
import LayerAIContext from 'models/LayerAIContext';
import React, { useState } from 'react';
import {
    getAvailableModelConfigs,
    getAvailableModels,
} from 'services/ai_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import ContextDropdown from './ContextItemDropdown';
import ContextItemLabel from './ContextItemLabel';

export type ContextInfoColumnProps = {
    contextID: string;
};

interface DropDownOption {
    value: string;
    displayName: string;
}

function DefaultContextInfoColumn() {
    return (
        <div className="flex flex-col min-w-fit justify-center">
            <ContextItemLabel
                value="No layer Selected"
                labelText={'Layer Name:'}
            />
            {/*<ContextLabel value="No layer Selected" labelText={'Context ID:'} /> */}
        </div>
    );
}

export default function ContextItemInfoColumn(props: ContextInfoColumnProps) {
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    let [isCloudRun, setIsCloudRun] = useState(true);

    let { loading, value } = useAsyncEffect(async () => {
        if (getContextFromStore(props.contextID).is_cloud_run == false) {
            // While this does work, this is for the future where we batch run the models, currently
            // we would have to make sure each local user swaps out the models when they want to use
            // a different model on a specific layer.  We will collect the selection of models for them
            // queue them up and run them in sequence using the currently loaded model and swap only when
            // necessary.
            return getAvailableModels();
            return [];
        } else {
            return getAvailableModelConfigs();
        }
    }, [getContextFromStore(props.contextID).is_cloud_run]);

    function getDropDownOptions() {
        if (loading) {
            return ['loading models...'];
        } else {
            if (isCloudRun == false) {
                return value
                    .map((modelObj: ModelResponse) => {
                        return {
                            displayName: modelObj.title,
                            value: modelObj.title,
                        } as DropDownOption;
                    })
                    .filter(
                        (option: DropDownOption) =>
                            option.displayName != null &&
                            option.displayName != ''
                    );
            } else {
                return value
                    .map((modelObj: ModelConfigResponse) => {
                        return {
                            displayName: modelObj.display_name,
                            value: modelObj.name,
                        } as DropDownOption;
                    })
                    .filter(
                        (option: DropDownOption) =>
                            option.displayName != null &&
                            option.displayName != ''
                    );
            }
        }
    }

    function getCorrectContextKey() {
        if (!getContextFromStore(props.contextID).is_cloud_run) {
            return 'generationModelName' as keyof typeof LayerAIContext;
        }

        return 'model_config' as keyof typeof LayerAIContext;
    }

    try {
        return (
            <div className="flex flex-col min-w-fit justify-center">
                <Automatic1111Section
                    contextID={props.contextID}
                    onChanged={function (value: boolean): void {
                        setIsCloudRun(value);
                        console.log(value);
                    }}
                />
                <ToolbarDivider />
                {loading ? (
                    <ContextDropdown
                        label="Model:"
                        contextID={props.contextID}
                        options={[
                            {
                                displayName: 'loading models...',
                                value: 'loading models...',
                            },
                        ]}
                    />
                ) : (
                    getDropDownOptions().length > 0 && (
                        <ContextDropdown
                            // Not sure why, but is_cloud_run is backwards
                            label={
                                !getContextFromStore(props.contextID)
                                    .is_cloud_run
                                    ? 'Model:'
                                    : 'Art Type:'
                            }
                            contextID={props.contextID}
                            contextKey={getCorrectContextKey()}
                            options={getDropDownOptions()}
                            onChange={(event: any) => {
                                // swapModel(event.target.value);
                                // let selectedConfigObj = getSelectedModelConfig(
                                //     event.target.value.value
                                // );
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
