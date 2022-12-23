import { ProgressResponse } from 'common/types/sdapi';
import LayerAIContext from 'models/LayerAIContext';
import React, { useEffect } from 'react';
import { useState, useRef } from 'react';
import Spectrum, { Button, Progressbar } from 'react-uxp-spectrum';
import {
    generateAILayer,
    getImageProcessingProgress,
} from 'services/ai_service';
import {
    deleteLayer,
    moveLayer,
    scaleAndFitLayerToCanvas,
    scaleLayerToCanvas,
} from 'services/layer_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ProgressButton } from './ProgressButton';
import photoshop from 'photoshop';
import { BlenderIcon } from 'components/Icons';

export type RegenerationColumnProps = {
    contextID: string;
};

/**
 * The component for the ride hand side of the context item UI.  This is responsible for styling and etc.  This might bneed to be revamped.
 * @param {*}
 * @returns
 */
export const RegenerationColumn = (props: RegenerationColumnProps) => {
    return (
        <>
            <div className="flex flex-col justify-between"></div>
        </>
    );
};
