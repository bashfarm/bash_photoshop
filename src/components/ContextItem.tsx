import { useState } from 'react';
import { Textarea } from 'react-uxp-spectrum';
import { ContextStoreState, useContextStore } from '../store/contextStore';

import LayerAIContext from 'models/LayerAIContext';
import React from 'react';

import { ContextInfoColumn } from './ContextInfoColumn';
import { ContextToolColumn } from './ContextToolColumn';
import { RegenerationColumn } from './RegenerationColumn';
import { Layer } from 'photoshop/dom/Layer';

export type ContextItemProps = {
    contextID: string;
};

export const ContextItem = (props: ContextItemProps) => {
    let getLayerAssignment = useContextStore((state: ContextStoreState) => {
        return state.getLayerAssignment;
    });
    let saveLayerAssignment = useContextStore((state: ContextStoreState) => {
        return state.saveLayerAssignment;
    });
    let [selectedLayer, setSelectedLayer] = useState<Layer>(null);

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row bg-brand">
                <ContextInfoColumn
                    onSelect={setSelectedLayer}
                    contextID={props.contextID}
                />
                <ContextToolColumn contextID={props.contextID} />
                <RegenerationColumn contextID={props.contextID} />
            </div>
            <div>
                <Textarea
                    placeholder="Enter a description of the content in this layer"
                    onInput={(event) => {
                        // update the current prompt of the context given the user inputs in this text area component
                        if (selectedLayer) {
                            let layerContext = getLayerAssignment(
                                selectedLayer.id
                            );
                            let copyOfContext = layerContext.copy();
                            copyOfContext.currentPrompt = event.target.value;

                            // Well we will need to get the context, I think we should be able to just keep
                            // pulling the context by the layer id.  the layers will update before anything since
                            // it watches for photoshop events.

                            // ^^ above said. The logic should be 1. set the context by layer id in the context store 2. trigger a rerender of this component
                            // by resetting the component context
                            saveLayerAssignment(
                                selectedLayer.id,
                                copyOfContext
                            );
                        }
                    }}
                    className="w-full"
                ></Textarea>
                <div>
                    {getLayerAssignment(selectedLayer?.id)?.currentPrompt}
                </div>
            </div>
        </div>
    );
};
