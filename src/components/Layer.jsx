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
import { ProgressButton } from './ProgressButton';
const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;

export const Layer = ({ layer, children }) => {
    let layerAIContexts = useAppStore((state) => state.layerAIContexts);
    let setAILayerContext = useAppStore((state) => state.setAILayerContext);
    let [imageProgress, SetImageProgress] = useState(0);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row justify-between">
                <Heading className="t text-lg bg-brand">
                    Layer: <Label className="text-lg">{layer.name}</Label>
                </Heading>
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
                    Generate AI Layer
                </ProgressButton>
                <Progressbar
                    min={0}
                    max={1}
                    value={imageProgress}
                    id={1}
                    className="w-1/3 py-2 mr-2"
                ></Progressbar>
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
                <Button
                    className="bg-brand-light"
                    onClick={() => {
                        console.log('Not implemented');
                    }}
                >
                    Regenerate Layer
                </Button>
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
