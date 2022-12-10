import { formatBase64Image } from '../utils/io_utils';
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
import LayerAIContext from 'models/LayerAIContext';
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
export const FormatBase64Image = (b64imgStr: string): string => {
    const b64header = 'data:image/png;base64, ';
    if (!b64imgStr.includes('data:image')) return b64header + b64imgStr;
    return b64imgStr;
};

/**
 *
 * @returns unformats base64 string
 */
export function UnformatBase64Image(b64imgStr: string): string {
    const b64header = 'data:image/png;base64, ';
    if (b64imgStr.includes('data:image'))
        return b64imgStr.replace(b64header, '');
    return b64imgStr;
}

/**
 *
 * @returns  Generated image in formatted base64 string
 */
export async function generateImage(
    mergeStr: string,
    height: number,
    width: number,
    prompt: string
): Promise<string> {
    try {
        const generatedImageResponse = await img2Img(
            mergeStr,
            height,
            width,
            prompt
        );
        return formatBase64Image(generatedImageResponse['images'][0]);
    } catch (e) {
        console.log(e);
        throw e;
    }
    // Set the first generated image to the generated image string
}

/**
 * Generate a new AI Image for the given context and puts it in a layer.
 *
 * @param width
 * @param height
 * @param layerAIContext
 * @returns
 */
export async function generateAILayer(
    width: number,
    height: number,
    layerAIContext: LayerAIContext
) {
    console.log('Generate AI layer');
    try {
        // This will save the current layer to plugin folder as a history file
        // We save in the beginning to make sure we capture all changes that could have occurred to the layer
        // before we send it off to the AI for regeneration.
        let contextHistoryFileEntry =
            layerAIContext.saveLayerContexttoHistory();

        // No available file entry.  The user needs to remove some history or do inplace regeneration TODO(Might not happen)
        if (!contextHistoryFileEntry) {
            return;
        }
        console.log(`Save File Entry`);
        console.log(contextHistoryFileEntry);

        // Retrieve the base64 string representation of the image given the name of the image.
        let b64Data = await getDataFolderImageBase64ImgStr(
            (
                await contextHistoryFileEntry
            ).name
        );

        // So we send off the new image that we saved and got it's string representation for 👏
        // What we will get back from the ai is an image.  The string representation in base64 encoding!
        const genb64Str = await generateImage(
            formatBase64Image(b64Data),
            height,
            width,
            layerAIContext.currentPrompt
        );

        // So we save the newly generated file as the next historical file
        // remember people will be editing this stuff and will want to go back to earlier
        // versions and bash them up.  So we want to keep working with the history like a
        // stack.
        let generatedFileName =
            await layerAIContext.createNewContextHistoryFile(genb64Str);

        console.log(`Generated Filename ${generatedFileName}`);

        // place the newly created image on a new layer.
        // 🔥 If we could just do a replace, that would be ideal. But we may lose some editing capabilties.
        await createNewLayerFromFile(generatedFileName);

        // Retrieve the newest layer that was created in photoshop, whereever it is.
        let generatedLayer = getNewestLayer(
            photoshop.app.activeDocument.layers
        );

        // We regenerated the layer with the context, now we update the context with the
        // new info and let the user do the process again!
        // This just puts the new layer in front of the previous as the layer that we used to
        // generate from, still exists at this point.
        layerAIContext.layers = [generatedLayer, ...layerAIContext.layers];

        return layerAIContext;
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
        throw error;
    }
}
