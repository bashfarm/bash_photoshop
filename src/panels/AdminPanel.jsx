import { useState } from 'react';

export const AdminPanel = () => {
    const [denoisingStrength, SetDenoisingStrength] = useState(0.01);
    const [resizeMode, SetResizeMode] = useState(0);
    const [maskBlur, SetMackBlur] = useState(4);
    const [inpaintingFill, SetInpaintingFill] = useState(4);
    const [inpaintFillFullRes, SetInpaintFillFullRes] = useState(true);
    const [inpaintFillFullResPadding, SetInpaintFillFullResPadding] =
        useState(true);
    const [inpaintMaskInvert, SetInpaintMaskInvert] = useState(0);
    const [seed, SetSeed] = useState(-1);
    const [subSeed, SetSubSeed] = useState(-1);
    const [subSeedStrength, SetSubSeedStrength] = useState(-1);
    const [seedResizeFromH, SetSeedResizeFromH] = useState(-1);
    const [seedResizeFromW, SetSeedResizeFromW] = useState(-1);
    const [batchSize, SetBatchSize] = useState(1);
    const [nIters, SetNIters] = useState(1);
    const [nSteps, SetNSteps] = useState(20);
    const [cfgScale, SetCFGScale] = useState(20);

    // These should really only be for display.  The layer should always be exported as the last layer it is generating.
    // However, we should use the admin panel to find the right settings an save them.  That should also be the right settings for
    // the small asset generator.
    const [width, SetWidth] = useState(512); // 512x512 is the min image that stable diffusion can generate
    const [height, SetHeight] = useState(512); // 512x512 is the min image that stable diffusion can generate
    // ###########

    const [eta, SetEta] = useState(0);
    const [SChurn, SetSchurn] = useState(0);
    const [STMax, SetSTMax] = useState(0);
    const [STMin, SetSTMin] = useState(0);
    const [SNoise, SetSNoise] = useState(1);
    const [overrideSettings, SetOverrideSettings] = useState({});
    const [prompt, SetPrompt] = useState('');
    const [negativePrompt, SetNegativePrompt] = useState('');
    const [samplerIndex, SetSamplerIndex] = useState('Euler');
    const [includeInitImages, SetIncludeInitImages] = useState(false);
    const [restoreFaces, SetRestoreFaces] = useState(false);
    const [tiling, SetTiling] = useState(false);
    var payload = {
        resize_mode: resizeMode,
        denoising_strength: denoisingStrength,
        resize_mode: resizeMode,
        mask_blur: maskBlur,
        inpainting_fill: inpaintingFill,
        inpaint_full_res: inpaintFillFullRes,
        inpaint_full_res_padding: inpaintFillFullResPadding,
        inpainting_mask_invert: inpaintMaskInvert,
        prompt: prompt,
        seed: seed,
        subseed: subSeed,
        subseed_strength: subSeedStrength,
        seed_resize_from_h: seedResizeFromH,
        seed_resize_from_w: seedResizeFromW,
        batch_size: batchSize,
        n_iter: nIters,
        steps: nSteps,
        cfg_scale: cfgScale,
        width: width,
        height: height,
        restore_faces: restoreFaces,
        tiling: tiling,
        negative_prompt: negativePrompt,
        eta: eta,
        s_churn: SChurn,
        s_tmax: STMax,
        s_tmin: STMin,
        s_noise: SNoise,
        override_settings: overrideSettings,
        sampler_index: samplerIndex,
        include_init_images: includeInitImages,
    };

    return (
        <>
            {/* <label>Batch Size <input onChange={e => SetBatchSize(e.target.value)} type="number" placeholder={`default (${batchSize})`}/> </label> */}
            {/* <label>Batch Size <input onChange={e => SetBatchSize(e.target.value)} type="number" placeholder={`default (${batchSize})`}/> </label> */}
			<div>Kevin, this is not connected to anything.  Just starting to make something so we can figure out the right settings more quickly</div>
			<sp-textfield
                value={prompt}
                onInput={(evt) => SetPrompt(evt.target.value)}
            >
                <sp-label slot="label">
                    Place a prompt to use
                </sp-label>
            </sp-textfield>
            <sp-textfield
			type="number"
                value={batchSize}
                onInput={(evt) => SetBatchSize(evt.target.value)}
            >
                <sp-label slot="label">
                    Number of images to generate (#{batchSize})
                </sp-label>
            </sp-textfield>
            <sp-slider
                min="0"
                max="1"
                value={`"${denoisingStrength}"`}
                class="slider"
                onInput={(evt) => SetDenoisingStrength(evt.target.value)}
            >
                <sp-label slot="label">Radius</sp-label>
            </sp-slider>

        </>
    );
};
