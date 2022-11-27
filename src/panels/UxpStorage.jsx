const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
import '../style.css';
import {
	CreateMergedLayer, DeselectLayers, GetTopLayer, PlaceImageFromDataOnLayer
} from '../utils/layer_service';
import {
    GetDataFolderImageBase64ImgStr,
    SaveB64ImageToBinaryFileToDataFolder,
} from '../utils/io_service';
import { useState, useEffect, useRef } from 'react';
import { GenerateAILayer, Img2Img } from '../utils/ai_service';
import { SaveDocumentToPluginData } from '../utils/io_service';
import { HidingTool, UnHidingTool } from '../utils/tools_service';


const MERGEDFILENAME = "mergedFile.png"
const GENERATEDFILENAME = "generatedFile.png"

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
    var [base64GeneratedImgStr, SetBase64GeneratedImgStr] = useState('');
    const hasGenb64ToBinMounted = useRef(true);
    const hasMergedb64ToBinMounted = useRef(true);

    useEffect(() => {
        if (hasGenb64ToBinMounted.current) {
            hasGenb64ToBinMounted.current = false;
            return;
        }

        if (!IsBase64(base64GeneratedImgStr)) {
            console.log(
                `Generated file is not in the correct base64 format cause it is '${base64GeneratedImgStr}'🙄`
            );
        } else
            SaveB64ImageToBinaryFileToDataFolder(
                'generatedFile.png',
                base64GeneratedImgStr
            );
    }, [base64GeneratedImgStr]);

    useEffect(() => {
        if (hasMergedb64ToBinMounted.current) {
            hasMergedb64ToBinMounted.current = false;
            return;
        }

        if (!IsBase64(base64MergedImgStr)) {
            console.log(
                `Also merged file is not in the correct base64 format cause it is '${base64MergedImgStr}'🙄`
            );
        } else
            SaveB64ImageToBinaryFileToDataFolder(
                'mergedLayersImg.png',
                base64MergedImgStr
            );
    }, [base64GeneratedImgStr]);



    return (
        <>
            <sp-button
                onClick={async () => {
					await CreateMergedLayer();
					await SaveDocumentToPluginData(MERGEDFILENAME)
				}}
            >
                Merge Layers
            </sp-button>
            <sp-button
                onClick={() => GenerateAILayer('New AI Generated Layer Name', SetBase64GeneratedImgStr, GetTopLayer({active: true}))}
            >
                Generate AI layer
            </sp-button>
            <sp-button onClick={async () => {
				await HidingTool()
				}}>Hiding Tool</sp-button>
            <sp-button onClick={() => UnHidingTool()}>UnHiding Tool</sp-button>
        </>
    );
};






