// import { E2ETestingPanel } from 'components/E2ETestingPanel';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { useEffect } from 'react';
import { createNewLayer } from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextItem } from '../components/ContextItem';
import { randomlyPickLayerName } from 'utils/general_utils';
import photoshop from 'photoshop';
import { Button } from 'react-uxp-spectrum';
import { ContextRecycleBin } from 'components/ContextRecycleBin';
const app = photoshop.app;

const events = [
    // 'make',
    'select',
    'delete',
    'selectNoLayers',
    'move',
    'undoEvent',
    'undoEnum',
];

const deletEvent = ['delete'];

export const ContextManager = () => {
    const layerAssignments = useContextStore(
        (state: ContextStoreState) => state.layerAssignments
    );

    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    const saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    const contexts = useContextStore(
        (state: ContextStoreState) => state.contexts
    );

    function onDelete(something: any) {
        console.log(something);
        updateAssignments();
    }

    function updateAssignments() {
        try {
            let currentLayerIDs = photoshop.app.activeDocument.layers.map(
                (layer) => layer.id
            );
            let currentlyAssignedLayerIDs = Object.keys(layerAssignments);
            let unassignedLayerIDs = currentLayerIDs.filter(
                (layerID) =>
                    !currentlyAssignedLayerIDs.includes(layerID.toString())
            );

            // for(let layerID of unassignedLayerIDs){
            // 	let context = getContextFromStore(layerID.toString())
            // 	context.currentLayer = null;

            // }
            for (let contextKey in Object.keys(contexts)) {
                let context = getContextFromStore(contextKey);
                let currentLayerFoundInPhotoshopLayers =
                    photoshop.app.activeDocument.layers
                        .map((layer) => layer)
                        .includes(context.currentLayer);
                if (!currentLayerFoundInPhotoshopLayers) {
                    let copyOfContext = context.copy();
                    copyOfContext.currentLayer = null;
                    saveContextToStore(copyOfContext);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        photoshop.action.addNotificationListener(deletEvent, onDelete);
        return () => {
            photoshop.action.removeNotificationListener(deletEvent, onDelete);
        };
    }, []);

    // TODO: This can also be moved since it's using the store, and the store can be called from anywhere
    async function createNewContext() {
        let context = new LayerAIContext();
        saveContextToStore(context);
        return context;
    }

    return (
        <>
            {/* <ContextRecycleBin />

			<E2ETestingPanel></E2ETestingPanel> */}

            <div>
                <Button
                    onClick={async () => {
                        let newContext = await createNewContext();
                        console.log(newContext);
                    }}
                >
                    Create New Context
                </Button>
            </div>
            <ContextItems />
        </>
    );
};

/**
 * This creates the actual <ContextItem/>s list to be displayed.  This renders the contexts
 * in the order the layers are found in the document.
 * @returns
 */
// TODO: move to its own file or something else - needs refactoring though
function ContextItems() {
    const contexts = useContextStore(
        (state: ContextStoreState) => state.contexts
    );
    return (
        <>
            {contexts &&
                Object.keys(contexts).map((key) => {
                    let context = contexts[key];
                    return (
                        <ContextItem
                            key={context.id}
                            contextID={context.id}
                        ></ContextItem>
                    );
                })}
        </>
    );
}
