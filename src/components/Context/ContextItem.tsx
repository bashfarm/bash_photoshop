import React from 'react';

import ContextInfoColumn from './ContextInfoColumn';
import ContextToolColumn from './ContextToolColumn';
import ContextToolBar from './ContextToolBar';
import ContextSlider from './ContextSlider';

import _ from 'lodash';
import LayerAIContext from 'models/LayerAIContext';
import ContextTextarea from './ContextTextarea';
export type ContextItemProps = {
    contextID: string;
};

export default function ContextItem(props: ContextItemProps) {
    return (
        <div className="flex flex-col p-1 bg-[color:var(--uxp-host-widget-hover-background-color)] border border-[color:var(--uxp-host-border-color)] rounded">
            <ContextToolBar contextID={props.contextID} />
            <div className="flex">
                <ContextInfoColumn contextID={props.contextID} />
                <ContextToolColumn contextID={props.contextID} />
            </div>
            <div>
                <ContextSlider
                    animate={true}
                    contextID={props.contextID}
                    contextKey={
                        'consistencyStrength' as keyof typeof LayerAIContext
                    }
                >
                    Consistency Strength
                </ContextSlider>
                <ContextSlider
                    animate={true}
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
}
