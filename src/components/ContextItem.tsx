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
    const layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

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
                        try {
                            let copyOfContext = layerContext.copy();
                            copyOfContext.currentPrompt = event.target.value;
                            saveContextToStore(copyOfContext);
                        } catch (e) {
                            console.log(e);
                        }
                    }}
                    className="w-full"
                ></Textarea>
                <div>{layerContext?.currentPrompt}</div>
            </div>
        </div>
    );
};
