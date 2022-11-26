export async function Img2Img(imgb64Str, height, width, prompt) {
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
		var data = response.json()
		console.log(
			data
		)
		console.log("yolo")

        return data;
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

export async function GenerateImage (mergeStr, height, width, prompt) {
	try {
		if (!IsBase64(mergeStr)) {
			console.log(
				`Merged file we are trying to generate from is not in the correct base64 format '${mergeStr}'🙄`
			);
			return;
		}
		var generatedImageResponse = await Img2Img(
			mergeStr,
			height,
			width,
			prompt
		);
		console.log('🔥🔥 Generated image form UspxStorage.jsx 🔥🔥');
		return FormatBase64Image(generatedImageResponse['images'][0])
	} catch (e) {
		console.log(e);
	}
	// Set the first generated image to the generated image string
};


export async function GenerateAILayer(imgB64, width, height, prompt) {
    console.log('Generate AI layer');
	var genb64Str = await GenerateImage(imgB64, height, width, prompt)
	await SaveB64ImageToBinaryFileToDataFolder(GENERATEDFILENAME, genb64Str)
	await PlaceImageFromDataOnLayer(GENERATEDFILENAME)
}