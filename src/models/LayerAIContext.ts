import { Layer } from 'photoshop/dom/Layer';
import LayerAIHistory from './LayerAIHistory';
import SmallDetailContext from './SmallDetailContext';

export default interface LayerAIContext {
    id: Number; // this should be the id number of the layer
    smallDetails: Array<SmallDetailContext>; // The details from the above object
    currentPrompt: string;
    layers: Array<Layer>; // the layers that belong to the context
    history: Array<LayerAIHistory>; // the hisory of the context
}
