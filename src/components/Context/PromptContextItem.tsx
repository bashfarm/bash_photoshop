import React from 'react';

import ContextInfoColumn from './ContextInfoColumn';
import ContextToolColumn from './ContextToolColumn';
import LayerContextToolBar from './LayerContextToolBar';
import ContextSlider from './ContextSlider';

import _ from 'lodash';
import LayerAIContext from 'models/LayerAIContext';
import ContextTextarea from './ContextTextarea';
import { ContextType } from 'bashConstants';
import ContextTagArea from './ContextTagArea';
import ContextObject from 'models/ContextObject';
import RegenerationTool from 'components/RegenerationTool';
import { RefreshIcon } from 'components/Icons/index';
import PromptContextToolBar from './PromptContextToolBar';
export type ContextItemProps = {
    contextID: string;
    contextType: ContextType;
};

export default function PromptContextItem(props: ContextItemProps) {
    return (
        <div className="flex flex-col p-1 bg-[color:var(--uxp-host-widget-hover-background-color)] border border-[color:var(--uxp-host-border-color)] rounded">
            <PromptContextToolBar contextID={props.contextID} />
		
            {/* <div className="flex">
                <ContextInfoColumn contextID={props.contextID} />
                <ContextToolColumn contextID={props.contextID} />
            </div> */}
            <div>
                <ContextSlider
                    animate={true}
                    contextID={props.contextID}
                    contextType={props.contextType}
                    contextKey={
                        'consistencyStrength' as keyof typeof ContextObject
                    }
                >
                    Consistency Strength
                </ContextSlider>
                <ContextSlider
                    animate={true}
                    contextID={props.contextID}
                    contextType={props.contextType}
                    contextKey={
                        'stylingStrength' as keyof typeof ContextObject
                    }
                >
                    Styling Strength
                </ContextSlider>
                <ContextTextarea
                    contextID={props.contextID}
                    contextType={props.contextType}
                    contextKey={'currentPrompt' as keyof typeof ContextObject}
                    className="w-full select-none"
                    inputDelayTime={1000}
                />
            </div>
        </div>
    );
}
