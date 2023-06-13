import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import ReactDOM from 'react-dom';
import { alert } from 'services/alert_service';
import ContextErrorsModal from '../components/modals/ContextErrorsModal';
import { countTokens, popUpModal } from 'utils/general_utils';
import APIErrorsModal from 'components/modals/APIErrorsModal';
import { getAvailableModels } from './ai_service';
import { ModelResponse } from 'common/types/sdapi';
import GenerationErrorsModal from 'components/modals/GenerationErrorsModal';

const MIN_PROMPT_TOKEN_COUNT = 8;
const INSTRUCTION_KEYWORDS = [
    'do ',
    'perform ',
    'execute ',
    'follow ',
    'create ',
    'make ',
    'enhance ',
    'replace ',
    'change ',
    'generate ',
];

export interface APIErrorMessage {
    name: string;
    description: string;
}

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
    if (
        !(context.id == '1') &&
        (context.currentLayer === null || context.currentLayer === undefined)
    ) {
        errors.push(
            'The current layer selection is empty. Please select a layer and try again.'
        );
    }

    if (
        context.is_cloud_run === true &&
        (context.model_config === null ||
            context.model_config === undefined ||
            context.model_config === '')
    ) {
        errors.push(
            `The Art Type is not selected. Please select an Art Type and try again.`
        );
    }

    if (
        context.is_cloud_run === false &&
        (context.generationModelName === null ||
            context.generationModelName === undefined ||
            context.generationModelName === '')
    ) {
        errors.push(
            `The Model is not selected. Please select an Model and try again.`
        );
    }

    if (countTokens(context.currentPrompt) < MIN_PROMPT_TOKEN_COUNT) {
        errors.push(
            `The DESCRIPTION of the image/illustration is too short. Please enter a more detailed description and try again. You must have at least 8 words.`
        );
    }

    if (detectInstruction(context.currentPrompt)) {
        errors.push(
            `It's been detected you are instructing the AI to do something. Please DESCRIBE the image/illustration instead. For example, instead of saying "make the sky blue", say "the sky is blue".`
        );
    }

    return errors;
}

export async function getAPIErrors(): Promise<APIErrorMessage[]> {
    let errors = [];
    try {
        // Check if the user is online
        if (!navigator.onLine) {
            errors.push({
                name: 'No internet Access',
                description:
                    'You will need to find a way to connect to the internet or spin up the Auto1111 api',
            });
            // Make the API call
            const response: ModelResponse[] = await getAvailableModels();

            // Check the response status
            if (response.length == 0) {
                errors.push({
                    name: 'No Auto1111 API detected',
                    description:
                        'Please install the Auto1111 API for local usage https://www.youtube.com/watch?v=1BNaxL3Zm7U&t=210s&ab_channel=bad_ai_engineer.',
                });
            }
        }
    } catch (error) {
        // Handle the error
        errors.push({
            name: 'Unknown error',
            description: `Error: ${error.message}`,
        });
    }

    return errors;
}

export async function generationErrorMessage() {
    const dialog = document.createElement(
        'dialog'
    ) as ExtendedHTMLDialogElement;
    ReactDOM.render(
        <GenerationErrorsModal
            onClose={function (): void {
                dialog.close();
            }}
        />,
        dialog
    );
    document.body.appendChild(dialog);
    await dialog.uxpShowModal({
        title: 'Generation Errors',
        resize: 'both',
        size: {
            width: 800,
            height: 800,
        },
    });
}

export async function contextErrorMessage(
    contextsValidation: ContextValidation
) {
    const dialog = document.createElement(
        'dialog'
    ) as ExtendedHTMLDialogElement;
    ReactDOM.render(
        <ContextErrorsModal
            contextValidation={contextsValidation}
            onClose={function (): void {
                dialog.close();
            }}
        />,
        dialog
    );
    document.body.appendChild(dialog);
    await dialog.uxpShowModal({
        title: 'Context Errors',
        resize: 'both',
        size: {
            width: 800,
            height: 800,
        },
    });
}

export async function popUpAPIErrors(errors: APIErrorMessage[]) {
    const dialog = document.createElement(
        'dialog'
    ) as ExtendedHTMLDialogElement;
    ReactDOM.render(
        <APIErrorsModal
            errors={errors}
            onClose={function (): void {
                dialog.close();
            }}
        />,
        dialog
    );
    document.body.appendChild(dialog);
    await dialog.uxpShowModal({
        title: 'API Errors',
        resize: 'both',
        size: {
            width: 800,
            height: 800,
        },
    });
}

function detectInstruction(inputString: string) {
    const lowerCaseString = inputString.toLowerCase();

    for (const keyword of INSTRUCTION_KEYWORDS) {
        if (lowerCaseString.includes(keyword)) {
            return true;
        }
    }

    return false;
}
