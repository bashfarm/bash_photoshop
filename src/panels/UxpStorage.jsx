const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
import '../style.css';
import { MergeAndSaveAllVisibleLayersIntoImage, IsMoreThanOneVisibleLayer, PlaceImageFromDataOnLayer, SetNewestLayerOnTop } from '../utils/layer_service';
import {
    SaveMergedLayersImgPNGToDataFolder,
    GetDataFolderImageBase64ImgStr,
    SaveTextFileToDataFolder,
    SaveB64ImageToBinaryFileToDataFolder
} from '../utils/io_service';
import { useState, useEffect } from 'react';
import { Img2Img } from '../utils/ai_service';
import { alert } from '../utils/general_utils';
import { FormatBase64Image } from '../utils/ai_service';

function IsBase64(b64str){
    return b64str.includes("=")
}
export const UxpStorage = () => {
    

    var [base64MergedImgStr, SetBase64MergedImgStr] = useState('m');
    var [base64GeneratedImgStr, SetBase64GeneratedImgStr] = useState('m');

    const SetMergedImageBase64 = () =>
        GetDataFolderImageBase64ImgStr('mergedLayersImg.png').then((b64str) => {
            SetBase64MergedImgStr(b64str['imageHeader'] + b64str['base64Data']);
        });


    const GenerateImage = async () => {
        try{
            if(!IsBase64(base64GeneratedImgStr))
            {
                console.log(`We are trying to generate an image in the AI using this b64 string => '${base64GeneratedImgStr}.'🤦‍♂️`)
                console.log(`Also generated file is not in the correct base64 format '${base64GeneratedImgStr}'🙄`)
            }
            var generatedImageResponse = await Img2Img(base64MergedImgStr);
            console.log("🔥🔥 Generated image form app.js 🔥🔥")
        } catch(e){
            console.log(e)
        }
            // Set the first generated image to the generated image string
            SetBase64GeneratedImgStr(FormatBase64Image(generatedImageResponse["images"][0]))


    
    }

    useEffect(()=> {
        if (!IsBase64(base64GeneratedImgStr))
        {
            console.log(`we are trying to set the generated image b64 string in the beginning component lifecycle when it is just '${base64GeneratedImgStr}'🙄`)
            console.log(`Also generated file is not in the correct base64 format cause it is '${base64GeneratedImgStr}'🙄`)

        }
        else
            SaveB64ImageToBinaryFileToDataFolder("generatedFile.png", base64GeneratedImgStr)

    }, [base64GeneratedImgStr])

    return (
        <>
            <div className="column">
                <sp-action-button
                    onClick={async () => {
                        try {
                            // SaveTextFileToDataFolder("yolo.txt", "yolo")
                            if (IsMoreThanOneVisibleLayer()) {
                                MergeAndSaveAllVisibleLayersIntoImage()
                                var delayInMilliseconds = 2000; //1 second

                                setTimeout(function() {
                                //your code to be executed after 1 second
                                }, delayInMilliseconds);
                                SetMergedImageBase64()
                                await SetNewestLayerOnTop()
                                await GenerateImage()
                                PlaceImageFromDataOnLayer("generatedFile.png")

                            } else {
                                alert("Not enough layers Selected 😅!")
                                console.log('not enough layers');
                            }
                        } catch (e) {
                            console.log(e)
                            console.log('couldnt run visible merge');
                        }
                    }}
                >
                    CombineLayers
                </sp-action-button>
                {/* <sp-action-button onClick={SetMergedImageBase64}>Get Base 64 </sp-action-button> */}
                <sp-label>{JSON.stringify(base64MergedImgStr)}</sp-label>
                {/* This below can work */}
                {/* <sp-action-button onClick={GenerateImage}>Generate New Image</sp-action-button> */}
                <div className="row" style={{ alignItems: "stretch" }}/>
                {/* Just rendering the newly generated image */}
                <div className="image-container">
                    <img src={base64GeneratedImgStr} alt="preview-image" />
                </div>

            </div>
        </>
    );
};
