import { DeleteIcon } from 'components/icons/index';
import Tool from 'components/Tool';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { useRenderCounter } from 'utils/profiling_utils';
import { ToolSection } from './ToolSection';

interface RemoveSectionProps {
    contextID: string;
}

export function RemoveSection(props: RemoveSectionProps) {
    useRenderCounter('RegenerationToolsSection');

    const removeContextFromStore = useContextStore(
        (state: ContextStoreState) => state.removeContextFromStore
    );

    return (
        <ToolSection>
            <Tool
                icon={DeleteIcon}
                label="Delete Context"
                onClick={() => removeContextFromStore(props.contextID)}
            />
        </ToolSection>
    );
}
