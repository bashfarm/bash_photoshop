import { useEffect, useState } from 'react';
import { Button, Label } from 'react-uxp-spectrum';
import {
    CreateAILayerContext,
    CreateAILayerContextId,
    useAppStore,
} from '../store/appStore';
import { GetContextFileEntries } from '../utils/io_service';
import { GetDeletedLayersThatNeedToBeRemovedFromContexts, GetLayerAIContext } from '../utils/layer_service';
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

const deleteEvent = [
    { event: 'delete' },
]

export const LayerManager = ({ layers }) => {
    let layerAIContexts = useAppStore((state) => state.layerAIContexts);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);
    let [activeDocumentLayers, SetActiveDocumentLayers] = useState(
        photoshop.app.activeDocument.layers
    );
	let [renderedContexts, SetRenderedContexts] = useState([])
    let deleteContext = useAppStore((state) => state.deleteContext);

    CreateInitialContexts();
	console.log(layerAIContexts)

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

	// function onDelete(){
	// 	let layerIdsToDelete = GetDeletedLayersThatNeedToBeRemovedFromContexts()
	// 	console.log("delete is being called")
	// 	for(let layerId of layerIdsToDelete){
	// 		deleteContext(layerId)
	// 	}
		
	// }

    useEffect(() => {
        photoshop.action.addNotificationListener(events, onMake);
        // photoshop.action.addNotificationListener(deleteEvent, onDelete);
        return () => {
            photoshop.action.removeNotificationListener(events, onMake);
        	// photoshop.action.addNotificationListener(deleteEvent, onDelete);
	};
    });

    function CreateLayersFromContexts() {
        let topContext = GetLayerAIContext(
            activeDocumentLayers[0],
            layerAIContexts
        );
 


        if (topContext) {
			console.log(topContext);
			console.log(layerAIContexts);
			console.log(topContext.currentLayer);
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
                    console.log(layerAIContexts);
                    console.log(aiContext.currentLayer);
					if(aiContext.currentLayer){
						return (
							<Layer
								key={aiContext.id}
								layer={aiContext.currentLayer}
								layerContext={aiContext}
							/>
						);
					}

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
