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

export async function popUpModal(modalComponent: ReactElement, title: string) {
    const dialog = document.createElement(
        'dialog'
    ) as ExtendedHTMLDialogElement;
    ReactDOM.render(modalComponent, dialog);
    document.body.appendChild(dialog);
    await dialog.uxpShowModal({
        title: title,
        resize: 'both',
        size: {
            width: 800,
            height: 600,
        },
    });
    dialog.remove();
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
    layerName: string,
    id: string,
    regenerated: boolean
) {
    if (id == '1') {
        return 'regenerated_document.png';
    }

    let newName = layerName;

    if (layerName.includes('(r)')) {
        newName = layerName.split('(r)')[0];
        return `${newName.trim()} (rx1_regenID_${id}).png`;
    }

    // Check if the string has "(regenerated)"
    if (layerName.includes('(rx')) {
        const [lName, regenerationStats] = layerName.split('(rx');
        let regenerationNumber = regenerationStats.split('_')[0];
        // Increment the number by 1 and return the updated string
        const newNumber = parseInt(regenerationNumber, 10) + 1;
        newName = lName + '(r' + 'x' + newNumber + '_regenID_' + id + ')';
        newName = `${lName}(rx${newNumber}_regenID_${id})`;
    } else {
        if (regenerated) {
            // Append "(regenerated)" to the string and return the updated string
            newName =
                layerName.replace('.png', '') + ' (rx1_regenID_' + id + ')';
        }
    }

    if (newName.includes('.png') === false) {
        newName = newName + '.png';
    }

    return newName;
}
