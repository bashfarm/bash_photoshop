import { SmartToyIcon } from 'components/icons/index';
import RegenerationTool from 'components/RegenerationTool';
import React from 'react';
import { useRenderCounter } from 'utils/profiling_utils';
import { ToolSection } from './ToolSection';

interface RegenerationToolsSectionProps {
    contextID: string;
}

export function RegenerationToolsSection(props: RegenerationToolsSectionProps) {
    useRenderCounter('RegenerationToolsSection');
    return (
        <ToolSection>
            <RegenerationTool
                icon={SmartToyIcon}
                label="Regenerate Layer"
                contextId={props.contextID}
            />
        </ToolSection>
    );
}
