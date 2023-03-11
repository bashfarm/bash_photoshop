import { ContextType } from 'bashConstants';
import { BashfulProps } from 'common/props/BashfulProps';
import LayerAIContext from 'models/LayerAIContext';
import AIBrushContext from 'models/AIBrushContext';

export interface ContextProps extends BashfulProps {
    contextID: string;
    contextType: ContextType;
    contextKey?: keyof typeof LayerAIContext | keyof typeof AIBrushContext;
    label?: string;
    app?: string; // lets just assume photoshop will be the default
    children?: any;
    animate?: boolean;
    inputDelayTime?: number;
    onChange?: (value: any) => void;
}
