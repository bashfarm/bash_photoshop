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
import { popUpModal } from 'utils/general_utils';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import { StyleReferencesModal } from 'components/modals/StyleReferencesModal';
import photoshop from 'photoshop';
import Spectrum from 'react-uxp-spectrum';
import Tool from 'components/Tool';
import RegenerationTool from 'components/RegenerationTool';
import ContextPainterModal from 'components/modals/ContextPainterModal';
import { ContextType } from 'bashConstants';
import { Layer } from 'photoshop/dom/Layer';

const events = [
    'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
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

export default function ContextToolBar(props: ContexToolBarColumnProps) {
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    const removeContextFromStore = useContextStore(
        (state: ContextStoreState) => state.removeContextFromStore
    );
    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    const popupRef = useRef<ExtendedHTMLDialogElement>();
    let layerContext = getContextFromStore(props.contextID, ContextType.LAYER);
    console.log(layerContext);
    let [selectedLayerDTO, setSelectedLayerDTO] = useState<LayerDTO>(null);
    let [unSelectedLayers, setUnSelectedLayers] =
        useState<Array<LayerDTO>>(null);

    function onLayerChange() {
        setUnpickedLayers();
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onLayerChange);
        return () => {
            photoshop.action.removeNotificationListener(events, onLayerChange);
        };
    }, []);

    function setUnpickedLayers() {
        setUnSelectedLayers(
            photoshop.app.activeDocument?.layers?.map((layer) => {
                let layerDTO: LayerDTO = {
                    name: layer.name,
                    id: layer.id,
                };
                return layerDTO;
            })
        );
    }

    useEffect(() => {
        setUnpickedLayers();
        let copyOfContext = layerContext.copy();
        copyOfContext.currentLayer =
            photoshop.app.activeDocument?.layers?.filter(
                (layer) => selectedLayerDTO?.id == layer.id
            )[0];

        saveContextToStore(copyOfContext);
    }, [selectedLayerDTO]);

    function onDropDownSelect(selectedLayerDTO: LayerDTO) {
        setSelectedLayerDTO(selectedLayerDTO);
        let copyOfContext = layerContext.copy();
        copyOfContext.currentLayer =
            photoshop.app.activeDocument?.layers?.filter(
                (layer) => selectedLayerDTO.id == layer.id
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
                            console.log(selectedLayerDTO);
                            return true;
                        })() &&
                        unSelectedLayers.map((layerDTO: LayerDTO) => {
                            try {
                                return (
                                    <Spectrum.MenuItem
                                        key={layerDTO.id}
                                        onClick={() =>
                                            onDropDownSelect(layerDTO)
                                        }
                                        selected={
                                            selectedLayerDTO?.id == layerDTO.id
                                        }
                                    >
                                        {layerDTO.name}
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
                    label="Hide"
                    onClick={async () =>
                        await toggleOnContextHidingTool(layerContext)
                    }
                />
                <Tool
                    icon={VisibilityRounded}
                    label="Unhide"
                    onClick={async () =>
                        await toggleOffContextHidingTool(layerContext)
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
                            <StyleReferencesModal
                                handle={popupRef.current}
                                contextID={props.contextID}
                                contextType={ContextType.LAYER}
                            />,
                            'Styles'
                        )
                    }
                />
                {/* <Tool
                    icon={GridViewIcon}
                    label="Increase Resolution"
                    onClick={async () => {
                        let layerContext = getContextFromStore(props.contextID);
                        let fileEntry =
                            await layerContext.saveLayerContexttoHistory(true);
                        let b64Img = await getBase64OfImgInPluginDataFolder(
                            fileEntry.name
                        );
                        let b64Upscaled = await getUpScaledB64(
                            b64Img,
                            layerContext
                        );
                        let upScaledFileEntry =
                            await saveB64ImageToBinaryFileToDataFolder(
                                fileEntry.name,
                                b64Upscaled
                            );
                        let newLayer = await createNewLayerFromFile(
                            upScaledFileEntry.name,
                            true
                        );
                        scaleAndFitLayerToCanvas(newLayer);
                    }}
                /> */}
                <Tool
                    icon={GridViewIcon}
                    label="Context Painter"
                    onClick={() =>
                        popUpModal(
                            popupRef,
                            <ContextPainterModal
                                handle={popupRef.current}
                                contextID={props.contextID}
                            />,
                            'Context Painter'
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
                    newLayerDTOSelectionFunc={setSelectedLayerDTO}
                />
            </ToolSection>
            <ToolbarDivider />
            <ToolSection>
                <Tool
                    icon={DeleteIcon}
                    label="Delete Context"
                    onClick={() =>
                        removeContextFromStore(
                            layerContext.id,
                            ContextType.LAYER
                        )
                    }
                />
            </ToolSection>
        </div>
    );
}
