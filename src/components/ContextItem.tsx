import { Slider, Textarea } from 'react-uxp-spectrum';
import { ContextStoreState, useContextStore } from '../store/contextStore';

import React from 'react';

import { ContextInfoColumn } from './ContextInfoColumn';
import { ContextToolColumn } from './ContextToolColumn';
import { RegenerationColumn } from './RegenerationColumn';
import ContextToolbar from './ContextItem/toolbar';
import { ContextLabel } from './ContextLabel';

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
        <div className="flex flex-col p-1 bg-[color:var(--uxp-host-widget-hover-background-color)] border border-[color:var(--uxp-host-border-color)] rounded">
            <ContextToolbar />
            <div className="flex">
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
                {/* <ContextLabel value={''} labelText={'Styling Strength'} /> */}
                <Slider
                    variant="filled"
                    min={0}
                    max={100}
                    value={layerContext.stylingStrength}
                    onChange={(event) => {
                        let copyOfContext = layerContext.copy();
                        copyOfContext.stylingStrength = parseInt(
                            event.target.value
                        );
                        saveContextToStore(copyOfContext);
                    }}
                >
                    <sp-label slot="label">Styling Strength</sp-label>
                </Slider>
                <Slider
                    variant="filled"
                    min={0}
                    max={30}
                    value={layerContext.consistencyStrength}
                    onChange={(event) => {
                        let copyOfContext = layerContext.copy();
                        copyOfContext.consistencyStrength = parseInt(
                            event.target.value
                        );
                        saveContextToStore(copyOfContext);
                    }}
                >
                    <sp-label slot="label">Consistency Strength</sp-label>
                </Slider>
            </div>
        </div>
    );
};
