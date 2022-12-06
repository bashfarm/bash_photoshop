import { useEffect, useState } from 'react';
import {
    Button,
    Heading,
    Icon,
    Label,
    Slider,
    Textarea,
} from 'react-uxp-spectrum';
import { Progressbar } from 'react-uxp-spectrum/dist';
import { ContextHistoryEnums } from '../constants';
import { CreateAILayerContextId, useAppStore } from '../store/appStore';
import {
    GenerateAIImage,
    GetImageProcessingProgress,
} from '../utils/ai_service';
import {
    CreateContextMergedFileName,
    GetDataFolderImageBase64ImgStr,
    SaveDocumentToPluginData,
    SaveLayerToPluginData,
} from '../utils/io_service';
import {
    CreateMergedLayer,
    PlaceImageFromDataOnLayer,
} from '../utils/layer_service';
import { ProgressButton } from './ProgressButton';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

export const Layer = ({ layer, isTopLayer, layerContext = {}, children }) => {
    let [imageProgress, SetImageProgress] = useState(0);
    let [base64MergedImgStr, SetBase64MergedImgStr] = useState('');
    let [variationIntensity, SetVariationIntensity] = useState(0.25);
    let [timer, SetTimer] = useState({});
    let pollingSeconds = 1;
    let generatedFileName = GENERATEDFILENAME + layer.id + '.png';
    let [thisLayersContext, SetThisLayersContext] = useState(layerContext);

    useEffect(() => {
        if (imageProgress == 1) {
            clearInterval(timer);
        }
    }, [imageProgress]);

    return (
        <div className="flex flex-col bg-brand-dark border-b border-brand rounded ">
            <div className="flex flex-row justify-between bg-brand  border-b rounded p-1">
                <Heading className="text-lg text-white">
                    {layer.name.toUpperCase()}
                </Heading>
                <div className="flex flex-col justify-between">
                    {isTopLayer && (
                        <Button
                            className="bg-white text-brand-dark border-brand-dark"
                            onClick={async () => {
                                console.log('yolo');
                                try {
                                    let layerMergedFileName =
                                        CreateContextMergedFileName();
                                    console.log(
                                        `Merged ${layerMergedFileName}`
                                    );
                                    await CreateMergedLayer();
                                    await SaveDocumentToPluginData(
                                        layerMergedFileName
                                    );
                                    let b64Data = (
                                        await GetDataFolderImageBase64ImgStr(
                                            layerMergedFileName
                                        )
                                    ).base64Data;
                                    console.log(`b64 ${b64Data}`);
                                    SetBase64MergedImgStr(b64Data);
                                    GenerateAIImage(
                                        layer,
                                        512,
                                        512,
                                        layerAIContexts[layer.id].currentPrompt
                                    );

                                    // Calling the progress endpoint for this image to be done regenerating.
                                    let timeout =
                                        (pollingSeconds ? pollingSeconds : 1) *
                                        1000;
                                    let prevVal = -1;
                                    SetTimer(
                                        setInterval(async () => {
                                            try {
                                                console.log(
                                                    `Currently calling the progress function ${
                                                        timeout / 1000
                                                    } seconds`
                                                );
                                                let response =
                                                    await GetImageProcessingProgress();
                                                let progressValue =
                                                    response['progress'];

                                                prevVal = progressValue;
                                                if (prevVal == 0) {
                                                    SetImageProgress(1);
                                                    return;
                                                }
                                                SetImageProgress(progressValue);
                                            } catch (e) {
                                                SetImageProgress(1);
                                                console.error(e);
                                            }
                                        }, timeout)
                                    );

                                    PlaceImageFromDataOnLayer(
                                        generatedFileName
                                    );
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                        >
                            Merge and Regenerate
                        </Button>
                    )}
                    <ProgressButton
                        // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                        //  512x512 is the cheapest.  We will have to have a final step of upscaling
                        longRunningFunction={() =>
                            GenerateAIImage(
                                base64MergedImgStr,
                                512,
                                512,
                                finalDocumentPrompt
                            )
                        }
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
                        let layerContext = layerAIContexts[layer.id];
                        let newContext = {
                            ...layerContext,
                            currentPrompt: event.target.value,
                        };
                        setAILayerContext(
                            CreateAILayerContextId(layer),
                            newContext
                        );
                    }}
                    className="w-full"
                ></Textarea>
                <div>
                    <h2 className="text-white">Variation Intensity:</h2>
                    <Slider
                        variant="filled"
                        min={0}
                        max={100}
                        value={variationIntensity * 100}
                        id={1}
                        className="w-1/3 py-2 mr-2"
                        showValue="true"
                        valueLabel="%"
                        onInput={(event) => {
                            if (event.target.value == 0) {
                                SetVariationIntensity(0);
                            } else {
                                SetVariationIntensity(event.target.value / 100);
                            }
                        }}
                    ></Slider>
                </div>
            </div>
        </div>
    );
};
