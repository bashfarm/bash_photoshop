import { useState, useEffect } from 'react';
import {
    Button,
    Heading,
    Icon,
    Label,
    Slider,
    Textarea,
} from 'react-uxp-spectrum';
import { Progressbar } from 'react-uxp-spectrum/dist';
import { CreateAILayerContextId, useAppStore } from '../store/appStore';
import {
    GenerateAILayer,
    GetImageProcessingProgress,
} from '../utils/ai_service';
import {
    CreateContextMergedFileName,
    GetDataFolderImageBase64ImgStr,
    GetHistoryFilePaths,
    SaveDocumentToPluginData,
    SaveLayerToPluginData,
} from '../utils/io_service';
import { SaveLayerContexttoHistory } from '../utils/layer_service';
import { ProgressButton } from './ProgressButton';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

const dummyArray = [
    { id: 1, value: 30, src: 'img/cat.jpg' },
    { id: 2, value: 40, src: 'img/cat.jpg' },
    { id: 3, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
];

const AssetItem = ({ src }) => {
    const handleClick = async (src) => {
        await PlaceImageFromDataOnLayer(`${src.slice(-3)}-img`);
    };
    return (
        <div className="mx-5">
            <img
                className="rounded-sm w-[90px] hover:border"
                src={src}
                alt="Demo Image"
                onClick={() => handleClick(src)}
            />
        </div>
    );
};

export const Layer = ({ layer, isTopLayer, layerContext = {}, children }) => {
    let [imageProgress, SetImageProgress] = useState(0);
    let [variationIntensity, SetVariationIntensity] = useState(0.25);
    let [thisLayersContext, SetThisLayersContext] = useState(layerContext);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row justify-between bg-brand">
                <Heading className="text-lg text-brand-dark">
                    Current Layer :
                    <span className="text-lg text-white">
                        {thisLayersContext.currentLayer.name}
                    </span>
                </Heading>
                <div className="flex flex-col justify-between">
                    {isTopLayer && (
                        <Button
                            className="bg-white text-brand-dark border-brand-dark"
                            onClick={() => {}}
                        >
                            Merge Layers
                        </Button>
                    )}
                    <ProgressButton
                        // We have to have a standard image size for bashing process.  We can't allocate that much Vram for high resolutions
                        //  512x512 is the cheapest.  We will have to have a final step of upscaling
                        longRunningFunction={async () => {
                            let fileName = await SaveLayerContexttoHistory(
                                thisLayersContext
                            );
                            console.log(fileName);
                            GenerateAILayer(
                                fileName,
                                512,
                                512,
                                thisLayersContext.currentPrompt
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
                        let newContext = {
                            ...thisLayersContext,
                            currentPrompt: event.target.value,
                        };
                        setAILayerContext(
                            CreateAILayerContextId(layer),
                            newContext
                        );
                        SetThisLayersContext(newContext);
                    }}
                    className="w-full"
                ></Textarea>
                <div className="font-white">Variation Intensity</div>
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
                <div>{thisLayersContext.currentPrompt}</div>
            </div>
        </div>
    );
};
