import { useState } from 'react';
import {
    Button,
    Heading,
    Icon,
    Label,
    Slider,
    Textarea,
} from 'react-uxp-spectrum';
import { Progressbar } from 'react-uxp-spectrum/dist';
import { useAppStore } from '../store/appStore';
import {
    GenerateAILayer,
    GetImageProcessingProgress,
} from '../utils/ai_service';
import {
    GetDataFolderImageBase64ImgStr,
    SaveDocumentToPluginData,
} from '../utils/io_service';
import { ProgressButton } from './ProgressButton';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

const MERGEDFILENAME = 'mergedFile.png';
const GENERATEDFILENAME = 'generatedFile.png';

export const Layer = ({ layer, isTopLayer, children }) => {
    let layerAIContexts = useAppStore((state) => state.layerAIContexts);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);
    let [imageProgress, SetImageProgress] = useState(0);
    let [base64MergedImgStr, SetBase64MergedImgStr] = useState('');

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row justify-between bg-brand">
                <Heading className="text-lg text-brand-dark">
                    Layer:{' '}
                    <span className="text-lg text-white">
                        {layer.name.toUpperCase()}
                    </span>
                </Heading>
                <div className="flex flex-col justify-between">
                    {isTopLayer && (
                        <Button
                            className="bg-white text-brand-dark border-brand-dark"
                            onClick={async () => {
                                await CreateMergedLayer();
                                await SaveDocumentToPluginData(MERGEDFILENAME);
                                SetBase64MergedImgStr(
                                    (
                                        await GetDataFolderImageBase64ImgStr(
                                            MERGEDFILENAME
                                        )
                                    ).base64Data
                                );
                            }}
                        >
                            Merge Layers
                        </Button>
                    )}
                    <ProgressButton
                        // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                        //  512x512 is the cheapest.  We will have to have a final step of upscaling
                        longRunningFunction={() =>
                            GenerateAILayer(
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
                        layerContext.currentPrompt = event.target.value;
                        setAILayerContext(layerContext);
                    }}
                    className="w-full"
                ></Textarea>

                <Slider
                    min={0}
                    max={100}
                    value={0}
                    id={1}
                    className="w-1/3 py-2 mr-2"
                    showValue="true"
                    valueLabel="%"
                    onInput={(event) =>
                        console.log(
                            `Not implemented, but capturing value ${event.target.value}`
                        )
                    }
                ></Slider>
            </div>
        </div>
    );
};
