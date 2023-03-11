import React, { FC, useRef, useState, useEffect } from 'react';
import {
    VisibilityOffRounded,
    VisibilityRounded,
    PaletteIcon,
    GridViewIcon,
    RefreshIcon,
    DeleteIcon,
} from 'components/Icons';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import {
    toggleOffContextHidingTool,
    toggleOnContextHidingTool,
} from 'services/tools_service';
import { popUp, popUpModal } from 'utils/general_utils';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import photoshop from 'photoshop';
import Spectrum, { Checkbox, Label, Radio } from 'react-uxp-spectrum';
import Tool from 'components/Tool';
import RegenerationTool from 'components/RegenerationTool';
import ContextPainterModal from 'components/modals/ContextPaletteModal';
import { ContextType } from 'bashConstants';
import { Layer } from 'photoshop/dom/Layer';
import { entrypoints } from 'uxp';

const events = [
    'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
    'openDocument',
];

const ToolbarDivider = () => {
    return (
        <div className="border-r border-[color:var(--uxp-host-border-color)] mx-1 self-stretch"></div>
    );
};

interface ToolSectionProps {
    children: React.ReactNode;
}

interface LayerDTO {
    name: string;
    id: number;
}

const ToolSection: FC<ToolSectionProps> = ({ children }) => {
    return <div className="flex items-center justify-between">{children}</div>;
};

export type ContexToolBarColumnProps = {
    contextID: string;
};

export default function PromptContextToolBar(props: ContexToolBarColumnProps) {
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    const removeContextFromStore = useContextStore(
        (state: ContextStoreState) => state.removeContextFromStore
    );
    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );


    let genAISettings = getContextFromStore(props.contextID, ContextType.PROMPT);


    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">

			<ToolSection>
			<Label>Use Auto1111</Label>
                <Checkbox
                    onChange={async () => {
                        let copyOfContext = getContextFromStore(props.contextID, ContextType.PROMPT).copy();
                        copyOfContext.is_cloud_run =
                            !copyOfContext.is_cloud_run;
                        saveContextToStore(copyOfContext);
                    }}
                />
            </ToolSection>
            <ToolbarDivider />
            <ToolSection>
                <Tool
                    icon={DeleteIcon}
                    label="Delete AI Setting"
                    onClick={() =>
                        removeContextFromStore(
                            genAISettings.id,
                            ContextType.PROMPT
                        )
                    }
                />
            </ToolSection>
            <ToolbarDivider />
			<RegenerationTool
						icon={RefreshIcon}
						label="Regenerate Selection"
						contextId={genAISettings.id}
						contextType={ContextType.PROMPT} />
        </div>
    );
}
