import { formatBase64Image } from '../utils/io_utils';
import { getBase64OfImgInPluginDataFolder } from './io_service';
import {
    getNewestLayer,
    createNewLayerFromFile,
    selectLayerMask,
    createMaskFromLayerForLayer,
} from './layer_service';
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
import {
    ConfigAPIResponse,
    Img2ImgRequestDepthMask,
    ModelResponse,
} from 'common/types/sdapi';
import { Layer } from 'photoshop/dom/Layer';

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
        const payload: Img2ImgRequest = {
            init_images: [imgb64Str],
            resize_mode: 0,
            denoising_strength: layerContext.getDenoisingStrength(),
            mask_blur: 4,
            inpainting_fill: 0,
            inpaint_full_res: true,
            inpaint_full_res_padding: 0,
            inpainting_mask_invert: 0,
            prompt: layerContext.generateContextualizedPrompt(),
            seed: layerContext.seed,
            subseed: -1,
            subseed_strength: 0,
            seed_resize_from_h: -1,
            seed_resize_from_w: -1,
            batch_size: 1,
            n_iter: 1,
            steps: 25,
            cfg_scale: layerContext.getStylingStrength(),
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
        console.log(payload);

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(payload),
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
        prompt: layerContext.generateContextualizedPrompt(),
        styles: layerContext.styleReferences.map((s: StyleReference) => s.name),
        seed: layerContext.seed,
        subseed: -1,
        subseed_strength: 0,
        seed_resize_from_h: -1,
        seed_resize_from_w: -1,
        sampler_name: '',
        batch_size: layerContext.batchSize,
        n_iter: 1,
        steps: 25,
        cfg_scale: layerContext.getStylingStrength(),
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

    console.log(payload);

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
): Promise<Layer> {
    let genb64Str = null;
    let generatedLayer = null;
    let oldLayer = layerContext.currentLayer;

    try {
        // This will save the current layer to plugin folder as a history file
        // We save in the beginning to make sure we capture all changes that could have occurred to the layer
        // before we send it off to the AI for regeneration.
        let contextHistoryFileEntry =
            await layerContext.saveLayerContexttoHistory(true);

        // No available file entry.  The user needs to remove some history or do inplace regeneration TODO(Might not happen)
        if (!contextHistoryFileEntry) {
            return;
        }

        // Retrieve the base64 string representation of the image given the name of the image.
        let b64Data = await getBase64OfImgInPluginDataFolder(
            contextHistoryFileEntry.name
        );

        // So we send off the new image that we saved and got it's string representation for 👏
        // What we will get back from the ai is an image.  The string representation in base64 encoding!
        try {
            const response = await img2img(
                formatBase64Image(b64Data),
                layerContext
            );
            genb64Str = formatBase64Image(response['images'][0]);
        } catch (e) {
            console.log(e);
            throw e;
        }

        if (genb64Str) {
            // So we save the newly generated file as the next historical file
            // remember people will be editing this stuff and will want to go back to earlier
            // versions and bash them up.  So we want to keep working with the history like a
            // stack.
            let generatedFileName =
                await layerContext.createNewContextHistoryFile(genb64Str);

            await createNewLayerFromFile(generatedFileName);

            // Retrieve the newest layer that was created in photoshop, whereever it is.
            generatedLayer = getNewestLayer(
                photoshop.app.activeDocument.layers
            );
        }

        return generatedLayer;
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

/**
 * This will upscale the given image using ESRGAN.  However, this requires the auto-sd extension to be installed. https://github.com/Interpause/auto-sd-paint-ext
 * @param b64UnformattedImage
 * @param downScaleFirst
 * @returns
 */
export async function upScaleImage(
    b64UnformattedImage: string,
    downScaleFirst: boolean = true
) {
    let payload = {
        upscaler_name: 'ESRGAN_4x',
        src_img: b64UnformattedImage, // probably should stay 512x512
        downscale_first: downScaleFirst,
    };

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify(payload),
    };

    try {
        const response = await fetch(
            `${process.env.API_URL}/sdapi/interpause/upscale`,
            requestOptions
        );

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * This will retrieve and up to date list of models from the API!  We even get the file path of the model.  Very useful if we
 * want to manage their models too!
 * @returns
 */
export async function getAvailableModels(): Promise<Array<ModelResponse>> {
    const requestOptions: RequestInit = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };
    try {
        let response = await fetch(
            `${process.env.API_URL}/sdapi/v1/sd-models`,
            requestOptions
        );
        let data = await response.json();
        console.log(data);
        return data;
    } catch (e) {
        console.error(e);
    }
}

/**
 * This is a helper function to set the model of the entire Automatic Stable Diffusion API.
 * @param modelName
 */
export async function swapModel(modelName: string = 'model.ckpt') {
    let payload = {
        sd_model_checkpoint: modelName,
    };
    await setAPIConfig(payload);
}

/**
 * This retrieves the configuration of the Automatic Stable Diffusion API.
 * @returns
 */
export async function getAPIConfig(): Promise<ConfigAPIResponse> {
    const requestOptions: RequestInit = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };
    try {
        let response = await fetch(
            `${process.env.API_URL}/sdapi/v1/options`,
            requestOptions
        );
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Given the new configuration the api should be using.  Set the configuration of the API.  Get the config from the getAPIConfig endpoint to see what it looks like.
 * @param config
 * @returns
 */
export async function setAPIConfig(config: any) {
    let payload = {
        ...config,
    };

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify(payload),
    };
    try {
        let response = await fetch(
            `${process.env.API_URL}/sdapi/v1/options`,
            requestOptions
        );
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

export async function getUpScaledB64(
    b64ImgStr: string,
    layerContext: LayerAIContext
) {
    var payload = {
        resize_mode: 0,
        show_extras_results: true,
        gfpgan_visibility: 0,
        codeformer_visibility: 0,
        codeformer_weight: 0,
        //   "upscaling_resize": 2,
        upscaling_resize_w: layerContext.imageWidth,
        upscaling_resize_h: layerContext.imageHeight,
        upscaling_crop: true,
        upscaler_1: 'ESRGAN_4x',
        upscaler_2: 'None',
        extras_upscaler_2_visibility: 0,
        upscale_first: false,
        image: b64ImgStr,
    };

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify(payload),
    };
    try {
        let response = await fetch(
            `${process.env.API_URL}/sdapi/v1/extra-single-image`,
            requestOptions
        );
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Deprecated, use img2img instead
 * Use this as a reference to run scripts.
 */
export async function getImg2ImgDepth(
    b64ImgStr: string,
    layerContext: LayerAIContext
) {
    const payload: Img2ImgRequestDepthMask = {
        init_images: [b64ImgStr],
        resize_mode: 0,
        denoising_strength: layerContext.getDenoisingStrength(),
        mask_blur: 4,
        inpainting_fill: 0,
        inpaint_full_res: true,
        inpaint_full_res_padding: 0,
        inpainting_mask_invert: 0,
        prompt: layerContext.generateContextualizedPrompt(),
        seed: layerContext.seed,
        subseed: -1,
        subseed_strength: 0,
        seed_resize_from_h: -1,
        seed_resize_from_w: -1,
        batch_size: 1,
        n_iter: 1,
        steps: 25,
        cfg_scale: layerContext.getStylingStrength(),
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
        script_args: [
            false,
            86,
            true,
            512,
            512,
            false,
            2,
            true,
            true,
            true,
            false,
        ],
        script_name: 'Depth aware img2img mask',
    };

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify(payload),
    };
    try {
        let response = await fetch(
            `${process.env.API_URL}/sdapi/v1/img2img/script`,
            requestOptions
        );
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}
