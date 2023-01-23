import { ContextProps } from './ContextProps';
import React from 'react';
import { negativePromptTagSuggestions } from 'bashConstants';
import TagSelector from 'components/TagSelector';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import ContextObject from 'models/ContextObject';
import ContextTag from 'models/ContextTag';

interface ContextTagAreaProps extends ContextProps {
    // options: Array<string>;
}

export default function ContextTagArea(props: ContextTagAreaProps) {
    return (
        <>
            <TagSelector
                suggestions={negativePromptTagSuggestions}
                contextID={props.contextID}
                contextType={props.contextType}
            />
        </>
    );
}
