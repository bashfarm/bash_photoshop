import { useState, useEffect } from 'react';
import { Heading, Textarea } from 'react-uxp-spectrum';
import { Progressbar } from 'react-uxp-spectrum/dist';
import { createAILayerContextId, useAppStore } from '../store/appStore';
import {
    generateAILayer,
    getImageProcessingProgress,
} from '../services/ai_service';
import { getContextHistoryFileEntries } from '../services/context_service';
import { createNewLayerFromImage, moveLayer } from '../services/layer_service';
import { ProgressButton } from './ProgressButton';
import {
    toggleOffContextHidingTool,
    toggleOnContextHidingTool,
} from '../services/tools_service';
const photoshop = require('photoshop');

const ContextLabel = ({ value, labelText }) => {
    return (
        <div className="flex flex-row">
            <Heading className="text-lg text-brand">{labelText}</Heading>
            <span className="text-lg text-white">{` ${value}`}</span>
        </div>
    );
};

const ContextInfoColumn = ({ layerContext }) => {
    return (
        <div className="flex flex-col bg-brand-dark">
            <ContextLabel
                value={layerContext.layers[0].name}
                labelText={'Layer Name:'}
            />
            <ContextLabel
                value={layerContext.layers[0].id}
                labelText={'Layer Id:'}
            />
            <ContextLabel value={layerContext.id} labelText={'Context Id'} />
        </div>
    );
};

const ContextToolColumn = ({ layerContext }) => {
    return (
        <>
            <div className="flex flex-col w-2/3">
                <ContextToolBar layerContext={layerContext} />
                <ContextHistoryBar layerContext={layerContext} />
            </div>
        </>
    );
};

/**
 *
 * @param {*} param0
 * @returns
 */
const ContextToolBar = ({ layerContext }) => {
    return (
        <div className="flex flex-row space-x-1">
            <sp-button onClick={() => toggleOnContextHidingTool(layerContext)}>
                Hiding Tool
            </sp-button>
            <sp-button onClick={() => toggleOffContextHidingTool(layerContext)}>
                UnHiding Tool
            </sp-button>
        </div>
    );
};

/**
 * This is the img of the previous version of the context.
 * @param {*} param0
 * @returns
 */
const ContextImage = ({ imageEntry, layerContext }) => {
    /**
     * This needs to be revamped.  We want to select this on image click.
     * Then have a button
     */
    async function whenClicked() {
        await createNewLayerFromImage(
            imageEntry.name,
            layerContext.layers[0],
            photoshop.constants.ElementPlacement.PLACEBEFORE
        );
    }

    return (
        <>
            <img
                src={imageEntry.url.href}
                className="hover:border"
                onClick={whenClicked}
            ></img>
        </>
    );
};

/**
 * This is the version history of the context.  The versions are pretty much just images.  But this can hold more information in the future.
 * @param {*} param0
 * @returns
 */
const ContextHistoryBar = ({ layerContext }) => {
    let [localContextHistoryFileEntries, setLocalContextHistoryFileEntries] =
        useState([]);

    useEffect(async () => {
        setLocalContextHistoryFileEntries(
            await getContextHistoryFileEntries(layerContext)
        );
    }, []);

    return (
        <div className="flex flex-row space-x-1">
            {localContextHistoryFileEntries &&
                localContextHistoryFileEntries.map((fEntry, index) => {
                    return (
                        <ContextImage
                            key={index}
                            imageEntry={fEntry}
                            layerContext={layerContext}
                        />
                    );
                })}
        </div>
    );
};

/**
 * The component for the ride hand side of the context item UI.  This is responsible for styling and etc.  This might bneed to be revamped.
 * @param {*}
 * @returns
 */
const RegenerationColumn = ({ layerContext }) => {
    let [imageProgress, setImageProgress] = useState(0);

    let setLayerid2ContextId = useAppStore(
        (state) => state.setLayerid2ContextId
    );

    let removeLayerid2ContextId = useAppStore(
        (state) => state.removeLayerid2ContextId
    );
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);
    let layerAIContexts = useAppStore((state) => state.layerAIContexts);

    async function regenerateLayer(width, height) {
        try {
            let currentLayer2Generate = layerContext.layers[0];
            let generatedLayer = await generateAILayer(
                width,
                height,
                layerContext
            );

            // User probably needs to make space for new generations.  They can only hold up to 5 versions of a layer in history
            if (!generatedLayer) {
                return;
            }
            moveLayer(
                generatedLayer,
                currentLayer2Generate,
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );
            // deleteLayer(currentLayer2Generate)
            console.log('Layer to delete');
            console.log(currentLayer2Generate);
            console.log('Layer to keep');
            console.log(generatedLayer);
            console.log(layerAIContexts);
            let newContext = {
                ...layerContext,
                layers: [generatedLayer],
            };
            setAILayerContext(
                createAILayerContextId(generatedLayer),
                newContext
            );
            console.log(layerAIContexts);
            removeLayerid2ContextId(currentLayer2Generate.id);
            setLayerid2ContextId(generatedLayer.id, newContext.id);

            // Probably need to push a new layer in to the layers array with the new layer
            console.log(
                `set old layer context contextID: ${layerContext.id}, LayerID: ${layerContext.currentLayer.id} LayerName: ${layerContext.currentLayer.name} to new layer, LayerName: ${generatedLayer.name}, LayerID: ${generatedLayer.id}`
            );
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <div className="flex flex-col justify-between">
                <ProgressButton
                    // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                    //  512x512 is the cheapest.  We will have to have a final step of upscaling
                    longRunningFunction={async () => {
                        console.log('before regenerate');
                        regenerateLayer(512, 512);
                        console.log('after regenerate');
                    }}
                    progressQueryFunction={getImageProcessingProgress}
                    queryResponseParser={(response) => response['progress']}
                    progressSetter={setImageProgress}
                    pollingSeconds={1}
                >
                    Regenerate Layer
                </ProgressButton>
                <Progressbar
                    min={0}
                    max={1}
                    value={imageProgress}
                    id={1}
                    className="py-2"
                ></Progressbar>
            </div>
        </>
    );
};

export const ContextItem = ({ layerContext = {} }) => {
    let [thisLayersContext, setThisLayersContext] = useState(layerContext);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row bg-brand">
                <ContextInfoColumn layerContext={thisLayersContext} />
                <ContextToolColumn layerContext={thisLayersContext} />
                <RegenerationColumn layerContext={thisLayersContext} />
            </div>
            <div>
                <Textarea
                    placeholder="Enter a description of the content in this layer"
                    onInput={(event) => {
                        // Making a copy like this and resetting seems to render things well
                        // using the app store methods causing a total rerender and makes this suck
                        let newContext = {
                            ...thisLayersContext,
                            currentPrompt: event.target.value,
                        };
                        setAILayerContext(
                            createAILayerContextId(thisLayersContext.layers[0]),
                            newContext
                        );
                        setThisLayersContext(newContext);
                    }}
                    className="w-full"
                ></Textarea>
                <div>{thisLayersContext.currentPrompt}</div>
            </div>
        </div>
    );
};
