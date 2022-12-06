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
import {
    GetNewestLayer,
    SaveLayerContexttoHistory,
} from '../utils/layer_service';
import { ProgressButton } from './ProgressButton';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

export const Layer = ({ layer, isTopLayer, layerContext = {}, children }) => {
    let [imageProgress, SetImageProgress] = useState(0);
    let [variationIntensity, SetVariationIntensity] = useState(0.25);
    let [thisLayersContext, SetThisLayersContext] = useState(layerContext);
    let [layerContextHisoricalFiles, SetLayerContextHisoricalFiles] = useState(
        []
    );
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);

    // function deleteCurrentContextLayer(layerAIContext){
    // 	executeAsModal(
    // 		layerAIContext.currentLayer.delete()
    // 	);
    // }

    useEffect(async () => {
        if (imageProgress == 1 || imageProgress == 0) {
            SetLayerContextHisoricalFiles(
                await GetHistoryFilePaths(thisLayersContext)
            );
            // let generatedLayer = GetNewestLayer()
            // let generatedIntendedLayerContextId = CreateAILayerContextId(generatedLayer)
            // setAILayerContext(generatedIntendedLayerContextId, thisLayersContext)
            // console.log(`set old layer context ${thisLayersContext.id} to new layer ${generatedLayer.name}, ${generatedLayer.id}`)
            // generatedLayer.move(thisLayersContext.currentLayer, photoshop.constants.ElementPlacement.PLACEBEFORE)
            // SetLayerAIContextCurrentLayer(generatedLayer, thisLayersContext)
            // deleteCurrentContextLayer(thisLayersContext)
        }
    }, [imageProgress]);

    return (
        <div className="flex flex-col bg-brand-dark">
            <div className="flex flex-row justify-between bg-brand">
                <div className="flex flex-col bg-brand-dark">
                    <Heading className="text-lg text-brand-dark">
                        <span className="text-lg text-white">
                            {thisLayersContext.currentLayer.name}
                        </span>
                    </Heading>
                    <Heading className="text-lg text-brand-dark">
                        <span className="text-lg text-white">
                            {thisLayersContext.currentLayer.id}
                        </span>
                    </Heading>
                </div>
                {layerContextHisoricalFiles &&
                    layerContextHisoricalFiles.map((fpath, index) => {
                        console.log(fpath);
                        return <img key={index} src={fpath} />;
                    })}
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
                                thisLayersContext
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
