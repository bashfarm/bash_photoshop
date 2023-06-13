import React from 'react';
import ReactDOM from 'react-dom';
import { addB64Header, removeB64Header } from '../utils/io_utils';
import {
    getB64StringFromImageUrl,
    getBase64OfImgInPluginDataFolder,
    getDataFolderEntry,
} from './io_service';
import { createNewLayerFromFile } from './layer_service';
import {
    Text2ImgRequest,
    Img2ImgRequest,
    ImageResponse,
    ProgressResponse,
} from '../common/types';
import LayerAIContext from 'models/LayerAIContext';
import {
    BashfulAPIImg2ImgRequest,
    BashfulAPITxt2ImgRequest,
    BashfulImageAPIResponse,
    ConfigAPIResponse,
    Img2ImgRequestDepthMask,
    ModelConfigResponse,
    ModelResponse,
} from 'common/types/sdapi';
import { Layer } from 'photoshop/dom/Layer';
import { createLayerFileName } from 'utils/general_utils';
import { getAPIErrors, popUpAPIErrors } from './validation_service';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Accept', 'application/json');

const AUTO1111_API_URL = 'http://127.0.0.1:7860';
const GCP_LOCAL_TESTING_URL = 'http://127.0.0.1:8080';
const CLOUD_API_URL =
    'https://us-central1-bashful-photoshop.cloudfunctions.net/';

const calling_application = 'Bashful: The AI Powered Photoshop Plugin';

/**
 * This function is used to generate image using the bashful image api
 *
 * @returns {Object}
 */
export async function BAPIImg2Img(
    imgb64Str: string,
    layerContext: LayerAIContext
): Promise<BashfulImageAPIResponse> {
    let response = null;
    try {
        const payload: BashfulAPIImg2ImgRequest = {
            init_images: [imgb64Str],
            denoising_strength: layerContext.getDenoisingStrength(),
            prompt: layerContext.currentPrompt,
            seed: layerContext.seed,
            guidance: layerContext.getStylingStrength(),
            styling_strength: layerContext.getStylingStrength(),
            negative_prompt: layerContext.negativePrompt,
            model_config: layerContext.model_config,
            calling_application: calling_application,
        };

        console.log('payload', payload);

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(payload),
            redirect: 'follow',
        };
        response = await fetch(`${CLOUD_API_URL}/img2img`, requestOptions);

        console.info('AI SERIVCE BAPIImg2Img Request:', requestOptions);
        let data = response.json();

        return data;
    } catch (e) {
        // console.error('AI SERIVCE BAPIImg2Img Response:', response.text());
        console.error(e);
        throw e;
    }
}

/**
 * This function is used to generate image using the bashful image api
 *
 * @returns {Object}
 */
export async function BAPITxt2Img(
    layerContext: LayerAIContext
): Promise<BashfulImageAPIResponse> {
    try {
        const payload: BashfulAPITxt2ImgRequest = {
            prompt: layerContext.currentPrompt,
            seed: layerContext.seed,
            guidance: layerContext.getStylingStrength(),
            styling_strength: layerContext.getStylingStrength(),
            negative_prompt: layerContext.negativePrompt,
            model_config: layerContext.model_config,
            calling_application: calling_application,
        };

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(payload),
            redirect: 'follow',
        };
        const response = await fetch(
            `${CLOUD_API_URL}/txt2img`,
            requestOptions
        );

        let data = response.json();

        console.info('AI SERIVCE BAPITxt2Img:', requestOptions);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

/**
 * @returns {Object}
 */
export async function img2img(
    imgb64Str: string,
    layerContext: LayerAIContext
): Promise<ImageResponse | BashfulImageAPIResponse> {
    try {
        if (layerContext.is_cloud_run) {
            let response = await BAPIImg2Img(imgb64Str, layerContext);
            if (response.url == undefined) {
                console.error(response);
            }
            return response;
        }

        const payload: Img2ImgRequest = {
            init_images: [imgb64Str],
            resize_mode: 0,
            denoising_strength: layerContext.getDenoisingStrength(),
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
            steps: 50,
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

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(payload),
            redirect: 'follow',
        };
        console.info('AI SERIVCE img2img:', requestOptions);
        const response = await fetch(
            `${AUTO1111_API_URL}/sdapi/v1/img2img`,
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
    if (layerContext.is_cloud_run) {
    }
    const payload: Text2ImgRequest = {
        enable_hr: false,
        denoising_strength: 0,
        firstphase_width: 0,
        firstphase_height: 0,
        prompt: layerContext.currentPrompt,
        styles: [],
        seed: layerContext.seed,
        subseed: -1,
        subseed_strength: 0,
        seed_resize_from_h: -1,
        seed_resize_from_w: -1,
        sampler_name: '',
        batch_size: layerContext.batchSize,
        n_iter: 1,
        steps: 50,
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

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: 'follow',
    };

    try {
        const response = await fetch(
            `${AUTO1111_API_URL}/sdapi/v1/txt2img`,
            requestOptions
        );

        console.info('AI SERIVCE txt2img:', requestOptions);
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
 * Generate a new AI Image for the given context and puts it in a layer.
 *
 * @param width
 * @param height
 * @param layerAIContext
 * @returns
 */
export async function generateAILayer(layerContext: LayerAIContext) {
    try {
        // If the user doesn't want the new image to be consistent with another image than just generate a new one.
        if (layerContext.consistencyStrength == 0) {
            return await generateImageLayerUsingOnlyContext(layerContext);
        }

        return await generateImageLayerUsingLayer(layerContext);
    } catch (e) {
        console.error('Problem regenerating layer', e);
        popUpAPIErrors(await getAPIErrors());
        throw e;
    }
}

export async function generateImageLayerUsingOnlyContext(
    layerContext: LayerAIContext
) {
    try {
        // So we send off the new image that we saved and got it's string representation for 👏
        // What we will get back from the ai is an image.  The string representation in base64 encoding!
        let genb64Str = null;
        if (!layerContext.is_cloud_run) {
            try {
                const response = await txt2img(layerContext);
                genb64Str = addB64Header(response['images'][0]);
            } catch (e) {
                console.error('Regenerating Layer With Only Prompt', e);
                throw e;
            }
        } else {
            const response = await BAPITxt2Img(layerContext);
            genb64Str = await getB64StringFromImageUrl(response['url']);
        }

        if (genb64Str) {
            // So we save the newly generated file as the next historical file
            // remember people will be editing this stuff and will want to go back to earlier
            // versions and bash them up.  So we want to keep working with the history like a
            // stack.
            let generatedFileName = await layerContext.createTempGenFile(
                genb64Str
            );

            let generatedLayer = await createNewLayerFromFile(
                generatedFileName
            );

            return generatedLayer;
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function generateImageLayerUsingLayer(
    layerContext: LayerAIContext
): Promise<Layer> {
    let genb64Str = null;
    let generatedLayer = null;

    try {
        let savedLayerFileEntry = await getDataFolderEntry(
            createLayerFileName(
                layerContext.currentLayer.name,
                layerContext.id,
                false
            )
        );

        if (!savedLayerFileEntry) {
            return;
        }

        // Retrieve the base64 string representation of the image given the name of the image.
        let b64Data = await getBase64OfImgInPluginDataFolder(
            savedLayerFileEntry.name
        );

        // So we send off the new image that we saved and got it's string representation for 👏
        // What we will get back from the ai is an image.  The string representation in base64 encoding!
        try {
            let generatedResponse = null;
            if (!layerContext.is_cloud_run) {
                generatedResponse = (await img2img(
                    addB64Header(b64Data),
                    layerContext
                )) as ImageResponse;
                genb64Str = addB64Header(generatedResponse['images'][0]);
            } else {
                generatedResponse = (await img2img(
                    removeB64Header(b64Data),
                    layerContext
                )) as BashfulImageAPIResponse;
                genb64Str = await getB64StringFromImageUrl(
                    generatedResponse['url']
                );
            }
        } catch (e) {
            console.error('Regenerating Layer Using Layer and Prompt', e);
            throw e;
        }

        try {
            if (genb64Str) {
                // So we save the newly generated file as the next historical file
                // remember people will be editing this stuff and will want to go back to earlier
                // versions and bash them up.  So we want to keep working with the history like a
                // stack.
                let generatedFileName = await layerContext.createTempGenFile(
                    genb64Str
                );
                console.info('generatedFileName', generatedFileName);

                generatedLayer = await createNewLayerFromFile(
                    generatedFileName
                );
                return generatedLayer;
            }
        } catch (e) {
            console.error('Trying to create new layer from generation', e);
            throw e;
        }
    } catch (e) {
        console.error(e);
        throw e;
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
            `${AUTO1111_API_URL}/sdapi/v1/progress?skip_current_image=false`,
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
            `${AUTO1111_API_URL}/sdapi/v1/sd-models`,
            requestOptions
        );
        let data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * This will retrieve and up to date list of models from the API!  We even get the file path of the model.  Very useful if we
 * want to manage their models too!
 * @returns
 */
export async function getAvailableModelConfigs(): Promise<
    Array<ModelConfigResponse>
> {
    const requestOptions: RequestInit = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };
    try {
        let response = await fetch(
            `${CLOUD_API_URL}/get_model_configs`,
            requestOptions
        );
        let data = await response.json();
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
    console.info('AI SERVICE getAPIConfig:', requestOptions);

    try {
        let response = await fetch(
            `${AUTO1111_API_URL}/sdapi/v1/options`,
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
            `${AUTO1111_API_URL}/sdapi/v1/options`,
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
            `${AUTO1111_API_URL}/sdapi/v1/extra-single-image`,
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
        prompt: layerContext.currentPrompt,
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
            `${AUTO1111_API_URL}/sdapi/v1/img2img/script`,
            requestOptions
        );
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}
