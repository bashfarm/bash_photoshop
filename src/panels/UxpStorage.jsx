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
import { useState, useEffect, useRef } from 'react';
import { Img2Img } from '../utils/ai_service';
import { alert } from '../utils/general_utils';
import { FormatBase64Image } from '../utils/ai_service';

/**
 * 
 * @param {String} b64str 
 * @returns 
 */
function IsBase64(b64str){
    return b64str.length > 20
}
export const UxpStorage = () => {
    

    var [base64MergedImgStr, SetBase64MergedImgStr] = useState('');
    var [base64GeneratedImgStr, SetBase64GeneratedImgStr] = useState('');
	const hasGenb64ToBinMounted = useRef(true);
	const hasMergedb64ToBinMounted = useRef(true);




	useEffect(()=> {
		if (hasGenb64ToBinMounted.current) {
			hasGenb64ToBinMounted.current = false;
			return;
		  }

		if (!IsBase64(base64GeneratedImgStr))
		{
			console.log(`Generated file is not in the correct base64 format cause it is '${base64GeneratedImgStr}'🙄`)

		}
		else
			SaveB64ImageToBinaryFileToDataFolder("generatedFile.png", base64GeneratedImgStr)


	}, [base64GeneratedImgStr])

    useEffect(()=> {

		if (hasMergedb64ToBinMounted.current) {
			hasMergedb64ToBinMounted.current = false;
			return;
		  }

        if (!IsBase64(base64MergedImgStr))
        {
            console.log(`Also merged file is not in the correct base64 format cause it is '${base64MergedImgStr}'🙄`)

        }
        else
            SaveB64ImageToBinaryFileToDataFolder("mergedLayersImg.png", base64MergedImgStr)

    }, [base64GeneratedImgStr])

	const GenerateImage = async (mergeStr) => {
        try{
			if(!IsBase64(mergeStr))
			{
				console.log(`Merged file we are trying to generate from is not in the correct base64 format '${mergeStr}'🙄`)
				return
			}

			var generatedImageResponse = await Img2Img(mergeStr);
			console.log("🔥🔥 Generated image form UspxStorage.jsx 🔥🔥")
            SetBase64GeneratedImgStr(FormatBase64Image(generatedImageResponse["images"][0]))
        } catch(e){
            console.log(e)
        }
            // Set the first generated image to the generated image string
    }

    return (
        <>
            <div className="column">
                <sp-action-button
                    onClick={async () => {
                        try {
                            // SaveTextFileToDataFolder("yolo.txt", "yolo")
                            if (IsMoreThanOneVisibleLayer()) {
								var mergedValue = await MergeAndSaveAllVisibleLayersIntoImage("mergedLayersImg.png")
								console.log("🔥🔥🔥🔥🔥🔥🔥")
								console.log(mergedValue)
                                SetBase64MergedImgStr(mergedValue)
                                var delayInMilliseconds = 10000; //1 second

                                setTimeout(function() {
                                //your code to be executed after 1 second
                                }, delayInMilliseconds);
                                // await SetNewestLayerOnTop()
								console.log("about to generate image")
                                await GenerateImage(mergedValue)
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
