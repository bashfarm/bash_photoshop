import React, { FC, useState } from 'react';
import { PublishIcon, SaveAltIcon, SmartToyIcon } from 'components/icons/index';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import Tool from 'components/Tool';
import {
    loadBashfulProject,
    saveBashfulProject,
} from 'services/bash_app_service';
import { regenLayers } from 'services/layer_service';
import photoshop from 'photoshop';
import { alert } from 'services/alert_service';

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

    const setRegeneratingDocument = useContextStore(
        (state: ContextStoreState) => state.setRegeneratingDocument
    );
    const unSetRegeneratingDocument = useContextStore(
        (state: ContextStoreState) => state.unSetRegeneratingDocument
    );

    let [regneeratingLayers, setRegeneratingLayers] = useState(false);

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool
                    icon={SmartToyIcon}
                    label="Regenerate layers"
                    useAltLabel={regneeratingLayers}
                    altLabel={
                        regneeratingLayers
                            ? 'Regenerating'
                            : 'Regenerate Layers'
                    }
                    onClick={async () => {
                        try {
                            setRegeneratingDocument(
                                photoshop.app.activeDocument
                            );
                            setRegeneratingLayers(true);
                            await regenLayers(
                                Object.values(
                                    (getContextStore() as ContextStoreState)
                                        .layerContexts
                                ),
                                saveContextToStore,
                                getContextStore
                            );
                            alert('Regeneration Complete');
                            setRegeneratingLayers(false);
                            unSetRegeneratingDocument();
                        } catch (e) {
                            console.error('Regenerating Visible Layers', e);
                        }
                    }}
                />

                <Tool
                    icon={SaveAltIcon}
                    label="Export Bashful Template"
                    onClick={async () =>
                        await saveBashfulProject(getContextStore())
                    }
                />
                <Tool
                    icon={PublishIcon}
                    label="Import Bashful Template"
                    onClick={async () => {
                        await loadBashfulProject(setContextStore);
                    }}
                />
            </ToolSection>
        </div>
    );
}
