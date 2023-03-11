import React from 'react';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import _ from 'lodash';
import { ContextStoreState, useContextStore } from 'store/contextStore';

interface ModalProps {
    handle: ExtendedHTMLDialogElement;
    contextID: string;
}

export default function ContextPalette() {
    let AIBrushContexts = useContextStore(
        (state: ContextStoreState) => state.AIBrushContexts
    );

    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    // async function regenerateLayer(
    // 	contextID: string,
    // 	layerNanme: string,
    // ) {
    // 	let duplicatedLayer = null;
    // 	console.log("🔥🔥regnerating?")
    // 	try {
    // 		console.log("🔥🔥going for context?")
    // 		const genAISettings = getContextFromStore(
    // 			contextID,
    // 			ContextType.PROMPT
    // 		);
    // 		console.log("🔥🔥Gathering settings for layer regeneration")
    // 		console.log(genAISettings)

    // 		let layerToRegenerate = getPhotoshopLayerFromName(layerNanme)
    // 		let newLayerAIContext = new LayerAIContext();
    // 		newLayerAIContext.consistencyStrength = genAISettings.consistencyStrength;
    // 		newLayerAIContext.currentPrompt = genAISettings.currentPrompt;
    // 		newLayerAIContext.negativePrompt = genAISettings.negativePrompt;
    // 		newLayerAIContext.stylingStrength = genAISettings.stylingStrength;
    // 		newLayerAIContext.model_config = selectedModelConfig.name;
    // 		newLayerAIContext.currentLayer = layerToRegenerate;
    // 		console.log("🔥🔥Layer Proxy Context made")
    // 		console.log(newLayerAIContext)
    // 		duplicatedLayer = await newLayerAIContext.duplicateCurrentLayer();
    // 		console.log("🔥🔥duplicated Layer made")
    // 		console.log(duplicatedLayer)

    // 		let copyOfGenAISettings = genAISettings.copy();
    // 		genAISettings.isGenerating = false;
    // 		saveContextToStore(copyOfGenAISettings);

    // 		const newLayer = await generateAILayer(newLayerAIContext);

    // 		console.log("generated Layer made")
    // 		console.log(newLayer)

    // 		genAISettings.isGenerating = false;
    // 		saveContextToStore(genAISettings);

    // 		await moveLayer(
    // 			newLayer,
    // 			layerToRegenerate,
    // 			photoshop.constants.ElementPlacement.PLACEBEFORE
    // 		);

    // 		await scaleAndFitLayerToCanvas(newLayer);

    // 		await createMaskFromLayerForLayer(duplicatedLayer, newLayer);
    // 		return newLayer;

    // 	} catch (e) {
    // 		console.error(e);
    // 	}
    // }

    return (
        <>
            <div>yolo</div>
        </>
    );
}
