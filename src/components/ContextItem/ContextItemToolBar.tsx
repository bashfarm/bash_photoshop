import React, { useEffect, useState } from 'react';

import { ContextStoreState, useContextStore } from 'store/contextStore';
import photoshop from 'photoshop';
import Spectrum from 'react-uxp-spectrum';
import _ from 'lodash';
import { Layer } from 'photoshop/dom/Layer';
import { MaskingToolsSection } from 'components/toolSections/MaskingToolsSection';
import { RegenerationToolsSection } from 'components/toolSections/RegenerationToolsSection';
import { RemoveSection } from 'components/toolSections/RemoveSection';
import { ToolbarDivider } from 'components/toolSections/ToolBarDivider';

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

interface DropDownOption {
    displayName: string;
    value: any;
}

function DropdownMenu(props: DropdownMenuProps) {
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    function onDropDownSelect(option: DropDownOption) {
        let copyOfContext = getContextFromStore(props.contextID).copy();
        copyOfContext.currentLayerName = option.displayName;
        copyOfContext.currentLayerId = option.value;
        saveContextToStore(copyOfContext);
    }

    return (
        <Spectrum.Menu slot="options">
            {props.layers?.map((layer: Layer) => {
                let option = {
                    displayName: layer?.name,
                    value: layer?.id,
                } as DropDownOption;
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
    );
}

const MemoizedDropdownMenu = React.memo(DropdownMenu);

interface ContextItemToolBarProps {
    contextID: string;
}

export default function ContextItemToolBar(props: ContextItemToolBarProps) {
    const [layers, setLayers] = useState(photoshop.app.activeDocument.layers);

    function onChange() {
        setLayers(photoshop.app.activeDocument.layers);
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onChange);
        return () => {
            photoshop.action.removeNotificationListener(events, onChange);
        };
    }, []);

    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <Spectrum.Dropdown>
                <MemoizedDropdownMenu
                    contextID={props.contextID}
                    layers={layers}
                />
            </Spectrum.Dropdown>
            <ToolbarDivider />
            <sp-label slot="label">RegenID: </sp-label>
            <h2 className="text-white text-lg font-bold">{props.contextID}</h2>
            <ToolbarDivider />

            <MaskingToolsSection contextID={props.contextID} />
            <ToolbarDivider />
            <RegenerationToolsSection contextID={props.contextID} />
            <ToolbarDivider />
            <RemoveSection contextID={props.contextID} />
        </div>
    );
}

interface DropdownMenuProps {
    contextID: string;
    layers: Layer[];
}

export const ContextItemToolBarMemo = React.memo(ContextItemToolBar);
