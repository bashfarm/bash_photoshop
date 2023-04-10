import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import ReactDOM from 'react-dom';
import { alert } from 'services/alert_service';
import ContextErrorsModal from '../components/modals/ContextErrorsModal';

interface contextErrors {
    [key: string]: string[];
}

interface ContextValidation {
    isValid: boolean;
    contextErrors: contextErrors;
}

export function validateContext(context: LayerAIContext): ContextValidation {
    let isValid = true;
    let errors = getContextErrors(context);
    let contextErrors: contextErrors = {};

    if (errors.length > 0) {
        isValid = false;
        contextErrors[context.id] = errors;
    }

    return { isValid, contextErrors } as ContextValidation;
}

export function validateContexts(contexts: LayerAIContext[]) {
    let isValid = true;
    let contextErrors: contextErrors = {};
    for (let context of contexts) {
        let errors = getContextErrors(context);
        if (errors.length > 0) {
            isValid = false;
            contextErrors[context.id] = errors;
        }
    }
    return { isValid, contextErrors } as ContextValidation;
}

export function getContextErrors(context: LayerAIContext): string[] {
    const errors: string[] = [];
    if (context.currentLayer === null || context.currentLayer === undefined) {
        errors.push(
            'The current layer selection is empty. Please select a layer and try again.'
        );
    }

    if (
        context.model_config === null ||
        context.model_config === undefined ||
        context.model_config === ''
    ) {
        let labelName = context.is_cloud_run ? 'Art Type' : 'Model';

        errors.push(
            `The ${labelName} is not selected. Please select an ${labelName} and try again.`
        );
    }

    return errors;
}

export async function errorMessage(
    ref: React.MutableRefObject<ExtendedHTMLDialogElement>,
    contextsValidation: ContextValidation
) {
    if (!ref.current) {
        ref.current = document.createElement(
            'dialog'
        ) as ExtendedHTMLDialogElement;
        ReactDOM.render(
            <ContextErrorsModal
                contextValidation={contextsValidation}
                onClose={function (): void {
                    ref.current.close();
                }}
            />,
            ref.current
        );
    }
    document.body.appendChild(ref.current);
    await ref.current.uxpShowModal({
        title: 'Context Errors',
        resize: 'both',
        size: {
            width: 800,
            height: 800,
        },
    });
    ref.current.remove();
    ref.current = null;
}
