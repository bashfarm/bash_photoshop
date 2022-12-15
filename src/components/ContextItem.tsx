import { useState } from 'react';
import { Textarea } from 'react-uxp-spectrum';
import { ContextStoreState, useContextStore } from '../store/contextStore';

import LayerAIContext from 'models/LayerAIContext';
import React from 'react';

import { ContextInfoColumn } from './ContextInfoColumn';
import { ContextToolColumn } from './ContextToolColumn';
import { RegenerationColumn } from './RegenerationColumn';

export type ContextItemProps = {
    layerID: number;
};

export const ContextItem = (props: ContextItemProps) => {
    let setAILayerContext = useContextStore(
        (state: ContextStoreState) => state.setAILayerContext
    );
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row bg-brand">
                <ContextInfoColumn layerID={props.layerID} />
                <ContextToolColumn layerID={props.layerID} />
                <RegenerationColumn layerID={props.layerID} />
            </div>
            <div>
                <Textarea
                    placeholder="Enter a description of the content in this layer"
                    onInput={(event) => {
                        // update the current prompt of the context given the user inputs in this text area component
                        let layerContext = getAILayerContext(props.layerID);
                        let copyOfContext = layerContext.copy();
                        copyOfContext.currentPrompt = event.target.value;

                        // Well we will need to get the context, I think we should be able to just keep
                        // pulling the context by the layer id.  the layers will update before anything since
                        // it watches for photoshop events.

                        // ^^ above said. The logic should be 1. set the context by layer id in the context store 2. trigger a rerender of this component
                        // by resetting the component context
                        setAILayerContext(props.layerID, copyOfContext);
                    }}
                    className="w-full"
                ></Textarea>
                <div>{getAILayerContext(props.layerID)?.currentPrompt}</div>
            </div>
        </div>
    );
};
