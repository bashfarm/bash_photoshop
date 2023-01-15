import React, { FC, useRef } from 'react';
import { VisibilityOffRounded, VisibilityRounded } from 'components/Icons';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import Tool from 'components/Tool';
import LayerAIContext from 'models/LayerAIContext';
import {
    loadBashfulProject,
    saveBashfulProject,
} from 'services/bash_app_service';

const ToolbarDivider = () => {
    return (
        <div className="border-r border-[color:var(--uxp-host-border-color)] mx-1 self-stretch" />
    );
};

interface ToolSectionProps {
    children: React.ReactNode;
}
const ToolSection: FC<ToolSectionProps> = ({ children }) => {
    return <div className="flex items-center justify-between">{children}</div>;
};

export default function ContextToolBar() {
    const getContextsFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextsFromStore
    );

    const getContextStore = useContextStore(
        (state: ContextStoreState) => state.getContextStore
    );

    const setContextStore = useContextStore(
        (state: ContextStoreState) => state.setContextStore
    );

    const popupRef = useRef<ExtendedHTMLDialogElement>();

    function regenerateLayers(contexts: Array<LayerAIContext>) {}

    function regenerateSelectedLayers(contexts: Array<LayerAIContext>) {}

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool
                    icon={VisibilityOffRounded}
                    label="Regenerate All layers"
                    onClick={async () =>
                        await regenerateLayers(getContextsFromStore())
                    }
                />
                <Tool
                    icon={VisibilityRounded}
                    label="Regenerate Selected Layers"
                    onClick={async () =>
                        await regenerateSelectedLayers(getContextsFromStore())
                    }
                />
                <Tool
                    icon={VisibilityRounded}
                    label="Save Project"
                    onClick={async () =>
                        await saveBashfulProject(getContextStore())
                    }
                />
                <Tool
                    icon={VisibilityRounded}
                    label="Load Project"
                    onClick={async () => {
                        await loadBashfulProject(setContextStore);
                    }}
                />
            </ToolSection>
            <ToolbarDivider />
        </div>
    );
}
