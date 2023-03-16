import React, { FC, useRef } from 'react';
import {
    PublishIcon,
    SaveAltIcon,
    VisibilityOffRounded,
    VisibilityRounded,
} from 'components/icons/index';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import Tool from 'components/Tool';
import LayerAIContext from 'models/LayerAIContext';
import {
    loadBashfulProject,
    saveBashfulProject,
} from 'services/bash_app_service';
import { getPhotoshopLayerFromName } from 'utils/ps_utils';
import {
    createTempLayers,
    regenerateLayer,
    regenerateVisibleLayers,
} from 'services/layer_service';

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

    const popupRef = useRef<ExtendedHTMLDialogElement>();

    async function regenLayers(contexts: Array<LayerAIContext>) {
        console.debug('contexts', contexts);
        let contextsToGenerateFrom = contexts.filter((context) => {
            return context.currentLayer?.visible;
        });
        let newContexts = await createTempLayers(contextsToGenerateFrom);

        // newContexts.forEach((context) => {
        //     let layer = context.currentLayer;
        //     console.debug('Regenerating layer', layer?.name);
        //     regenerateLayer(context, true);
        // });

        console.debug('Regenerating visible layers');
        regenerateVisibleLayers(contexts);
    }

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool
                    icon={VisibilityOffRounded}
                    label="Regenerate Visible layers"
                    onClick={async () => {
                        console.debug('Regenerating layers');
                        try {
                            await regenLayers(
                                Object.values(
                                    (getContextStore() as ContextStoreState)
                                        .layerContexts
                                )
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
