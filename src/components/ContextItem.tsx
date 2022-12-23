import { Textarea } from 'react-uxp-spectrum';
import { ContextStoreState, useContextStore } from '../store/contextStore';

import React, { useRef, useLayoutEffect, useState } from 'react';

import { ContextInfoColumn } from './ContextInfoColumn';
import { ContextToolColumn } from './ContextToolColumn';
import { RegenerationColumn } from './RegenerationColumn';
import ContextToolbar from './ContextItem/toolbar';
import { getSaveAnimationTimeline } from 'utils/animation_utils';
import { GeneratorSlider } from './generatorInputs/GeneratorSlider';

import _ from 'lodash';
import LayerAIContext from 'models/LayerAIContext';
import { delayStateEventsForStateValue } from 'hooks/utilHooks';
import { GeneratorTextArea } from './generatorInputs/GeneratorTextarea';

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
                <GeneratorSlider
                    contextID={props.contextID}
                    contextKey={
                        'consistencyStrength' as keyof typeof LayerAIContext
                    }
                >
                    Consistency Strength
                </GeneratorSlider>
                <GeneratorSlider
                    contextID={props.contextID}
                    contextKey={
                        'stylingStrength' as keyof typeof LayerAIContext
                    }
                >
                    Styling Strength
                </GeneratorSlider>
                <GeneratorTextArea
                    contextID={props.contextID}
                    contextKey={'currentPrompt' as keyof typeof LayerAIContext}
                    className="w-full"
                    inputDelayTime={1000}
                />
            </div>
        </div>
    );
};
