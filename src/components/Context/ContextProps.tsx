import { ContextType } from 'bashConstants';
import { BashfulProps } from 'common/props/BashfulProps';
import LayerAIContext from 'models/LayerAIContext';
import PromptAIContext from 'models/PromptAIContext';

export interface ContextProps extends BashfulProps {
    contextID: string;
    contextType: ContextType;
    contextKey?: keyof typeof LayerAIContext | keyof typeof PromptAIContext;
    label?: string;
    app?: string; // lets just assume photoshop will be the default
    children?: any;
    animate?: boolean;
    inputDelayTime?: number;
    onChange?: (value: any) => void;
}
