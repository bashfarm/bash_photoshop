import React, { useEffect, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';
import Spectrum from 'react-uxp-spectrum';
import { Layer } from 'photoshop/dom/Layer';
import photoshop from 'photoshop';
import { string } from 'yargs';
import LayerAIContext from 'models/LayerAIContext';

export type ContextInfoColumnProps = {
    contextID: string;
};

export interface UnassignedLayer {
    name: string;
    id: number;
}

const events = [
    'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

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
    let [thisContext, setThisContext] = useState<LayerAIContext>(null);

    useEffect(() => {
        setUnassignedLayers(getUnassignedLayers());
    }, []);

    function onLayerChange() {
        setUnassignedLayers(getUnassignedLayers());
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onLayerChange);
        return () => {
            photoshop.action.removeNotificationListener(events, onLayerChange);
        };
    }, []);

    function onDropDownSelect(layer: UnassignedLayer) {
        console.log(layer);
        let context = getContextFromStore(props.contextID);
        console.log(context);
        let copyOfContext = getContextFromStore(props.contextID).copy();
        console.log(
            photoshop.app.activeDocument.layers.filter(
                (psLayer) => layer.id == psLayer.id
            )[0]
        );
        copyOfContext.currentLayer = photoshop.app.activeDocument.layers.filter(
            (psLayer) => layer.id == psLayer.id
        )[0];
        console.log(copyOfContext);
        console.log(photoshop.app.activeDocument.layers.map((layer) => layer));

        saveContextToStore(copyOfContext);
        saveLayerAssignment(layer?.id, props.contextID);
        setUnassignedLayers(getUnassignedLayers());
        setThisContext(copyOfContext);
        console.log(thisContext);
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
                                    key={layer.name}
                                    onClick={() => onDropDownSelect(layer)}
                                >
                                    {layer.name}
                                </Spectrum.MenuItem>
                            );
                        })}
                </Spectrum.Menu>
            </Spectrum.Dropdown>
            <ContextLabel
                value={thisContext?.currentLayer?.name}
                labelText={'Layer Name:'}
            />
            <ContextLabel
                value={thisContext?.currentLayer?.id}
                labelText={'Layer Id:'}
            />
            <ContextLabel
                value={thisContext?.currentLayer?.id}
                labelText={'Context Id'}
            />
        </div>
    );
};
