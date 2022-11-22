import React, { useState, useEffect } from 'react';
import {
    PlaceImageFromDataOnLayer,
    MergeAndSaveAllVisibleLayersIntoImage,
    IsMoreThanOneVisibleLayer,
} from 'utils/layer_service';
import {
    GetDataFolderImageBase64ImgStr,
    SaveB64ImageToBinaryFileToDataFolder,
} from 'utils/io_service';
import { Img2Img, FormatBase64Image } from 'utils/ai_service';
import { alert } from 'utils/general_utils';
import '../style.css';

export const UxpStorage = () => {
    var [base64MergedImgStr, SetBase64MergedImgStr] = useState('m');
    var [base64GeneratedImgStr, SetBase64GeneratedImgStr] = useState('m');

    const SetMergedImageBase64 = () =>
        GetDataFolderImageBase64ImgStr('mergedLayersImg.png').then((b64str) => {
            SetBase64MergedImgStr(b64str['imageHeader'] + b64str['base64Data']);
        });

    const GenerateImage = async () => {
        var generatedImageResponse = await Img2Img(base64MergedImgStr);
        // Set the first generated image to the generated image string
        SetBase64GeneratedImgStr(
            FormatBase64Image(generatedImageResponse['images'][0])
        );
    };

    useEffect(() => {
        SaveB64ImageToBinaryFileToDataFolder(
            'generatedFile.png',
            base64GeneratedImgStr
        );
    }, [base64GeneratedImgStr]);

    return (
        <>
            <div className="column">
                <sp-action-button
                    onClick={async () => {
                        try {
                            // SaveTextFileToDataFolder("yolo.txt", "yolo")
                            if (IsMoreThanOneVisibleLayer()) {
                                MergeAndSaveAllVisibleLayersIntoImage();
                                SetMergedImageBase64();
                                await GenerateImage();
                                await SaveB64ImageToBinaryFileToDataFolder(
                                    'generatedImg.png',
                                    base64MergedImgStr
                                );

                                PlaceImageFromDataOnLayer('generatedFile.png');
                            } else {
                                alert('Not enough layers!');
                                console.log('not enough layers');
                            }
                        } catch (e) {
                            console.log(e);
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
                <div className="row" style={{ alignItems: 'stretch' }} />
                {/* Just rendering the newly generated image */}
                <div className="image-container">
                    <img src={base64GeneratedImgStr} alt="preview-image" />
                </div>
            </div>
        </>
    );
};
