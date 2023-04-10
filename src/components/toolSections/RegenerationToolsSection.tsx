import { SmartToyIcon } from 'components/icons/index';
import RegenerationTool from 'components/RegenerationTool';
import React from 'react';
import { ToolSection } from './ToolSection';

interface RegenerationToolsSectionProps {
    contextID: string;
}

export function RegenerationToolsSection(props: RegenerationToolsSectionProps) {
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
