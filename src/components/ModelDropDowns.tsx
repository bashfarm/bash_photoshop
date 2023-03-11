import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import _ from 'lodash';
import { ContextType } from 'bashConstants';
import { BashfulHeader } from 'components/BashfulHeader';
import LayerAIContext from 'models/LayerAIContext';
import { getAvailableModelConfigs } from 'services/ai_service';
import { useAsyncEffect } from 'hooks/fetchHooks';
import ContextDropdown from 'components/Context/ContextDropdown';
import { ModelConfigResponse, ModelResponse } from 'common/types/sdapi';
import Spectrum from 'react-uxp-spectrum';

interface ModalProps {
	isCloudGenerating: boolean;
	onChange: (event: any) => void;
}

interface DropDownOption {
	displayName: string;
	value: string;
}

export default function ModelDropDown(props: ModalProps) {

	const getContextFromStore = useContextStore(
		(state: ContextStoreState) => state.getContextFromStore
	);


	const saveContextToStore = useContextStore(
		(state) => state.saveContextToStore
	);


	let { loading, value } = useAsyncEffect(async () => {
		
		if (props.isCloudGenerating) {
			// While this does work, this is for the future where we batch run the models, currently
			// we would have to make sure each local user swaps out the models when they want to use
			// a different model on a specific layer.  We will collect the selection of models for them
			// queue them up and run them in sequence using the currently loaded model and swap only when
			// necessary.
			// return getAvailableModels();
			return [];
		} else {
			return getAvailableModelConfigs();
		}
	});

	function getDropDownOptions() {
		if (loading) {
			return ['loading models...'];
		} else {
			if (props.isCloudGenerating) {
				return value
					.map((modelObj: ModelResponse) => {
						return modelObj.title;
					})
					.filter((name: string) => name != null);
			} else {
				return value
					.map((modelObj: ModelConfigResponse) => {
						return modelObj.display_name;
					})
					.filter((name: string) => name != null);
			}
		}
	}

	function getOptionValue(optionName: string) {
	
		if (props.isCloudGenerating) {
			return value.find((modelObj: ModelResponse) => {
				return modelObj.title === optionName;
			});

		} else {
			return value.find((modelObj: ModelConfigResponse) => {
				return modelObj.display_name === optionName;
			}
			);
		}
		
	}


    const [selectedOption, setSelectedOption] = React.useState<string>(null);

	return (
		<div className="flex flex-col">
			<BashfulHeader animate={true} />
			{loading ? (
			<Spectrum.Dropdown>
                <Spectrum.Menu slot="options">
                    
                                    <Spectrum.MenuItem
                                
                                    >
                                        {value}
                                    </Spectrum.MenuItem>
                          
                </Spectrum.Menu>
            </Spectrum.Dropdown>) : (
			<Spectrum.Dropdown>
                <Spectrum.Menu slot="options">
                    {getDropDownOptions() &&
                        getDropDownOptions().map((value: string) => {
                            try {
                                return (
                                    <Spectrum.MenuItem
                                        key={value}
                                        onClick={(event: any) => {
											let newDropDownOption: DropDownOption = {
												displayName: value,
												value: getOptionValue(value),
											};
											setSelectedOption(value)
											event.target.value = newDropDownOption;
                                            props?.onChange?.(event);
                                        }}
                                        selected={selectedOption == value}
										
                                    >
                                        {value}
                                    </Spectrum.MenuItem>
                                );
                            } catch (e) {
                                console.error(e);
                            }
                        })}
                </Spectrum.Menu>
            </Spectrum.Dropdown>) }


		</div>
w
	);
}


