import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import Tool from 'components/Tool';

import React from 'react';
import {
    toggleOnContextHidingTool,
    toggleOffContextHidingTool,
} from 'services/tools_service';
import { useContextStore, ContextStoreState } from 'store/contextStore';
import { useRenderCounter } from 'utils/profiling_utils';
import { ToolSection } from './ToolSection';

interface MaskingToolsSectionProps {
    contextID: string;
}

export function MaskingToolsSection(props: MaskingToolsSectionProps) {
    useRenderCounter('MaskingToolsSection');
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    return (
        <ToolSection>
            <Tool
                icon={VisibilityOffRounded}
                label="Hide"
                onClick={async () =>
                    await toggleOnContextHidingTool(
                        getContextFromStore(props.contextID)
                    )
                }
            />
            <Tool
                icon={VisibilityRounded}
                label="Unhide"
                onClick={async () =>
                    await toggleOffContextHidingTool(
                        getContextFromStore(props.contextID)
                    )
                }
            />
        </ToolSection>
    );
}
