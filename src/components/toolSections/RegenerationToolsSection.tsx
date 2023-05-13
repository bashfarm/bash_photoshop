import { SmartToyIcon } from 'components/icons/index';
import RegenerationTool from 'components/RegenerationTool';
import React from 'react';
import { ToolSection } from './ToolSection';

interface RegenerationToolsSectionProps {
    contextID: string;
    isPrimary?: boolean;
}

export function RegenerationToolsSection(props: RegenerationToolsSectionProps) {
    return (
        <ToolSection>
            <RegenerationTool
                icon={SmartToyIcon}
                label={
                    props.isPrimary ? 'Regenerate Document' : 'Regenerate Layer'
                }
                contextId={props.contextID}
                isPrimary={props.isPrimary}
            />
        </ToolSection>
    );
}
