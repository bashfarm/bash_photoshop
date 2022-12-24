import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';
import { ContextDropdown } from './generatorInputs/ContextDropdown';
export type ContextInfoColumnProps = {
    contextID: string;
};

function DefaultContextInfoColumn() {
    return (
        <div className="flex flex-col min-w-fit justify-center">
            <ContextLabel value="No layer Selected" labelText={'Layer Name:'} />
            {/* <ContextLabel value="No layer Selected" labelText={'Layer Id:'} />
            <ContextLabel value="No layer Selected" labelText={'Context ID:'} /> */}
        </div>
    );
}

export const ContextInfoColumn = (props: ContextInfoColumnProps) => {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

    try {
        return (
            <div className="flex flex-col min-w-fit justify-center">
                <ContextLabel
                    value={layerContext.currentLayer?.name}
                    labelText={'Layer Name:'}
                />
                {/* <ContextDropdown
					contextID={props.contextID}
					contextKey={
						'docType' as keyof typeof LayerAIContext
					}
					options={["illustration", "doodle", "photo", "dream", "3D animation"]} /> */}
            </div>
        );
    } catch (e) {
        console.warn('probably a deleted current layer');
        return <DefaultContextInfoColumn></DefaultContextInfoColumn>;
    }
};
