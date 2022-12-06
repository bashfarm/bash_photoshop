import { useEffect, useState } from 'react';
import { Button, Label } from 'react-uxp-spectrum';
import {
    CreateAILayerContext,
    CreateAILayerContextId,
    useAppStore,
} from '../store/appStore';
import { GetContextFileEntries } from '../utils/io_service';
import { GetLayerAIContext } from '../utils/layer_service';
import { Layer } from './Layer';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

const events = [
    { event: 'make' },
    { event: 'delete' },
    { event: 'select' },
    { event: 'selectNoLayers' },
    { event: 'move' },
    { event: 'undoEvent' },
    { event: 'undoEnum' },
];

export const LayerManager = ({ layers }) => {
    let layerAIContexts = useAppStore((state) => state.layerAIContexts);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);
    let [activeDocumentLayers, SetActiveDocumentLayers] = useState(
        photoshop.app.activeDocument.layers
    );
    CreateInitialContexts();

    function CreateInitialContexts() {
        try {
            let currentContextLayerId;
            for (let layer of app.activeDocument.layers) {
                currentContextLayerId = CreateAILayerContextId(layer);
                if (!layerAIContexts[currentContextLayerId]) {
                    let layerAIContext = CreateAILayerContext(layer);
                    setAILayerContext(currentContextLayerId, layerAIContext);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function onMake() {
        SetActiveDocumentLayers(photoshop.app.activeDocument.layers);
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onMake);
        return () => {
            photoshop.action.removeNotificationListener(events, onMake);
        };
    });

    function CreateLayersFromContexts() {
        let topContext = GetLayerAIContext(
            activeDocumentLayers[0],
            layerAIContexts
        );

        if (topContext) {
            return [
                <Layer
                    key={topContext.id}
                    layer={topContext.currentLayer}
                    isTopLayer={true}
                    layerContext={topContext}
                />,
                ...activeDocumentLayers.slice(1).map((layer) => {
                    let aiContext = GetLayerAIContext(layer, layerAIContexts);
                    console.log(aiContext);
                    return (
                        <Layer
                            key={aiContext.id}
                            layer={aiContext.currentLayer}
                            layerContext={aiContext}
                        />
                    );
                }),
            ];
        } else {
            return <div></div>;
        }
    }

    function AddLayerToContext(layer, aiContext) {
        let newContext = {
            ...aiContext,
            layers: [layer, ...aiContext.layers],
        };
        setAILayerContext(CreateAILayerContextId(layer), newContext);
    }

    /**
     * Setting the current layer property of the AI layer context
     * @param {} layer
     * @param {*} aiContext
     */
    function SetLayerAIContextCurrentLayer(layer, aiContext) {
        let newContext = {
            ...aiContext,
            currentLayer: layer,
        };
        setAILayerContext(CreateAILayerContextId(layer), newContext);
    }

    function duplicateLayer(layer, layerAIContextStore) {
        // 1. dupe layer
        // 2. get layer info
        // 3. have new layer inherit the duplicated layers context.  They will then both
        // then be referenced together in a our internal LAyerManager UI in a Layer
    }

    return (
        <>
            <div className="flex flex-col justify-start justify-items-start border-b rounded divide-y-2 space-y-4">
                <Button
                    onClick={() => {
                        SetActiveDocumentLayers(app.activeDocument.layers);
                    }}
                >
                    Refresh List
                </Button>
                {CreateLayersFromContexts()}
                {/* {
					<Layer layer={activeDocumentLayers[0]} isTopLayer={true} layerContext={GetLayerAIContext(activeDocumentLayers[0], layerAIContexts)}/>
				} */}
            </div>
        </>
    );
};
