import { ContextProps } from './ContextProps';
import React from 'react';
import ContextTextarea from './ContextTextarea';
import { ContextType } from 'bashConstants';
import LayerAIContext from 'models/LayerAIContext';
import AIBrushContext from 'models/AIBrushContext';
import ContextTagArea from './ContextTagArea';

interface ContextDropdownProps extends ContextProps {
    options: Array<string>;
}

export default function ContextPrompt(props: ContextDropdownProps) {
    function getContextKey() {
        return props.contextType === ContextType.LAYER
            ? ('currentPrompt' as keyof typeof LayerAIContext)
            : ('currentPrompt' as keyof typeof AIBrushContext);
    }
    return (
        <>
            <ContextTextarea
                contextID={props.contextID}
                contextType={props.contextType}
                contextKey={getContextKey()}
                className="w-full select-none"
                inputDelayTime={1000}
            />
            <ContextTagArea
                contextID={props.contextID}
                contextType={props.contextType}
            />
        </>
    );
}
