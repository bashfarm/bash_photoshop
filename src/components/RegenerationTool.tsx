import { ContextType } from 'bashConstants';
import photoshop from 'photoshop';
import React, { FC, useEffect, useRef, useState } from 'react';
import Progressbar from 'react-uxp-spectrum/dist/Progressbar';
import { generateAILayer } from 'services/ai_service';
import {
    createMaskFromLayerForLayer,
    deleteLayer,
    moveLayer,
    scaleAndFitLayerToCanvas,
} from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

type RegenerationToolProps = {
    icon?: FC<any>;
    label?: string;
    contextId: string;
	contextType: ContextType;
    newLayerDTOSelectionFunc?: Function;
};

export default function RegenerationTool(props: RegenerationToolProps) {
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    const saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    const genAISettings = getContextFromStore(
        props.contextId,
        props.contextType
    );

	async function regenerateMask(){
		// get updated context to apply
		const genAISettings = getContextFromStore(
			props.contextId,
			props.contextType
		);

		// get mask from photoshop selection
		// get layer from photoshop selection

		// save layer as image and send to server
		// save selection as image and send to server
	}


    async function regenerateLayer(
        deleteOldLayer: boolean = false,
    ) {
        let duplicatedLayer = null;

        try {
            const genAISettings = getContextFromStore(
                props.contextId,
                props.contextType
            );
            const oldLayer = genAISettings.currentLayer;
            let copyOfContext = genAISettings.copy();
            let newGenAISettings = getContextFromStore(
                props.contextId,
                props.contextType
            );
            let copyOfNewContext = newGenAISettings.copy();
            copyOfNewContext.isGenerating = true;
            saveContextToStore(copyOfNewContext);
            if (await genAISettings.hasLayerMask()) {
                duplicatedLayer = await genAISettings.duplicateCurrentLayer();
                copyOfContext.currentLayerName = duplicatedLayer.name;
                await copyOfContext.applyLayerMask();
            }

            const newLayer = await generateAILayer(genAISettings);
            copyOfContext.isGenerating = false;
            copyOfContext.currentLayerName = newLayer.name;
            saveContextToStore(copyOfContext);

            await moveLayer(
                newLayer,
                oldLayer,
                photoshop.constants.ElementPlacement.PLACEBEFORE
            );

            if (deleteOldLayer) {
                await deleteLayer(oldLayer);
            }
            await scaleAndFitLayerToCanvas(newLayer);

            if (duplicatedLayer) {
                await createMaskFromLayerForLayer(duplicatedLayer, newLayer);
                await deleteLayer(duplicatedLayer);
            }

            props.newLayerDTOSelectionFunc(newLayer.name);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleButtonClick() {
		if (props.contextType === ContextType.LAYER){
			await regenerateLayer(false);

		}
		else if (props.contextType === ContextType.PROMPT){
			// await regenerateMaskedSection(true)
		}
    }

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onClick={handleButtonClick}
        >
            {/* I don't know why the logic is backwards here. */}
            {!(getContextFromStore(props.contextId, props.contextType)
                ?.isGenerating) ? (
                <div>
                    <props.icon
                        {...{
                            fontSize: 'small',
                            style: { color: 'var(--uxp-host-text-color)' },
                        }}
                    />

                    <span
                        className={`ml-1 mr-10 whitespace-nowrap`}
                        style={{
                            color: 'var(--uxp-host-label-text-color)',
                        }}
                    >
                        {props.label}
                    </span>
                </div>
            ) : (
                <div>
                    <h1
                        className={`inline-block font-bold text-xl `}
                        style={{
                            color: '#71f79f',
                        }}
                    >
                        Generating
                    </h1>
                    <h1
                        className={`inline-block font-bold text-xl `}
                        style={{
                            color: '#7e4dfb',
                        }}
                    >
                        ...
                    </h1>
                </div>
            )}
        </div>
    );
}
