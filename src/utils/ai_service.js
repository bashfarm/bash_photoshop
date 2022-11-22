export async function Img2Img(imgb64Str) {
    try {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        var raw = JSON.stringify({
            init_images: [imgb64Str],
            resize_mode: 0,
            denoising_strength: 0.75,
            mask_blur: 4,
            inpainting_fill: 0,
            inpaint_full_res: true,
            inpaint_full_res_padding: 0,
            inpainting_mask_invert: 0,
            prompt: 'A doodle of colored knife cuts leaving colored blood on the illustration 8k ',
            seed: -1,
            subseed: -1,
            subseed_strength: 0,
            seed_resize_from_h: -1,
            seed_resize_from_w: -1,
            batch_size: 1,
            n_iter: 1,
            steps: 20,
            cfg_scale: 20,
            width: 512,
            height: 512,
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

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        var response = await fetch(
            'http://127.0.0.1:7860/sdapi/v1/img2img',
            requestOptions
        );
        return response.json();
    } catch (e) {
        console.log(e);
    }
}

/**
 *
 * @param {String} b64imgStr the base64encoded string that will need to be formatted
 * @returns
 */
export function FormatBase64Image(b64imgStr) {
    var b64header = 'data:image/png;base64, ';
    if (!b64imgStr.includes('data:image')) return b64header + b64imgStr;
}

/**
 *
 * @param {String} b64imgStr the base64encoded string that will need to be unformatted for images
 * @returns unformatted base64 string
 */
export function UnformatBase64Image(b64imgStr) {
    var b64header = 'data:image/png;base64, ';
    if (b64imgStr.includes('data:image'))
        return b64imgStr.replace(b64header, '');
    return b64imgStr;
}
