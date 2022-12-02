import { useEffect, useState } from 'react';
import { Button, Label } from 'react-uxp-spectrum';
import { CreateAILayerContext, useAppStore } from '../store/appStore';
import { Layer } from './Layer';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

export const LayerManager = ({ layers }) => {
    var layerAIContexts = useAppStore((state) => state.layerAIContexts);
    var setAILayerContext = useAppStore((state) => state.setAILayerContext);
    console.log('yolo');
    console.log(layers);

    // useEffect(() => {
    // 	for(let layer of app.activeDocument.layers){
    // 		if(!layerAIContexts[layer.id])
    // 			setAILayerContext(CreateAILayerContext(layer.id))
    // 	}
    // }, [app.activeDocument.layers])

    return (
        <>
            <div className="flex flex-col justify-start justify-items-start bg-brand border-b rounded divide-y-2">
                {[
                    <Layer layer={layers[0]} isTopLayer={true} />,
                    ...layers.slice(1).map((layer) => {
                        console.log(layer);
                        return <Layer layer={layer} />;
                    }),
                ]}
            </div>
        </>
    );
};
