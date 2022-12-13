import LayerAIContext from 'models/LayerAIContext';
import React, { useState } from 'react';
import { Dropdown, Heading } from 'react-uxp-spectrum';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import photoshop from 'photoshop';
import { Layer } from 'photoshop/dom/Layer';
import Menu from 'react-uxp-spectrum/dist/Menu';
import MenuItem from 'react-uxp-spectrum/dist/MenuItem';
// import ReactTags from 'react-tag-autocomplete'

export type ContextLabelProps = {
    layerContext: LayerAIContext;
};

export const ContextLayerBar = (props: ContextLabelProps) => {
    let [selectedLayers, setSelectedLayers] = useState<Array<Layer>>([]);
    let [layersForDropdown, setLayersForDropdown] = useState<Array<Layer>>(
        photoshop.app.activeDocument.layers
    );
    let setAILayerContext = useContextStore(
        (state: ContextStoreState) => state.setAILayerContext
    );
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );

    function onSelect(event: any) {
        let selectedLayer = layersForDropdown.find(
            (layer) => layer.name == event.target.value
        );
        let newPossibleLayers = photoshop.app.activeDocument.layers.filter(
            (x) => !selectedLayers.includes(x)
        );
        setSelectedLayers([...selectedLayers, selectedLayer]);
        setLayersForDropdown(newPossibleLayers);
    }

    return (
        <div className="flex flex-row">
            <Heading className="text-lg text-brand">yolo</Heading>
            <Dropdown onChange={onSelect}>
                <Menu slot="options">
                    {selectedLayers &&
                        layersForDropdown.map((layer: Layer) => (
                            <MenuItem
                                onClick={(e: any) => console.log(e)}
                                key={layer.id}
                            >
                                Layer Name {layer.name}, Layer ID: {layer.id}
                            </MenuItem>
                        ))}
                </Menu>
            </Dropdown>
            {selectedLayers &&
                selectedLayers.map((layer) => {
                    return <>{layer && <div key={layer.id}>yolo</div>}</>;
                })}
        </div>
    );
};
