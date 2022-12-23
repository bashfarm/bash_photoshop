import LayerAIContext from 'models/LayerAIContext';

export interface GeneratorProps extends React.HTMLAttributes<HTMLDivElement> {
    contextID: string;
    contextKey: keyof typeof LayerAIContext;
    app?: string; // lets just assume photoshop will be the default
    children?: any;
    inHundreds?: boolean;
    animate?: boolean;
    inputDelayTime?: number;
    onChange?: (value: any) => void;
}
