import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { Button } from 'react-uxp-spectrum';
import {
    toggleOffContextHidingTool,
    toggleOnContextHidingTool,
} from 'services/tools_service';

export type ContexToolBarColumnProps = {
    layerContext: LayerAIContext;
};

export const ContextToolBar = (props: ContexToolBarColumnProps) => {
    return (
        <div className="flex flex-row space-x-1">
            <Button
                onClick={() => toggleOnContextHidingTool(props.layerContext)}
            >
                Hiding Tool
            </Button>
            <Button
                onClick={() => toggleOffContextHidingTool(props.layerContext)}
            >
                UnHiding Tool
            </Button>
        </div>
    );
};
