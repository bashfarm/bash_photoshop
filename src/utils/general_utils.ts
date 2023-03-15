import { ExtendedHTMLDialogElement } from 'common/types/htmlTypes';
import { ReactElement } from 'react';
import ReactDOM from 'react-dom';

export const validLayerNames = [
    'Banana',
    'Kratos',
    'Goku',
    'Geralt',
    'All Might',
    'Midoriya',
    'Vegeta',
    'Botan',
    'Kuwabara',
];

export async function popUpModal(
    ref: React.MutableRefObject<ExtendedHTMLDialogElement>,
    modalComponent: ReactElement,
    title: string
) {
    if (!ref.current) {
        ref.current = document.createElement(
            'dialog'
        ) as ExtendedHTMLDialogElement;
        ReactDOM.render(modalComponent, ref.current);
    }
    document.body.appendChild(ref.current);
    await ref.current.uxpShowModal({
        title: title,
        resize: 'both',
        size: {
            width: 800,
            height: 600,
        },
    });
    ref.current.remove();
    ref.current = null;
}

/**
 * Retrieve a random name from a list that is in this function.
 * @returns String Array
 */
export function randomlyPickLayerName(): string {
    return validLayerNames[Math.floor(Math.random() * validLayerNames.length)];
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

