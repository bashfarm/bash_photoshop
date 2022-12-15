import React, { useEffect, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';
import Spectrum from 'react-uxp-spectrum';
import { Layer } from 'photoshop/dom/Layer';
import photoshop from 'photoshop';
import { string } from 'yargs';

export type ContextInfoColumnProps = {
    contextID: string;
};

export interface UnassignedLayer {
    name: string;
    id: number;
}

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
    let [unassignedLayers, setUnassignedLayers] = useState<
        Array<UnassignedLayer>
    >([]);

    useEffect(() => {
        setUnassignedLayers(getUnassignedLayers());
    }, []);

    function onDropDownSelect(layer: UnassignedLayer) {
        let copyOfContext = getContextFromStore(props.contextID).copy();
        copyOfContext.currentLayer = photoshop.app.activeDocument.layers.find(
            (psLayer) => (layer.id = psLayer.id)
        );
        saveContextToStore(copyOfContext);
        saveLayerAssignment(layer?.id, props.contextID);
        setUnassignedLayers(getUnassignedLayers());
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
        // let layers = docLayers.filter(layer => layer?.name !== getContextFromStore(props.contextID).currentLayer?.name);
        return docLayers.map((layer) => {
            return {
                name: layer.name,
                id: layer.id,
            } as UnassignedLayer;
        });
    }

    return (
        <div className="flex flex-col bg-brand-dark">
            <Spectrum.Dropdown>
                <Spectrum.Menu>
                    {photoshop.app.activeDocument.layers &&
                        unassignedLayers.map((layer) => {
                            return (
                                <Spectrum.MenuItem
                                    key={layer.id}
                                    onClick={() => onDropDownSelect(layer)}
                                >
                                    {layer.name}
                                </Spectrum.MenuItem>
                            );
                        })}
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
