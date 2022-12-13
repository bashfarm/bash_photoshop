import { useState } from 'react';
import { Textarea } from 'react-uxp-spectrum';
import { useContextStore } from '../store/contextStore';

import LayerAIContext from 'models/LayerAIContext';
import React from 'react';

import { ContextInfoColumn } from './ContextInfoColumn';
import { ContextToolColumn } from './ContextToolColumn';
import { RegenerationColumn } from './RegenerationColumn';

export type ContextItemProps = {
    layerContext: LayerAIContext;
};

export const ContextItem = (props: ContextItemProps) => {
    let [thisLayersContext, setThisLayersContext] = useState(
        props.layerContext
    );
    let setAILayerContext = useContextStore((state) => state.setAILayerContext);

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row bg-brand">
                {/* <ContextInfoColumn layerContext={thisLayersContext} /> */}
                <ContextToolColumn layerContext={thisLayersContext} />
                <RegenerationColumn layerContext={thisLayersContext} />
            </div>
            <div>
                <Textarea
                    placeholder="Enter a description of the content in this layer"
                    onInput={(event) => {
                        // update the current prompt of the context given the user inputs in this text area component
                        props.layerContext.currentPrompt = event.target.value;

                        // Well we will need to get the context, I think we should be able to just keep
                        // pulling the context by the layer id.  the layers will update before anything since
                        // it watches for photoshop events.

                        // ^^ above said. The logic should be 1. set the context by layer id in the context store 2. trigger a rerender of this component
                        // by resetting the component context
                        setAILayerContext(
                            props.layerContext.layers[0].id,
                            props.layerContext
                        );
                        setThisLayersContext(props.layerContext);
                    }}
                    className="w-full"
                ></Textarea>
                <div>{thisLayersContext.currentPrompt}</div>
            </div>
        </div>
    );
};
