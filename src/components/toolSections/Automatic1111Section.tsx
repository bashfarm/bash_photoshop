import { useAsyncEffect } from 'hooks/fetchHooks';
import React from 'react';
import { Label, Checkbox } from 'react-uxp-spectrum';
import { getAvailableModels } from 'services/ai_service';
import { useContextStore, ContextStoreState } from 'store/contextStore';
import { useRenderCounter } from 'utils/profiling_utils';
import { ToolSection } from './ToolSection';

interface Automatic1111SectionProps {
    contextID: string;
    onChanged: (value: boolean) => void;
}

export function Automatic1111Section(props: Automatic1111SectionProps) {
    useRenderCounter('Automatic111CheckBox');
    const getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    let { value } = useAsyncEffect(async () => {
        // While this does work, this is for the future where we batch run the models, currently
        // we would have to make sure each local user swaps out the models when they want to use
        // a different model on a specific layer.  We will collect the selection of models for them
        // queue them up and run them in sequence using the currently loaded model and swap only when
        // necessary.
        return getAvailableModels();
    });

    return (
        <ToolSection>
            {value?.length > 0 && (
                <>
                    <Label>Use Auto1111</Label>
                    <Checkbox
                        onChange={() => {
                            console.log(props.contextID);
                            let copyOfContext = getContextFromStore(
                                props.contextID
                            ).copy();
                            copyOfContext.is_cloud_run =
                                !copyOfContext.is_cloud_run;
                            saveContextToStore(copyOfContext);
                            props.onChanged(copyOfContext.is_cloud_run);
                        }}
                    />
                </>
            )}
        </ToolSection>
    );
}
