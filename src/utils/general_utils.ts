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

export function createLayerFileName(
    inputString: string,
    regenerated?: boolean
) {
    let newName = inputString;
    // Check if the string has "(regenerated)"
    if (inputString.includes('(r)')) {
        // split the string into 2 variables by the "(regenerated)"
        const [firstPart, secondPart] = inputString.split('(r)');
        // Check if the second part has "x" and split the string into 2 variables by the "x" if so
        if (secondPart.includes('x')) {
            const [secondPartFirstPart, secondPartSecondPart] =
                secondPart.split('x');
            // Increment the number by 1 and return the updated string
            const newNumber = parseInt(secondPartSecondPart, 10) + 1;
            newName = firstPart + '(r' + 'x' + newNumber + ')';
        } else {
            // Append "x2" to the string and return the updated string
            newName = firstPart + '(r' + secondPart.replace('.png', '') + 'x2)';
        }
    } else {
        if (regenerated) {
            // Append "(regenerated)" to the string and return the updated string
            newName = inputString.replace('.png', '') + ' (r)';
        }
    }
    if (newName.includes('.png') === false) {
        newName = newName + '.png';
    }

    return newName;
}
