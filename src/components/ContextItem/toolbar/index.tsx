import React, { FC, useRef } from 'react';
import {
    VisibilityOffRounded,
    VisibilityRounded,
    PaletteIcon,
    GridViewIcon,
    RefreshIcon,
    DeleteIcon,
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
import RegenerationTool from './RegenerationTool';

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
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    const removeContextFromStore = useContextStore(
        (state: ContextStoreState) => state.removeContextFromStore
    );
    const popupRef = useRef<ExtendedHTMLDialogElement>();

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool
                    icon={VisibilityOffRounded}
                    label="Mask"
                    onClick={async () =>
                        await toggleOnContextHidingTool(
                            getContextFromStore(props.contextID)
                        )
                    }
                />
                <Tool
                    icon={VisibilityRounded}
                    label="Unmask"
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
                <RegenerationTool
                    icon={RefreshIcon}
                    label="Regenerate Layer"
                    contextId={props.contextID}
                />
            </ToolSection>
            <ToolbarDivider />
            <ToolSection>
                <Tool
                    icon={DeleteIcon}
                    label="Delete Context"
                    onClick={() => removeContextFromStore(props.contextID)}
                />
            </ToolSection>
        </div>
    );
};

export default ContextToolbar;
