import { useState, useEffect } from 'react';
import { Heading, Textarea } from 'react-uxp-spectrum';
import { Progressbar } from 'react-uxp-spectrum/dist';
import { CreateAILayerContextId, useAppStore } from '../store/appStore';
import {
    GetImageProcessingProgress,
    RegenerateLayer,
} from '../utils/ai_service';
import { GetHistoryFilePaths } from '../utils/io_service';
import { ProgressButton } from './ProgressButton';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

export const ContextItem = ({ layerContext = {} }) => {
    let [imageProgress, SetImageProgress] = useState(0);
    let [thisLayersContext, SetThisLayersContext] = useState(layerContext);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);
    let layerAIContexts = useAppStore((state) => state.layerAIContexts);
    let replaceAILayerContext = useAppStore((state) => state.getAILayerContext);
    let setLayerid2ContextId = useAppStore(
        (state) => state.setLayerid2ContextId
    );
    let setAILayerContextPrompt = useAppStore(
        (state) => state.setAILayerContextPrompt
    );
    let removeLayerid2ContextId = useAppStore(
        (state) => state.removeLayerid2ContextId
    );

    useEffect(async () => {
        if (imageProgress == 1 || imageProgress == 0) {
            SetLayerContextHisoricalFiles(
                await GetHistoryFilePaths(thisLayersContext)
            );
        }
    }, [imageProgress]);

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row justify-between bg-brand">
                <div className="flex flex-col bg-brand-dark">
                    <Heading className="text-lg text-brand-dark">
                        <span className="text-lg text-white">
                            {thisLayersContext.layers[0].name}
                        </span>
                    </Heading>
                    <Heading className="text-lg text-brand-dark">
                        <span className="text-lg text-white">
                            {thisLayersContext.layers[0].id}
                        </span>
                    </Heading>
                </div>
                <div className="flex flex-col justify-between">
                    <ProgressButton
                        // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                        //  512x512 is the cheapest.  We will have to have a final step of upscaling
                        longRunningFunction={async () => {
                            console.log('regenerate Layer');
                            console.log(thisLayersContext);
                            console.log(layerAIContexts);
                            console.log(app.activeDocument.layers);
                            RegenerateLayer(
                                512,
                                512,
                                thisLayersContext,
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
