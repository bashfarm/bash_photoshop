import { ModelConfigResponse, ModelResponse } from 'common/types/sdapi';
import { useAsyncEffect } from 'hooks/fetchHooks';
import _ from 'lodash';
import LayerAIContext from 'models/LayerAIContext';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Spectrum from 'react-uxp-spectrum';
import {
    getAvailableModelConfigs,
    getAvailableModels,
} from 'services/ai_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { useRenderCounter } from 'utils/profiling_utils';
import ContextItemLabel from './ContextItemLabel';

export type ContextInfoColumnProps = {
    contextID: string;
};

export type DropDownProps = {
    contextID: string;
    options: DropDownOption[];
};

interface DropDownOption {
    value: string;
    displayName: string;
}

function DropdownMenu(props: DropDownProps) {
    useRenderCounter('dropdownMenu');

    let [selectedOption, setSelectedOption] = React.useState<DropDownOption>(
        props.options[0]
    );

    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    function onDropDownSelect(option: DropDownOption) {
        let copyOfContext = getContextFromStore(props.contextID).copy();
        copyOfContext.model_config = option.value;
        saveContextToStore(copyOfContext);
        setSelectedOption(option);
    }

    return (
        <Spectrum.Menu slot="options">
            {props.options?.map((option: DropDownOption) => {
                try {
                    return (
                        <Spectrum.MenuItem
                            key={_.uniqueId()}
                            onClick={() => onDropDownSelect(option)}
                            selected={(() => {
                                return selectedOption.value == option.value;
                            })()}
                        >
                            {option.displayName}
                        </Spectrum.MenuItem>
                    );
                } catch (e) {
                    console.error(e);
                }
            })}
        </Spectrum.Menu>
    );
}

const MemoizedDropdownMenu = React.memo(DropdownMenu);

export default function ContextItemInfoColumn(props: ContextInfoColumnProps) {
    useRenderCounter('ContextItemInfoColumn');
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    const layerContext = getContextFromStore(props.contextID);

    // Add a separate state for isCloudRun
    const [isCloudRun, setIsCloudRun] = useState(layerContext.is_cloud_run);

    // Update isCloudRun state when layerContext changes
    useEffect(() => {
        setIsCloudRun(layerContext.is_cloud_run);
    }, [layerContext]);

    useEffect(() => {
        console.log('ContextItemInfoColumn: useEffect');
    }, [isCloudRun]);

    let { loading, value } = useAsyncEffect(async () => {
        if (isCloudRun == false) {
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
    });

    function getDropDownOptions() {
        if (isCloudRun) {
            return value
                .map((modelObj: ModelConfigResponse) => {
                    return {
                        displayName: modelObj.display_name,
                        value: modelObj.name,
                    } as DropDownOption;
                })
                .filter(
                    (option: DropDownOption) =>
                        option.displayName != null && option.displayName != ''
                )
                .sort((a: DropDownOption, b: DropDownOption) =>
                    a.displayName.localeCompare(b.displayName)
                );
        }

        return value
            .map((modelObj: ModelResponse) => {
                return {
                    displayName: modelObj.title,
                    value: modelObj.model_name,
                } as DropDownOption;
            })
            .filter(
                (option: DropDownOption) =>
                    option.displayName != null && option.displayName != ''
            )
            .sort((a: DropDownOption, b: DropDownOption) =>
                a.displayName.localeCompare(b.displayName)
            );
    }

    function getDropDownMenu() {
        if (!loading) {
            return (
                <DropdownMenu
                    contextID={props.contextID}
                    options={getDropDownOptions()}
                />
            );
        } else {
            return (
                <DropdownMenu
                    contextID={props.contextID}
                    options={[
                        {
                            displayName: 'Loading Values',
                            value: 'StableDiffusion-Config',
                        },
                    ]}
                />
            );
        }
    }

    return (
        <div className="flex flex-col min-w-fit justify-center">
            {isCloudRun ? (
                <Spectrum.Dropdown>{getDropDownMenu()}</Spectrum.Dropdown>
            ) : (
                <div>yolo</div>
            )}
        </div>
    );
}
