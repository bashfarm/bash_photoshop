import React, { FC, useRef } from 'react';
import {
    PublishIcon,
    SaveAltIcon,
    VisibilityOffRounded,
} from 'components/icons/index';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import Tool from 'components/Tool';
import {
    loadBashfulProject,
    saveBashfulProject,
} from 'services/bash_app_service';
import { regenLayers } from 'services/layer_service';

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
    const getContextStore = useContextStore(
        (state: ContextStoreState) => state.getContextStore
    );

    const setContextStore = useContextStore(
        (state: ContextStoreState) => state.setContextStore
    );

    const saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    const popupRef = useRef<ExtendedHTMLDialogElement>();

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool
                    icon={VisibilityOffRounded}
                    label="Regenerate layers"
                    onClick={async () => {
                        console.debug('Regenerating layers');
                        try {
                            await regenLayers(
                                Object.values(
                                    (getContextStore() as ContextStoreState)
                                        .layerContexts
                                ),
                                saveContextToStore,
                                getContextStore
                            );
                        } catch (e) {
                            console.error('Regenerating Visible Layers', e);
                        }
                    }}
                />

                <Tool
                    icon={SaveAltIcon}
                    label="Save Project"
                    onClick={async () =>
                        await saveBashfulProject(getContextStore())
                    }
                />
                <Tool
                    icon={PublishIcon}
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
