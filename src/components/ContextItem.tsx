import { Textarea } from 'react-uxp-spectrum';
import { ContextStoreState, useContextStore } from '../store/contextStore';

import React from 'react';

import { ContextInfoColumn } from './ContextInfoColumn';
import { ContextToolColumn } from './ContextToolColumn';
import { RegenerationColumn } from './RegenerationColumn';

export type ContextItemProps = {
    contextID: string;
};

export const ContextItem = (props: ContextItemProps) => {
    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    let getContextFromStore = useContextStore((state: ContextStoreState) => {
        return state.getContextFromStore;
    });
    let contexts = useContextStore((state: ContextStoreState) => {
        return state.contexts;
    });
    let layerAssignments = useContextStore((state: ContextStoreState) => {
        return state.layerAssignments;
    });

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row bg-brand">
                <ContextInfoColumn contextID={props.contextID} />
                <ContextToolColumn contextID={props.contextID} />
                <RegenerationColumn contextID={props.contextID} />
            </div>
            <div>
                <Textarea
                    placeholder="Enter a description of the content in this layer"
                    onInput={(event) => {
                        // update the current prompt of the context given the user inputs in this text area component
                        try {
                            let layerContext = getContextFromStore(
                                props.contextID
                            );
                            console.warn(`❤️‍🔥❤️‍🔥`);
                            console.log(layerContext);

                            let copyOfContext = layerContext.copy();
                            console.warn(`❤️‍🔥❤️‍🔥`);
                            copyOfContext.currentPrompt = event.target.value;
                            console.warn(`💀💀`);
                            console.log(layerContext);

                            // Well we will need to get the context, I think we should be able to just keep
                            // pulling the context by the layer id.  the layers will update before anything since
                            // it watches for photoshop events.

                            // ^^ above said. The logic should be 1. set the context by layer id in the context store 2. trigger a rerender of this component
                            // by resetting the component context
                            console.log(contexts);
                            console.log(layerAssignments);
                            saveContextToStore(copyOfContext);
                            console.warn(`💀💀`);
                        } catch (e) {
                            console.log(e);
                        }
                    }}
                    className="w-full"
                ></Textarea>
                <div>{getContextFromStore(props.contextID)?.currentPrompt}</div>
            </div>
        </div>
    );
};
