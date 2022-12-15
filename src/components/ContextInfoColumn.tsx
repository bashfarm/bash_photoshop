import React, { useEffect, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';
import Spectrum from 'react-uxp-spectrum';
import { Layer } from 'photoshop/dom/Layer';
import photoshop from 'photoshop';

export type ContextInfoColumnProps = {
    onSelect: Function;
    contextID: string;
};

export const ContextInfoColumn = (props: ContextInfoColumnProps) => {
    let saveLayerAssignment = useContextStore(
        (state: ContextStoreState) => state.saveLayerAssignment
    );
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let layerAssignments = useContextStore(
        (state: ContextStoreState) => state.layerAssignments
    );

    let [thisContext, setThisContext] = useState(
        getContextFromStore(props.contextID)
    );

    function onDropDownSelect(layer: Layer) {
        let copyOfContext = thisContext.copy();
        copyOfContext.currentLayer = layer;
        saveContextToStore(copyOfContext);
        saveLayerAssignment(layer?.id, getContextFromStore(props.contextID));
        setThisContext(copyOfContext);

        // let the top level know about this selection.
        props.onSelect(layer);
    }

    /**
     * TODO(bgarrard): This should return all layers that have not been assigned in a context.  This would
     * help the user greatly in assigned layers quickly.  Been a handful though.
     * @returns
     */
    function getUnassignedLayers() {
        let docLayers = photoshop.app.activeDocument.layers;
        // This filters out the layers with no contexts
        // let layers = docLayers.filter(x => !Object.keys(layerAssignments).includes(x.id.toString()))
        // remove this if you are working on this function
        let layers = docLayers;
        return layers.map((layer) => {
            return (
                <>
                    <Spectrum.MenuItem
                        key={layer.id}
                        onClick={() => onDropDownSelect(layer)}
                    >
                        {layer.name}
                    </Spectrum.MenuItem>
                </>
            );
        });
    }

    return (
        <div className="flex flex-col bg-brand-dark">
            <Spectrum.Dropdown>
                <Spectrum.Menu>
                    {photoshop.app.activeDocument.layers && [
                        <Spectrum.MenuItem
                            key={getContextFromStore(props.contextID)?.id}
                            onClick={() =>
                                onDropDownSelect(
                                    getContextFromStore(props.contextID)
                                        .currentLayer
                                )
                            }
                        >
                            {
                                getContextFromStore(props.contextID)
                                    .currentLayer?.name
                            }
                        </Spectrum.MenuItem>,
                        ...getUnassignedLayers(),
                    ]}
                </Spectrum.Menu>
            </Spectrum.Dropdown>
            <ContextLabel
                value={getContextFromStore(props.contextID)?.currentLayer?.name}
                labelText={'Layer Name:'}
            />
            <ContextLabel
                value={getContextFromStore(props.contextID)?.currentLayer?.id}
                labelText={'Layer Id:'}
            />
            <ContextLabel
                value={getContextFromStore(props.contextID)?.id}
                labelText={'Context Id'}
            />
        </div>
    );
};
