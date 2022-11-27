import produce from 'immer';
import create from 'zustand';

var promptStyleRef = {
	"id" : "id", // for figuring out the images and prompts used effeciently in a database and during analysis
	"prompt":"", // for the prompt to be used in the image
	"processedPrompt": "", // for the actual input from the prompt to be used to "style" the image 
	"isProcessed": false // to effeciently check if the prompt style reference has been processed for important keywords.
}

var smallDetail = {
	"prompt": "prompt", // The prompt that generated the asset, the fully generated one
	"detailName": "", // The part where the user has control of the prompt...what did they put in?  Lets call it detailName and guide the user in to making it a noun
	"numInDoc": 0, //
	"layer": "{Layer}" // we should get reference to the layer that this detail is on.
}
// Immer store wrapper
export const immer = config => (set, get) => config(fn => set(produce(fn)), get)

// Zustand and Immer
export const useAppStore = create(immer((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
	promptStyleReferences: {},
    addPromptStyleRef: (promptStyleRef) => set((state) => {
		state.promptStyleReferences[promptStyleRef.id] = promptStyleRef
	}),
	smallDetailAssets: {},
    addSmallDetail: (smallDetail) => set(state => {
		if (state.smallDetailAssets.hasOwnProperty(smallDetail.detailName)){
			state.smallDetailAssets[smallDetail.detailName]['numInDoc'] += 1;
		}
		else{
			state.smallDetailAssets[smallDetail.detailName] = smallDetail;
 
		}

	}),
})));


function IncreaseDetailCount(DetailName){
	addSmallDetail(DetailName)
}