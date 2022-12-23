import React, { FC, useRef, useState, useEffect } from 'react';
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
import photoshop from 'photoshop';
import Spectrum from 'react-uxp-spectrum';

const events = [
    'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

const deleteEvent = ['delete'];

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
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );
    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let contexts = useContextStore(
        (state: ContextStoreState) => state.contexts
    );

    let [selectedLayerName, setSelectedLayerName] = useState<string>(null);
    let [unSelectedLayers, setUnSelectedLayers] = useState<Array<string>>(null);

    function onLayerChange() {
        console.log(contexts);
        setUnSelectedLayers(
            photoshop.app.activeDocument.layers.map((layer) => layer.name)
        );
    }

    /**
     * This function is used as an event handler for the delete event.  This is used to delete the context from the store if the layer is deleted
     * from the active documents layers.
     */
    function onDelete() {
        try {
            console.log(contexts);

            for (let context of Object.values(contexts)) {
                if (
                    !photoshop.app.activeDocument.layers.includes(
                        context.currentLayer
                    )
                ) {
                    console.warn(
                        photoshop.app.activeDocument.layers.map(
                            (layer) => layer.name
                        )
                    );
                    console.warn(
                        photoshop.app.activeDocument.layers.map(
                            (layer) => context.currentLayer
                        )
                    );
                    // let copyOfContext = context.copy();
                    // copyOfContext.currentLayer = null;
                    // saveContextToStore(copyOfContext);
                }
            }
        } catch (e) {
            console.error(e);
        }

        setUnSelectedLayers(
            photoshop.app.activeDocument.layers.map((layer) => layer.name)
        );
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onLayerChange);
        photoshop.action.addNotificationListener(deleteEvent, onDelete);
        return () => {
            photoshop.action.removeNotificationListener(events, onLayerChange);
            photoshop.action.removeNotificationListener(deleteEvent, onDelete);
        };
    }, []);

    useEffect(() => {
        setUnSelectedLayers(
            photoshop.app.activeDocument.layers.map((layer) => layer.name)
        );
        let copyOfContext = layerContext.copy();
        copyOfContext.currentLayer = photoshop.app.activeDocument.layers.filter(
            (layer) => selectedLayerName == layer.name
        )[0];

        saveContextToStore(copyOfContext);
    }, [selectedLayerName]);

    function onDropDownSelect(layerName: string) {
        setSelectedLayerName(layerName);
        let copyOfContext = layerContext.copy();
        copyOfContext.currentLayer = photoshop.app.activeDocument.layers.filter(
            (layer) => layerName == layer.name
        )[0];

        saveContextToStore(copyOfContext);
    }

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <Spectrum.Dropdown>
                <Spectrum.Menu slot="options">
                    {unSelectedLayers &&
                        (() => {
                            console.log(unSelectedLayers);
                            return true;
                        })() &&
                        unSelectedLayers.map((layerName) => {
                            try {
                                return (
                                    <Spectrum.MenuItem
                                        key={layerName}
                                        onClick={() =>
                                            onDropDownSelect(layerName)
                                        }
                                        selected={
                                            selectedLayerName == layerName
                                        }
                                    >
                                        {layerName}
                                    </Spectrum.MenuItem>
                                );
                            } catch (e) {
                                console.error(e);
                            }
                        })}
                </Spectrum.Menu>
            </Spectrum.Dropdown>
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
                    newLayerNameSetter={setSelectedLayerName}
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
