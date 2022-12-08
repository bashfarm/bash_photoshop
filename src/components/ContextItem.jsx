import { useState, useEffect } from 'react';
import { Heading, Textarea } from 'react-uxp-spectrum';
import { Progressbar } from 'react-uxp-spectrum/dist';
import { CreateAILayerContextId, useAppStore } from '../store/appStore';
import {
    GetImageProcessingProgress,
    RegenerateLayer,
} from '../utils/ai_service';
import {
    GetContextHistoryFileEntries,
    GetHistoryFilePaths,
} from '../utils/io_service';
import {
    CreateNewLayerFromImage,
    PlaceImageFromDataOnLayer,
} from '../utils/layer_service';
import { HidingTool, UnHidingTool } from '../utils/tools_service';
import { ProgressButton } from './ProgressButton';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

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

const ContextToolBar = ({ layerContext }) => {
    return (
        <div className="flex flex-row space-x-1">
            <sp-button onClick={() => HidingTool(layerContext)}>
                Hiding Tool
            </sp-button>
            <sp-button onClick={() => UnHidingTool(layerContext)}>
                UnHiding Tool
            </sp-button>
        </div>
    );
};

const ContextImage = ({ imageEntry, layerContext }) => {
    async function whenClicked() {
        await CreateNewLayerFromImage(
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

const ContextHistoryBar = ({ layerContext }) => {
    let [localContextHistoryFileEntries, SetLocalContextHistoryFileEntries] =
        useState([]);

    useEffect(async () => {
        SetLocalContextHistoryFileEntries(
            await GetContextHistoryFileEntries(layerContext)
        );
    }, []);

    return (
        <div className="flex flex-row space-x-1">
            {localContextHistoryFileEntries &&
                localContextHistoryFileEntries.map((fEntry, index) => {
                    console.log(fEntry);
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

const RegenerationColumn = ({ layerContext }) => {
    let [imageProgress, SetImageProgress] = useState(0);

    let setLayerid2ContextId = useAppStore(
        (state) => state.setLayerid2ContextId
    );

    let removeLayerid2ContextId = useAppStore(
        (state) => state.removeLayerid2ContextId
    );
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);

    useEffect(async () => {
        if (imageProgress == 1 || imageProgress == 0) {
        }
    }, [imageProgress]);

    return (
        <>
            <div className="flex flex-col justify-between">
                <ProgressButton
                    // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                    //  512x512 is the cheapest.  We will have to have a final step of upscaling
                    longRunningFunction={async () => {
                        RegenerateLayer(
                            512,
                            512,
                            layerContext,
                            setLayerid2ContextId,
                            removeLayerid2ContextId,
                            setAILayerContext
                        );
                    }}
                    progressQueryFunction={GetImageProcessingProgress}
                    queryResponseParser={(response) => response['progress']}
                    progressSetter={SetImageProgress}
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
    let [thisLayersContext, SetThisLayersContext] = useState(layerContext);
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
                            CreateAILayerContextId(thisLayersContext.layers[0]),
                            newContext
                        );
                        SetThisLayersContext(newContext);
                    }}
                    className="w-full"
                ></Textarea>
                <div>{thisLayersContext.currentPrompt}</div>
            </div>
        </div>
    );
};
