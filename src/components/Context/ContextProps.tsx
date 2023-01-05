import { BashfulProps } from 'common/props/BashfulProps';
import LayerAIContext from 'models/LayerAIContext';

export interface ContextProps extends BashfulProps {
    contextID: string;
    contextKey?: keyof typeof LayerAIContext;
    label?: string;
    app?: string; // lets just assume photoshop will be the default
    children?: any;
    animate?: boolean;
    inputDelayTime?: number;
    onChange?: (value: any) => void;
}
