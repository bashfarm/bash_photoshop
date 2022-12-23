import React from 'react';

import { ContextInfoColumn } from './ContextInfoColumn';
import { ContextToolColumn } from './ContextToolColumn';
import { RegenerationColumn } from './RegenerationColumn';
import ContextToolbar from './ContextItem/toolbar';
import { ContextSlider } from './generatorInputs/ContextSlider';

import _ from 'lodash';
import LayerAIContext from 'models/LayerAIContext';
import { ContextTextarea } from './generatorInputs/ContextTextarea';

export type ContextItemProps = {
    contextID: string;
};

export const ContextItem = (props: ContextItemProps) => {
    return (
        <div className="flex flex-col p-1 bg-[color:var(--uxp-host-widget-hover-background-color)] border border-[color:var(--uxp-host-border-color)] rounded">
            <ContextToolbar contextID={props.contextID} />
            <div className="flex">
                <ContextInfoColumn contextID={props.contextID} />
                <ContextToolColumn contextID={props.contextID} />
                <RegenerationColumn contextID={props.contextID} />
            </div>
            <div>
                <ContextSlider
                    contextID={props.contextID}
                    contextKey={
                        'consistencyStrength' as keyof typeof LayerAIContext
                    }
                >
                    Consistency Strength
                </ContextSlider>
                <ContextSlider
                    contextID={props.contextID}
                    contextKey={
                        'stylingStrength' as keyof typeof LayerAIContext
                    }
                >
                    Styling Strength
                </ContextSlider>
                <ContextTextarea
                    contextID={props.contextID}
                    contextKey={'currentPrompt' as keyof typeof LayerAIContext}
                    className="w-full select-none"
                    inputDelayTime={1000}
                />
            </div>
        </div>
    );
};
