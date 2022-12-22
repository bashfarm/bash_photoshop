import React, { FC, useRef } from 'react';
import {
    VisibilityOffRounded,
    VisibilityRounded,
    PaletteIcon,
    GridViewIcon,
    RefreshIcon,
} from 'components/Icons';
import Tool from './Tool';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import {
    toggleOffContextHidingTool,
    toggleOnContextHidingTool,
} from 'services/tools_service';
import { popUpModal } from 'utils/general_utils';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import { StyleReferencesDialog } from 'components/modals/StyleReferencesDialog';
import { SmallUIDetailsDialog } from 'components/modals/SmallUIDetailsDialog';
import { generateAILayer } from 'services/ai_service';
import {
    deleteLayer,
    moveLayer,
    scaleAndFitLayerToCanvas,
} from 'services/layer_service';
import photoshop from 'photoshop';

const ToolbarDivider = () => {
    return (
        <div className="border-r border-[color:var(--uxp-host-border-color)] mx-1 self-stretch"></div>
    );
};

interface ToolSectionProps {
    children: React.ReactNode;
}
const ToolSection: FC<ToolSectionProps> = ({ children }) => {
    return <div className="flex items-center justify-between">{children}</div>;
};

export type ContexToolBarColumnProps = {
    contextID: string;
};

const ContextToolbar = (props: ContexToolBarColumnProps) => {
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    const popupRef = useRef<ExtendedHTMLDialogElement>();
    async function regenerateLayer(deleteOldLayer: boolean = false) {
        try {
            let layerContext = getContextFromStore(props.contextID);
            let newLayer = await generateAILayer(layerContext);
            let oldLayer = layerContext.currentLayer;
            let copyOfContext = layerContext.copy();

            copyOfContext.currentLayer = newLayer;
            saveContextToStore(copyOfContext);

            await moveLayer(
                newLayer,
                oldLayer,
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );
            if (deleteOldLayer) {
                await deleteLayer(oldLayer);
            }
            await scaleAndFitLayerToCanvas(newLayer);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool
                    icon={VisibilityOffRounded}
                    label="hideTool"
                    onClick={async () =>
                        await toggleOnContextHidingTool(
                            getContextFromStore(props.contextID)
                        )
                    }
                />
                <Tool
                    icon={VisibilityRounded}
                    label="unHideTool"
                    onClick={async () =>
                        await toggleOffContextHidingTool(
                            getContextFromStore(props.contextID)
                        )
                    }
                />
            </ToolSection>
            <ToolbarDivider />
            <ToolSection>
                <Tool
                    icon={PaletteIcon}
                    label="Styles"
                    onClick={() =>
                        popUpModal(
                            popupRef,
                            <StyleReferencesDialog
                                handle={popupRef.current}
                                contextID={props.contextID}
                            />,
                            'Styles'
                        )
                    }
                />
                <Tool
                    icon={GridViewIcon}
                    label="Small Details"
                    onClick={() =>
                        popUpModal(
                            popupRef,
                            <SmallUIDetailsDialog
                                handle={popupRef.current}
                                contextID={props.contextID}
                            />,
                            'UI Details'
                        )
                    }
                />
            </ToolSection>
            <ToolbarDivider />
            <ToolSection>
                <Tool
                    icon={RefreshIcon}
                    label="Regenerate Layer"
                    onClick={async () => {
                        await regenerateLayer(false);
                    }}
                />
            </ToolSection>
        </div>
    );
};

export default ContextToolbar;
