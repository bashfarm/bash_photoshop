const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
import '../style.css';
import {
    CreateMergedLayer,
    DeselectLayers,
    GetTopLayer,
    PlaceImageFromDataOnLayer,
} from '../utils/layer_service';
import {
    GetDataFolderImageBase64ImgStr,
    SaveB64ImageToBinaryFileToDataFolder,
} from '../utils/io_service';
import { useState, useEffect, useRef } from 'react';
import {
    GenerateAILayer,
    GetImageProcessingProgress,
    Img2Img,
} from '../utils/ai_service';
import { SaveDocumentToPluginData } from '../utils/io_service';
import { HidingTool, UnHidingTool } from '../utils/tools_service';
import { Progressbar, Textarea } from 'react-uxp-spectrum';
import { ProgressButton } from '../components/ProgressButton';
import { useAppStore } from '../store/appStore';
import { LayerManager } from '../components/LayerManager';
import Example from '../components/tailwindtest';
import { ContextManager } from '../components/ContextManager';

const MERGEDFILENAME = 'mergedFile.png';
const GENERATEDFILENAME = 'generatedFile.png';

/**
 *
 * @param {String} b64str
 * @returns
 */
function IsBase64(b64str) {
    return b64str.length > 20;
}
export const UxpStorage = () => {
    var [base64MergedImgStr, SetBase64MergedImgStr] = useState('');

    var [imageProgress, SetImageProgress] = useState(0);
    var finalDocumentPrompt = useAppStore((state) => state.finalDocumentPrompt);
    var setFinalDocumentPrompt = useAppStore(
        (state) => state.setFinalDocumentPrompt
    );

    return (
        <>
            <div>Yo this is the frontend that will talk to the API</div>
            <sp-button
                onClick={async () => {
                    await CreateMergedLayer();
                    await SaveDocumentToPluginData(MERGEDFILENAME);
                    SetBase64MergedImgStr(
                        (await GetDataFolderImageBase64ImgStr(MERGEDFILENAME))
                            .base64Data
                    );
                }}
            >
                Merge Layers
            </sp-button>
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
            <sp-button
                onClick={async () => {
                    await HidingTool();
                }}
            >
                Hiding Tool
            </sp-button>
            <sp-button onClick={UnHidingTool}>UnHiding Tool</sp-button>
            <sp-dropdown placeholder="Make a selection...">
                <sp-menu slot="options">
                    <sp-menu-item> 512x512 </sp-menu-item>
                    <sp-menu-item disabled> 1024x1024 </sp-menu-item>
                </sp-menu>
            </sp-dropdown>
            <sp-button
                onClick={() => {
                    try {
                        executeAsModal(() => {
                            app.createDocument({ height: 512, width: 512 });
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }}
            >
                Create AI Optimized Document
            </sp-button>
            <Textarea
                placeholder="Enter your the image prompt"
                onInput={(event) => setFinalDocumentPrompt(event.target.value)}
                className="w-full"
                multiline
            ></Textarea>
            <sp-label>{finalDocumentPrompt}</sp-label>
            {/* <LayerManager layers={app.activeDocument.layers}></LayerManager> */}
			<ContextManager></ContextManager>
        </>
    );
};
