var myHeaders = new Headers();

export async function Img2Img(imgb64Str){
    try {
        var raw = {
            "init_images": [
                imgb64Str
            ],
            "resize_mode": 0,
            "denoising_strength": 0.75,
            "mask_blur": 4,
            "inpainting_fill": 0,
            "inpaint_full_res": true,
            "inpaint_full_res_padding": 0,
            "inpainting_mask_invert": 0,
            "prompt": "A doodle of colored knife cuts leaving colored blood on the illustration 8k ",
            "seed": -1,
            "subseed": -1,
            "subseed_strength": 0,
            "seed_resize_from_h": -1,
            "seed_resize_from_w": -1,
            "batch_size": 1,
            "n_iter": 1,
            "steps": 20,
            "cfg_scale": 20,
            "width": 512,
            "height": 512,
            "restore_faces": false,
            "tiling": false,
            "negative_prompt": "",
            "eta": 0,
            "s_churn": 0,
            "s_tmax": 0,
            "s_tmin": 0,
            "s_noise": 1,
            "override_settings": {},
            "sampler_index": "Euler",
            "include_init_images": false
          };
          
          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
          
        //   using localhost of API for now.  Stand yours up with the --api flag as well https://github.com/AUTOMATIC1111/stable-diffusion-webui
                // Fetching the image data ---------------------------------------------
        let response = await fetch("http://127.0.0.1:7860/sdapi/v1/img2img", requestOptions);
        let arrBuffer = await response.arrayBuffer();
        fetch("http://127.0.0.1:7860/sdapi/v1/img2img", requestOptions)
        .then((response) => response.json())
        .then((data) => console.log(data));
        console.log(await response.json())
        return response.text()
    } catch(e){
        console.log(e)
    }
    
}
