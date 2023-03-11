import React, { useState } from 'react';
import { Divider, Button, RadioGroup } from 'react-uxp-spectrum';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import PromptAIContext from 'models/PromptAIContext';
import _ from 'lodash';
import { ContextType } from 'bashConstants';
import { BashfulHeader } from 'components/BashfulHeader';
import PromptContextItem from 'components/Context/PromptContextItem';
import photoshop from 'photoshop';
import { createLayerFromSelection, createMaskFromLayerForLayer, moveLayer, scaleAndFitLayerToCanvas } from 'services/layer_service';
import { saveLayerToPluginData } from 'services/io_service';
import { getPhotoshopLayerFromName } from 'utils/ps_utils';
import LayerAIContext from 'models/LayerAIContext';
import { generateAILayer, getAvailableModelConfigs } from 'services/ai_service';
import { useAsyncEffect } from 'hooks/fetchHooks';
import ContextDropdown from 'components/Context/ContextDropdown';
import { ModelConfigResponse, ModelResponse } from 'common/types/sdapi';
import ModelDropDown from 'components/ModelDropDowns';

interface ModalProps {
	handle: ExtendedHTMLDialogElement;
	contextID: string;
}

export default function ContextPalette() {

	const getContextFromStore = useContextStore(
		(state: ContextStoreState) => state.getContextFromStore
	);


	const saveContextToStore = useContextStore(
		(state) => state.saveContextToStore
	);

	let [selectedContexts, setSelectedContexts] = React.useState<PromptAIContext[]>([]);
	let [selectedModelConfig, setSelectedModelConfig] = React.useState<ModelConfigResponse>(null);

	// TODO: This can also be moved since it's using the store, and the store can be called from anywhere
	async function createNewContext() {
		let context = new PromptAIContext();
		saveContextToStore(context);
		return context;
	}

	async function regenerateLayer(
		contextID: string,
		layerNanme: string,
	) {
		let duplicatedLayer = null;
		console.log("🔥🔥regnerating?")
		try {
			console.log("🔥🔥going for context?")
			const genAISettings = getContextFromStore(
				contextID,
				ContextType.PROMPT
			);
			console.log("🔥🔥Gathering settings for layer regeneration")
			console.log(genAISettings)

			let layerToRegenerate = getPhotoshopLayerFromName(layerNanme)
			let newLayerAIContext = new LayerAIContext();
			newLayerAIContext.consistencyStrength = genAISettings.consistencyStrength;
			newLayerAIContext.currentPrompt = genAISettings.currentPrompt;
			newLayerAIContext.negativePrompt = genAISettings.negativePrompt;
			newLayerAIContext.stylingStrength = genAISettings.stylingStrength;
			newLayerAIContext.model_config = selectedModelConfig.name;
			newLayerAIContext.currentLayer = layerToRegenerate;
			console.log("🔥🔥Layer Proxy Context made")
			console.log(newLayerAIContext)
			duplicatedLayer = await newLayerAIContext.duplicateCurrentLayer();
			console.log("🔥🔥duplicated Layer made")
			console.log(duplicatedLayer)

			let copyOfGenAISettings = genAISettings.copy();
			genAISettings.isGenerating = false;
			saveContextToStore(copyOfGenAISettings);

			const newLayer = await generateAILayer(newLayerAIContext);

			console.log("generated Layer made")
			console.log(newLayer)

			genAISettings.isGenerating = false;
			saveContextToStore(genAISettings);

			await moveLayer(
				newLayer,
				layerToRegenerate,
				photoshop.constants.ElementPlacement.PLACEBEFORE
			);

			await scaleAndFitLayerToCanvas(newLayer);

			await createMaskFromLayerForLayer(duplicatedLayer, newLayer);
			return newLayer;

		} catch (e) {
			console.error(e);
		}
	}

	return (
		<div className="flex flex-col">
			<BashfulHeader animate={true} />

			<ModelDropDown
				isCloudGenerating={selectedContexts[0]?.is_cloud_run}
				onChange={function (event: any): void {
					// throw new Error('Function not implemented.');
					setSelectedModelConfig(event.target.value)
				}} />
			<div className="mb-1">
				<Button
					variant="primary"
					onClick={async () => {
						let newContext = await createNewContext();
						console.log(newContext);
					}}
				>
					Create New AI Setting
				</Button>
				{selectedContexts.length > 0
					&&
					(<></>)
				}
				<Button
					variant="primary"
					onClick={async () => {
						console.log('begin brushing')
						console.log(photoshop)
						console.log(photoshop.app)
						console.log(photoshop.app.activeDocument.channels.map(c => c))
						console.log(photoshop.app.activeDocument)
						let newLayer = await createLayerFromSelection()
						console.log(newLayer)
						let entry = await saveLayerToPluginData('tmpInpaintingImage.png', newLayer)
						console.log(entry)
						console.log("Made it out")
						let genLayer = await regenerateLayer(selectedContexts[0].id, newLayer.name)
						console.log(genLayer)
						// await BAPInpaint(selectedContexts[0], image, mask)
						console.log(newLayer)


					}}
				>
					Begin Brushing
				</Button>

			</div>
			<ContextItems onContextSelect={(newSelection: PromptAIContext) => {
				let newSelectedContexts = [...selectedContexts, newSelection]
				setSelectedContexts(newSelectedContexts)
			}} />

		</div>
	);
}


interface PromptContextProps {
	onContextSelect: (context: PromptAIContext) => void;
}

/**
 * This creates the actual <ContextItem/>s list to be displayed.  This renders the contexts
 * in the order the layers are found in the document.
 * @returns
 */
// TODO: move to its own file or something else - needs refactoring though
function ContextItems(props: PromptContextProps) {
	let contexts = useContextStore(
		(state: ContextStoreState) => state.promptContexts
	);

	const setSelectedPromptContext = useContextStore(
		(state: ContextStoreState) => state.setSelectedPromptContext
	);


	let saveContextToStore = useContextStore(
		(state) => state.saveContextToStore
	);
	let [selected, setSelected] = useState<string>('');

	return (
		<>
			{Object.keys(contexts).map((key) => {
				let context = contexts[key];
				return (
					<>
						<RadioGroup
							value={selected}
							onChange={(e: any) => {
								setSelected(e.target.value);
								setSelectedPromptContext(context);
								props.onContextSelect(context);
							}}
						>

							<PromptContextItem key={context.id} contextID={context.id} contextType={ContextType.PROMPT} />
							<Divider
								key={_.uniqueId()}
								className="my-2"
								size="small"
							/>
						</RadioGroup>
					</>
				);
			})}
		</>
	);
}
