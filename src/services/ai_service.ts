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
import { alert } from './alert_service';
import photoshop from 'photoshop';
import StyleReference from 'models/StyleReference';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Accept', 'application/json');

/**
 * @returns {Object}
 */
export async function img2img(
    imgb64Str: string,
    layerContext: LayerAIContext
): Promise<ImageResponse> {
    try {
        const raw: Img2ImgRequest = {
            init_images: [imgb64Str],
            resize_mode: 0,
            denoising_strength: layerContext.consistencyStrength,
            mask_blur: 4,
            inpainting_fill: 0,
            inpaint_full_res: true,
            inpaint_full_res_padding: 0,
            inpainting_mask_invert: 0,
            prompt: layerContext.currentPrompt,
            seed: layerContext.seed,
            subseed: -1,
            subseed_strength: 0,
            seed_resize_from_h: -1,
            seed_resize_from_w: -1,
            batch_size: 1,
            n_iter: 1,
            steps: 20,
            cfg_scale: layerContext.stylingStrength,
            width: layerContext.imageWidth,
            height: layerContext.imageHeight,
            restore_faces: false,
            tiling: false,
            negative_prompt: layerContext.negativePrompt,
            eta: 0,
            s_churn: 0,
            s_tmax: 0,
            s_tmin: 0,
            s_noise: 1,
            override_settings: {},
            sampler_index: 'Euler',
            include_init_images: false,
            mask: null,
            styles: [],
            sampler_name: null,
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
        console.error(e);
        throw e;
    }
}

/**
 * @returns {Object}
 */
export const txt2img = async (
    layerContext: LayerAIContext
): Promise<ImageResponse> => {
    const payload: Text2ImgRequest = {
        enable_hr: false,
        denoising_strength: 0,
        firstphase_width: 0,
        firstphase_height: 0,
        prompt: layerContext.currentPrompt,
        styles: layerContext.styles.map((s: StyleReference) => s.name),
        seed: -1,
        subseed: -1,
        subseed_strength: 0,
        seed_resize_from_h: -1,
        seed_resize_from_w: -1,
        sampler_name: '',
        batch_size: layerContext.batchSize,
        n_iter: 1,
        steps: 50,
        cfg_scale: 7,
        width: layerContext.imageWidth,
        height: layerContext.imageHeight,
        restore_faces: false,
        tiling: false,
        negative_prompt: layerContext.negativePrompt,
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
    }
};

/**
 * Generate a new AI Image for the given context and puts it in a layer.
 *
 * @param width
 * @param height
 * @param layerAIContext
 * @returns
 */
export async function generateAILayer(layerContext: LayerAIContext) {
    // If the user doesn't want the new image to be consistent with another image than just generate a new one.
    if (layerContext.consistencyStrength == 0) {
        return await generateImageLayerUsingOnlyContext(layerContext);
    }

    return await generateImageLayerUsingLayer(layerContext);
}

export async function generateImageLayerUsingOnlyContext(
    layerContext: LayerAIContext
) {
    try {
        // So we send off the new image that we saved and got it's string representation for 👏
        // What we will get back from the ai is an image.  The string representation in base64 encoding!
        let genb64Str = null;
        try {
            const response = await txt2img(layerContext);
            console.log(response);
            genb64Str = formatBase64Image(response['images'][0]);
        } catch (e) {
            console.log(e);
            throw e;
        }

        console.log(`retrieved b64 image`);
        console.log(genb64Str);

        if (genb64Str) {
            // So we save the newly generated file as the next historical file
            // remember people will be editing this stuff and will want to go back to earlier
            // versions and bash them up.  So we want to keep working with the history like a
            // stack.
            let generatedFileName =
                await layerContext.createNewContextHistoryFile(genb64Str);

            await createNewLayerFromFile(generatedFileName);

            // Retrieve the newest layer that was created in photoshop, whereever it is.
            let generatedLayer = getNewestLayer(
                photoshop.app.activeDocument.layers
            );

            return generatedLayer;
        }
    } catch (e) {
        console.error(e);
        alert(
            `Something is wrong with retrieving information from the API.  Please check that your installation is working properly https://github.com/AUTOMATIC1111/stable-diffusion-webui`
        );
    }
}

export async function generateImageLayerUsingLayer(
    layerContext: LayerAIContext
) {
    try {
        // This will save the current layer to plugin folder as a history file
        // We save in the beginning to make sure we capture all changes that could have occurred to the layer
        // before we send it off to the AI for regeneration.
        let contextHistoryFileEntry =
            await layerContext.saveLayerContexttoHistory();

        // No available file entry.  The user needs to remove some history or do inplace regeneration TODO(Might not happen)
        if (!contextHistoryFileEntry) {
            return;
        }

        // Retrieve the base64 string representation of the image given the name of the image.
        let b64Data = await getDataFolderImageBase64ImgStr(
            contextHistoryFileEntry.name
        );

        // So we send off the new image that we saved and got it's string representation for 👏
        // What we will get back from the ai is an image.  The string representation in base64 encoding!
        let genb64Str = null;
        try {
            const response = await img2img(
                formatBase64Image(b64Data),
                layerContext
            );
            console.log(response);
            genb64Str = formatBase64Image(response['images'][0]);
        } catch (e) {
            console.log(e);
            throw e;
        }

        console.log(`retrieved b64 image`);
        console.log(b64Data);

        if (genb64Str) {
            // So we save the newly generated file as the next historical file
            // remember people will be editing this stuff and will want to go back to earlier
            // versions and bash them up.  So we want to keep working with the history like a
            // stack.
            let generatedFileName =
                await layerContext.createNewContextHistoryFile(genb64Str);

            await createNewLayerFromFile(generatedFileName);

            // Retrieve the newest layer that was created in photoshop, whereever it is.
            let generatedLayer = getNewestLayer(
                photoshop.app.activeDocument.layers
            );

            return generatedLayer;
        }
    } catch (e) {
        console.error(e);
        alert(
            `Something is wrong with retrieving information from the API.  Please check that your installation is working properly https://github.com/AUTOMATIC1111/stable-diffusion-webui`
        );
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
