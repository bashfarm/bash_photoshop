import { formatBase64Image } from '../utils/io_utils';
import {
    createNewContextHistoryFile,
    saveLayerContexttoHistory,
} from './context_service';
import { getDataFolderImageBase64ImgStr } from './io_service';
import { getNewestLayer, createNewLayerFromFile } from './layer_service';
import {
    Text2ImgRequest,
    Img2ImgRequest,
    ImageResponse,
    ProgressResponse,
    ArtistType,
    ArtistCategories,
} from '../common/types';
import { Layer } from 'photoshop/dom/Layer';
import { Layer } from 'photoshop/dom/Layer';

const photoshop = require('photoshop');

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Accept', 'application/json');

/**
 * @returns {Object}
 */
export async function img2Img(
    imgb64Str: string,
    height: number,
    width: number,
    prompt: string
): Promise<ImageResponse> {
    try {
        const raw: Img2ImgRequest = {
            init_images: [imgb64Str],
            resize_mode: 0,
            denoising_strength: 0.75,
            mask_blur: 4,
            inpainting_fill: 0,
            inpaint_full_res: true,
            inpaint_full_res_padding: 0,
            inpainting_mask_invert: 0,
            prompt: prompt,
            seed: -1,
            subseed: -1,
            subseed_strength: 0,
            seed_resize_from_h: -1,
            seed_resize_from_w: -1,
            batch_size: 1,
            n_iter: 1,
            steps: 20,
            cfg_scale: 20,
            width: width,
            height: height,
            restore_faces: false,
            tiling: false,
            negative_prompt: '',
            eta: 0,
            s_churn: 0,
            s_tmax: 0,
            s_tmin: 0,
            s_noise: 1,
            override_settings: {},
            sampler_index: 'Euler',
            include_init_images: false,
            mask: '',
            styles: [],
            sampler_name: '',
        };

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(raw),
            redirect: 'follow',
        };
        const response = await fetch(
            `${process.env.API_URL}/sdapi/v1/img2img`,
            requestOptions
        );

        return await response.json();
    } catch (e) {
        console.log(e);
        throw e;
    }
}

/**
 * @returns {Object}
 */
export const txt2Img = async (
    prompt: string,
    height: number = 512,
    width: number = 512,
    batch_size: number = 4
): Promise<ImageResponse> => {
    const payload: Text2ImgRequest = {
        enable_hr: false,
        denoising_strength: 0,
        firstphase_width: 0,
        firstphase_height: 0,
        prompt: prompt,
        styles: ['string'],
        seed: -1,
        subseed: -1,
        subseed_strength: 0,
        seed_resize_from_h: -1,
        seed_resize_from_w: -1,
        sampler_name: 'string',
        batch_size: batch_size,
        n_iter: 1,
        steps: 50,
        cfg_scale: 7,
        width: width,
        height: height,
        restore_faces: false,
        tiling: false,
        negative_prompt: 'string',
        eta: 0,
        s_churn: 0,
        s_tmax: 0,
        s_tmin: 0,
        s_noise: 1,
        override_settings: {},
        sampler_index: 'Euler',
    };

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: 'follow',
    };

    try {
        const response = await fetch(
            `${process.env.API_URL}/sdapi/v1/txt2img`,
            requestOptions
        );

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
        throw error;
    }
};

/**
 * @typedef {Object} Artists
 * @property {String}
 * @property {Number}
 * @property {String}
 */

/**
 * @returns Array of artist objects
 */
export const getArtists = async (): Promise<ArtistType[]> => {
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };
    try {
        console.log(process.env.API_URL);
        const response = await fetch(
            `${process.env.API_URL}/sdapi/v1/artists`,
            requestOptions
        );
        return await response.json();
    } catch (error) {
        console.log(error);
        throw error;
        throw error;
    }
};

/**
 * @returns Array of artist categoties
 */
export const getArtistCategories = async (): Promise<ArtistCategories> => {
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };
    try {
        console.log(process.env.API_URL);
        const response = await fetch(
            `${process.env.API_URL}/sdapi/v1/artist-categories`,
            requestOptions
        );

        return await response.json();
    } catch (error) {
        console.log(error);
        throw error;
        throw error;
    }
};

/**
 * This will send a request to the AI server and request an image given the prompt and image base64 string.  Also height and widith 😅
 * @param {*} mergeStr
 * @param {*} height
 * @param {*} width
 * @param {*} prompt
 * @returns
 */
export async function generateImage(mergeStr, height, width, prompt) {
    try {
        var generatedImageResponse = await img2Img(
            mergeStr,
            height,
            width,
            prompt
        );
        return formatBase64Image(generatedImageResponse['images'][0]);
    } catch (e) {
        console.log(e);
    }
    // Set the first generated image to the generated image string
}

/**
 * Generate a new AI Image and put it in a layer
 */
export async function generateAILayer(
    width: number,
    height: number,
    layerAIContext: any // TODO: Set this type
) {
    console.log('Generate AI layer');
    try {
        let savedLayerFileName = await saveLayerContexttoHistory(
            layerAIContext
        );

        // No available file name.  The user needs to remove some history
        if (!savedLayerFileName) {
            return;
        }
        console.log(`Save Filename ${savedLayerFileName}`);
        let b64Data = await getDataFolderImageBase64ImgStr(savedLayerFileName);
        let formattedB64Str = formatBase64Image(b64Data);
        const genb64Str = await generateImage(
            formattedB64Str,
            height,
            width,
            layerAIContext.currentPrompt
        );
        let generatedFileName = await createNewContextHistoryFile(
            layerAIContext,
            genb64Str
        );
        console.log(`Generated Filename ${generatedFileName}`);
        await createNewLayerFromFile(generatedFileName);
        let generatedLayer = getNewestLayer(
            photoshop.app.activeDocument.layers
        );
        return generatedLayer;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieve the progress of the currently generating batch of images
 * @returns {Object}
 */
export async function getImageProcessingProgress(): Promise<ProgressResponse> {
    const requestOptions: RequestInit = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };

    try {
        const response = await fetch(
            `${process.env.API_URL}/sdapi/v1/progress?skip_current_image=false`,
            requestOptions
        );

        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

/**
 * Switching back to using the batchplay version.  I think we can invoke a delete and capture the delete event with this.
 * update: Dont think this is working.  The layer gets deleted, 1. right now its the wrong layer and 2. I am not detecting the event 😒
 * @param {*} layer
 */
// TODO: Set layer type
export async function deleteLayer(layer: any): Promise<void> {
    try {
        // let command = {
        //     _obj: 'delete',
        //     _target: [
        //         { _enum: 'ordinal', _ref: 'layer', _value: 'targetEnum' },
        //     ],
        //     layerID: [layer.id],
        // };
        // await executeAsModal(async () => {
        //     return await bp([command], {});
        // });
        await executeAsModal(async () => {
            layer.delete();
        });

        console.log(layer);
    } catch (e) {
        console.error(e);
    }
}
