import LayerAIContext from 'models/LayerAIContext';

export interface ContextProps extends React.HTMLAttributes<HTMLDivElement> {
    contextID: string;
    contextKey: keyof typeof LayerAIContext;
    app?: string; // lets just assume photoshop will be the default
    children?: any;
    animate?: boolean;
    inputDelayTime?: number;
    onChange?: (value: any) => void;
}
