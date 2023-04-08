import React from 'react';

import ContextInfoColumn from './ContextItemInfoColumn';
import { MemoizedContextItemToolColumn } from './ContextItemToolColumn';
import ContextItemToolBar, {
    ContextItemToolBarMemo,
} from './ContextItemToolBar';
import ContextItemSlider from './ContextItemSlider';

import _ from 'lodash';
import LayerAIContext from 'models/LayerAIContext';
import ContextItemTextarea from './ContextItemTextarea';
import { useRenderCounter, useRenderSpeed } from 'utils/profiling_utils';
export type ContextItemProps = {
    contextID: string;
    onDelete?: (contextID: string) => void;
};

export default function ContextItem(props: ContextItemProps) {
    useRenderCounter('ContextItem');
    return (
        <div className="flex flex-col p-1 bg-[color:var(--uxp-host-widget-hover-background-color)] border border-[color:var(--uxp-host-border-color)] rounded">
            <ContextItemToolBarMemo contextID={props.contextID} />
            <div className="flex">
                <ContextInfoColumn contextID={props.contextID} />
                <MemoizedContextItemToolColumn contextID={props.contextID} />
            </div>
            <div>
                <ContextItemSlider
                    animate={true}
                    contextID={props.contextID}
                    contextKey={
                        'consistencyStrength' as keyof typeof LayerAIContext
                    }
                >
                    Consistency Strength
                </ContextItemSlider>
                <ContextItemSlider
                    animate={true}
                    contextID={props.contextID}
                    contextKey={
                        'stylingStrength' as keyof typeof LayerAIContext
                    }
                >
                    Styling Strength
                </ContextItemSlider>
                <ContextItemTextarea
                    contextID={props.contextID}
                    contextKey={'currentPrompt' as keyof typeof LayerAIContext}
                    className="w-full select-none"
                    inputDelayTime={1000}
                />
            </div>
        </div>
    );
}

export const MemoizedContextItem = React.memo(ContextItem);
