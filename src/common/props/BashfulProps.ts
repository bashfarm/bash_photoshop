export interface BashfulProps extends React.HTMLAttributes<HTMLDivElement> {
    app?: string; // lets just assume photoshop will be the default
    children?: any;
    animate?: boolean;
    inputDelayTime?: number;
}
