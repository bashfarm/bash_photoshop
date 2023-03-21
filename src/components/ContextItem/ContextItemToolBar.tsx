import React, { FC, useRef, useState, useEffect } from 'react';
import {
    VisibilityOffRounded,
    VisibilityRounded,
    RefreshIcon,
    DeleteIcon,
    SmartToyIcon,
} from 'components/icons/index';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import {
    toggleOffContextHidingTool,
    toggleOnContextHidingTool,
} from 'services/tools_service';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import photoshop from 'photoshop';
import Spectrum, { Checkbox, Label } from 'react-uxp-spectrum';
import Tool from 'components/Tool';
import RegenerationTool from 'components/RegenerationTool';
import { getAvailableModels } from 'services/ai_service';
import { useAsyncEffect } from 'hooks/fetchHooks';
import _ from 'lodash';

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

const ToolSection: FC<ToolSectionProps> = ({ children }) => {
    return <div className="flex items-center justify-between">{children}</div>;
};

export type ContexToolBarColumnProps = {
    contextID: string;
};

interface DropDownOption {
    displayName: string;
    value: any;
}

export default function ContextItemToolBar(props: ContexToolBarColumnProps) {
    // let contexts = useContextStore((state: ContextStoreState) => state.layerContexts);
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    const removeContextFromStore = useContextStore(
        (state: ContextStoreState) => state.removeContextFromStore
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let [dropDownLayers, setDropDownLayers] = useState<DropDownOption[]>(
        photoshop.app.activeDocument?.layers?.map((layer) => {
            return {
                displayName: layer.name,
                value: layer.id,
            } as DropDownOption;
        })
    );

    let { loading, value } = useAsyncEffect(async () => {
        // While this does work, this is for the future where we batch run the models, currently
        // we would have to make sure each local user swaps out the models when they want to use
        // a different model on a specific layer.  We will collect the selection of models for them
        // queue them up and run them in sequence using the currently loaded model and swap only when
        // necessary.
        return getAvailableModels();
    });

    useEffect(() => {
        setDropDownLayers(
            photoshop.app.activeDocument?.layers?.map((layer) => {
                return {
                    displayName: layer.name,
                    value: layer.id,
                } as DropDownOption;
            })
        );
    }, [getContextFromStore(props.contextID).isGenerating]);

    function onChange() {
        setDropDownLayers(
            photoshop.app.activeDocument?.layers?.map((layer) => {
                return {
                    displayName: layer.name,
                    value: layer.id,
                } as DropDownOption;
            })
        );
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onChange);
        return () => {
            photoshop.action.removeNotificationListener(events, onChange);
        };
    }, []);

    function onDropDownSelect(option: DropDownOption) {
        let copyOfContext = getContextFromStore(props.contextID).copy();
        copyOfContext.currentLayerName = option.displayName;
        copyOfContext.currentLayerId = option.value;
        saveContextToStore(copyOfContext);
    }

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <Spectrum.Dropdown>
                <Spectrum.Menu slot="options">
                    {dropDownLayers &&
                        dropDownLayers.map((option: DropDownOption) => {
                            try {
                                return (
                                    <Spectrum.MenuItem
                                        key={_.uniqueId()}
                                        onClick={() => onDropDownSelect(option)}
                                        selected={
                                            getContextFromStore(props.contextID)
                                                .currentLayerId == option.value
                                        }
                                    >
                                        {option.displayName}
                                    </Spectrum.MenuItem>
                                );
                            } catch (e) {
                                console.error(e);
                            }
                        })}
                </Spectrum.Menu>
            </Spectrum.Dropdown>
            <ToolSection>
                {value?.length > 0 && (
                    <>
                        <Label>Use Auto1111</Label>
                        <Checkbox
                            onChange={async () => {
                                let copyOfContext = getContextFromStore(
                                    props.contextID
                                ).copy();
                                copyOfContext.is_cloud_run =
                                    !copyOfContext.is_cloud_run;
                                saveContextToStore(copyOfContext);
                            }}
                        />
                    </>
                )}
            </ToolSection>

            <ToolbarDivider />
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
            <ToolbarDivider />

            <ToolSection>
                <RegenerationTool
                    icon={SmartToyIcon}
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
}
