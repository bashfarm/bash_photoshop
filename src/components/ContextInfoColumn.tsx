import { ModelResponse } from 'common/types/sdapi';
import { useAsyncEffect } from 'hooks/fetchHooks';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { getAvailableModels, swapModel } from 'services/ai_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';
import { ContextDropdown } from './generatorInputs/ContextDropdown';
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

export const ContextInfoColumn = (props: ContextInfoColumnProps) => {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );
    let { loading, value } = useAsyncEffect(async () => {
        return getAvailableModels();
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
                        options={['loading models...']}
                    />
                ) : (
                    <ContextDropdown
                        label="Model:"
                        contextID={props.contextID}
                        contextKey={
                            'generationModelName' as keyof typeof LayerAIContext
                        }
                        options={value.map((modelObj: ModelResponse) => {
                            return modelObj.title;
                        })}
                        onChange={(event: any) => {
                            swapModel(event.target.value);
                        }}
                    />
                )}
            </div>
        );
    } catch (e) {
        console.warn('probably a deleted current layer');
        return <DefaultContextInfoColumn></DefaultContextInfoColumn>;
    }
};
