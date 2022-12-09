export type Text2ImgRequest = {
    enable_hr: boolean;
    denoising_strength: number;
    firstphase_width: number;
    firstphase_height: number;
    prompt: string;
    styles: string[];
    seed: number;
    subseed: number;
    subseed_strength: number;
    seed_resize_from_h: number;
    seed_resize_from_w: number;
    sampler_name: string;
    batch_size: number;
    n_iter: number;
    steps: number;
    cfg_scale: number;
    width: number;
    height: number;
    restore_faces: boolean;
    tiling: boolean;
    negative_prompt: string;
    eta: number;
    s_churn: number;
    s_tmax: number;
    s_tmin: number;
    s_noise: number;
    override_settings: Override_setting;
    sampler_index: string;
};

export type Img2ImgRequest = {
    init_images: string[];
    resize_mode: number;
    denoising_strength: number;
    mask: string;
    mask_blur: number;
    inpainting_fill: number;
    inpaint_full_res: boolean;
    inpaint_full_res_padding: number;
    inpainting_mask_invert: number;
    prompt: string;
    styles: string[];
    seed: number;
    subseed: number;
    subseed_strength: number;
    seed_resize_from_h: number;
    seed_resize_from_w: number;
    sampler_name: string;
    batch_size: number;
    n_iter: number;
    steps: number;
    cfg_scale: number;
    width: number;
    height: number;
    restore_faces: boolean;
    tiling: boolean;
    negative_prompt: string;
    eta: number;
    s_churn: number;
    s_tmax: number;
    s_tmin: number;
    s_noise: number;
    override_settings: Override_setting;
    sampler_index: string;
    include_init_images: boolean;
};

export type ImageResponse = {
    images: string[];
    parameters: ImageResponseParameters;
    info: string;
};

type ImageResponseParameters = {
    enable_hr: boolean;
    denoising_strength: number;
    firstphase_width: number;
    firstphase_height: number;
    prompt: string;
    styles: string[];
    seed: number;
    subseed: number;
    subseed_strength: number;
    seed_resize_from_h: number;
    seed_resize_from_w: number;
    sampler_name: string;
    batch_size: number;
    n_iter: number;
    steps: number;
    cfg_scale: number;
    width: number;
    height: number;
    restore_faces: boolean;
    tiling: boolean;
    negative_prompt: string;
    eta: number;
    s_churn: number;
    s_tmax: number;
    s_tmin: number;
    s_noise: number;
    override_settings: Override_setting;
    sampler_index: string;
};

type Override_setting = {};
type State = {};

export type ProgressResponse = {
    progress: number;
    eta_relative: number;
    state: State;
    current_image: string;
};

export type ArtistType = {
    name: string;
    score: number;
    category: string;
};

export type ArtistCategories = string[];
