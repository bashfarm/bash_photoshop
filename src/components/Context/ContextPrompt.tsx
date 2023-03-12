import { ContextProps } from './ContextProps';
import React from 'react';
import ContextTextarea from './ContextTextarea';
import LayerAIContext from 'models/LayerAIContext';
import ContextTagArea from './ContextTagArea';

interface ContextDropdownProps extends ContextProps {
    options: Array<string>;
}

export default function ContextPrompt(props: ContextDropdownProps) {
    function getContextKey() {
        return 'currentPrompt' as keyof typeof LayerAIContext;
    }
    return (
        <>
            <ContextTextarea
                contextID={props.contextID}
                contextKey={getContextKey()}
                className="w-full select-none"
                inputDelayTime={1000}
            />
            <ContextTagArea contextID={props.contextID} />
        </>
    );
}
