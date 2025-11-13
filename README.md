# **bash_photoshop — Stable Diffusion Photoshop Plugin**
#### [Documentation](https://docs.bashful.ai/bashful-ai-powered-photoshop-plugin/bashful-free-plugin-for-photoshop/ui-overview)


*A lightweight Photoshop extension that pipes prompts directly to Stable Diffusion (Automatic1111 WebUI) and returns generated images in-app.*

## **Overview**

**bash_photoshop** is a Photoshop plugin that brings the power of **Stable Diffusion** directly into Adobe Photoshop.
It connects to a running **Stable Diffusion WebUI (Automatic1111)** server and allows you to:

* Send prompts directly from Photoshop
* Generate new images
* Run img2img on selected layers
* Replace layers automatically
* Iterate inside your existing workflow
* Avoid constant exporting / importing between apps

This tool was built to streamline AI-assisted illustration, concept art, and texture creation—without ever leaving Photoshop.

---

## **Features**

### **✔ Prompt-to-Canvas Generation**

Enter a text prompt inside the plugin panel and automatically receive a generated image placed into a new layer.

### **✔ Img2Img from Any Layer**

Select a layer and send it directly to Stable Diffusion WebUI with your chosen parameters (denoise, CFG, steps, sampler, seed, etc.).

### **✔ Realtime Iteration Workflow**

Quickly iterate with prompt tweaks or seed variations—all without changing windows.

### **✔ Automatic1111 Compatible**

Fully powered by the Automatic1111 API:

* `/sdapi/v1/txt2img`
* `/sdapi/v1/img2img`
* `/sdapi/v1/options`

### **✔ Lightweight + Simple**

No extra installs needed beyond Photoshop and a running WebUI instance.

---

## **Requirements**

To use this plugin, you need:

* **Adobe Photoshop (2021 or newer recommended)**
* **Stable Diffusion WebUI by Automatic1111**

  * Must be running locally
  * API enabled
* **Python 3.10+** *(if running SD locally)*
* A GPU-supported Stable Diffusion installation (recommended)

---

## **Installation**

### **1. Install & Run Stable Diffusion WebUI**

If you haven't already installed Automatic1111 WebUI:
[https://github.com/AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)

Start it with:

```bash
webui-user.bat
```

or:

```bash
python launch.py --api
```

Make sure the API is enabled. You should see something like:

```
Running on local URL:  http://127.0.0.1:7860
```

---

### **2. Install the Photoshop Plugin**

1. Download or clone this repo:

```bash
git clone https://github.com/bashfarm/bash_photoshop.git
```

2. Copy the plugin folder into your Photoshop extensions directory:

#### **MacOS**

```
/Applications/Adobe Photoshop*/Plug-ins/
```

#### **Windows**

```
C:\Program Files\Adobe\Adobe Photoshop\Plug-ins\
```

3. Restart Photoshop.
4. Go to:
   **Window → Extensions → Bash Photoshop (Stable Diffusion)**

---

## **Usage**

### **1. Configure Your SD WebUI URL**

Set the API endpoint inside the plugin preferences:

```
http://127.0.0.1:7860
```

If you’re running SD on another machine, replace with LAN IP.

---

### **2. Text-to-Image**

* Type your prompt
* Select resolution
* Adjust sampling + steps
* Click **Generate**
* The plugin will create a new Photoshop layer with the generated output

---

### **3. Image-to-Image**

* Select a layer
* Choose **Img2Img Mode**
* Adjust denoising strength
* Click **Generate**

The chosen layer is automatically sent to the WebUI and replaced or duplicated depending on your settings.

---

### **4. Negative Prompts**

Supports full negative prompt control just like Automatic1111.

---

### **5. Seeds, CFG, Samplers**

All core Stable Diffusion settings are available:

* Samplers (Euler, DPM++, etc.)
* Steps
* CFG
* Seed (random or locked)
* Strength
* Restore faces (if enabled in WebUI)

---

## **How It Works (Under the Hood)**

The plugin communicates directly with the Automatic1111 API using HTTP POST requests.
It serializes your prompt, settings, and (optionally) the selected Photoshop layer image as base64.

Examples:

**txt2img endpoint**

```
POST /sdapi/v1/txt2img
```

**img2img endpoint**

```
POST /sdapi/v1/img2img
```

Responses are decoded and placed back into Photoshop as layers.

Everything stays local unless your WebUI server is remote.

---

## **Troubleshooting**

### **The panel doesn’t show up**

Make sure:

* You installed the plugin into the **Plug-ins** folder
* Photoshop was restarted
* You’re using a supported version of Photoshop

### **Connection refused or timeout**

Check:

* Stable Diffusion WebUI is running
* You enabled the API (default is enabled)
* URL is correct: `http://127.0.0.1:7860`

### **Img2Img errors**

Ensure:

* Layer is selected
* Layer is rasterized (Smart Objects must be simplified)

---

## **Planned Features**

* Batch generation
* Layer masking support
* Photoshop selection → SD inpainting
* ControlNet support
* History panel for prompt variations
* Auto-save SD parameters per document

---

## **Contributing**

Pull requests welcome!
Feel free to open issues for:

* Feature requests
* Bug reports
* API compatibility updates

---

## **License**

MIT License — free to use, modify, and integrate into your own workflows.
