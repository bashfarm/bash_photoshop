import { formatBase64Image } from '../utils/io_utils';
import {
    createNewContextHistoryFile,
    saveLayerContexttoHistory,
} from './context_service';
import { getDataFolderImageBase64ImgStr } from './io_service';
import { getNewestLayer, createNewLayerFromFile } from './layer_service';
const photoshop = require('photoshop');

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Accept', 'application/json');

/**
 * @param {String} imgb64Str
 * @param {Number} height
 * @param {Number} width
 * @param {String} prompt
 * @returns {Object}
 */
export async function img2Img(imgb64Str, height, width, prompt) {
    try {
        const raw = JSON.stringify({
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
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };
        const response = await fetch(
            `${process.env.API_URL}/sdapi/v1/img2img`,
            requestOptions
        );

        return await response.json();
    } catch (e) {
        console.log(e);
    }
}

/**
 * @param {String} prompt
 * @param {Number} height=512
 * @param {Number} width=512
 * @param {Number} batch_size=4
 * @returns {Object}
 */
export const txt2Img = async (
    prompt,
    height = 512,
    width = 512,
    batch_size = 4
) => {
    const payload = {
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

    const requestOptions = {
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
    }
};

/**
 * @typedef {Object} Artists
 * @property {String}
 * @property {Number}
 * @property {String}
 */

/**
 * @returns {Array<Artists>} Array of artist objects
 */
export const getArtists = async () => {
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
    }
};

/**
 * @returns {Array<String>} Array of artist categoties
 */
export const getArtistCategories = async () => {
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
 * @param {*} fileName
 * @param {*} width
 * @param {*} height
 * @param {*} layerAIContext
 * @param {Boolean} inplace if true this will replace the current layer with the new image
 */
export async function generateAILayer(width, height, layerAIContext) {
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
export async function getImageProcessingProgress() {
    const requestOptions = {
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
