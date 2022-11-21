const fs = require('uxp').storage.localFileSystem;
const photoshop = require('photoshop');
const app = photoshop.app;
const bp = photoshop.action.batchPlay;
const executeAsModal = photoshop.core.executeAsModal;
import './style.css';
import { Main, IsMoreThanOneVisibleLayer } from './utils/layer_service';
import {
    SaveMergedLayersImgPNGToDataFolder,
    GetDataFolderImageBase64ImgStr,
} from './utils/io_service';
import { useState, useEffect } from 'react';
import { Img2Img } from './utils/ai_service';

const App = () => {
    var [base64MergedImgStr, SetBase64MergedImgStr] = useState('m');
    const SetMergedImageBase64 = () =>
        GetDataFolderImageBase64ImgStr('mergedLayersImg.png').then((b64str) => {
            SetBase64MergedImgStr(b64str['base64Data']);
        });

    useEffect(() => {
        Img2Img(base64MergedImgStr).then((data) => {
            console.log(newImageData);
        });
    }, [base64MergedImgStr]);

    const PlaceImageFromDataOnLayer = async (imageName) => {
        try {
            const dataFolder = await fs.getDataFolder();
            var placedDocument = await dataFolder.getEntry(imageName);
            if (!placedDocument) return;
            let tkn = fs.createSessionToken(placedDocument);
            const res = await executeAsModal(
                async () => {
                    await bp(
                        [
                            {
                                _obj: 'placeEvent',
                                target: { _path: tkn, _kind: 'local' },
                                linked: true,
                            },
                        ],
                        {}
                    );
                    app.activeDocument.activeLayers[0].rasterize();
                },
                { commandName: 'open File' }
            );
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <>
            <div className="column">
                <sp-action-button
                    onClick={() => {
                        try {
                            if (IsMoreThanOneVisibleLayer()) {
                                // Main()
                                // SaveMergedLayersImgPNGToDataFolder()
                                // PlaceImageFromDataOnLayer("mergedLayersImg.png")
                                SetMergedImageBase64();
                            } else {
                                console.log('not enough layers');
                            }
                        } catch (e) {
                            console.log('couldnt run visible merge');
                        }
                    }}
                >
                    Generate New Image Layer
                </sp-action-button>
                {/* <sp-action-button onClick={SetMergedImageBase64}>Get Base 64 </sp-action-button> */}
                <sp-label>{JSON.stringify(base64MergedImgStr)}</sp-label>
            </div>
        </>
    );
};

export default App;
