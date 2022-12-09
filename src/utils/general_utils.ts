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

/**
 * Retrieve a random name from a list that is in this function.
 * @returns String Array
 */
export function randomlyPickLayerName(): string {
    return validLayerNames[Math.floor(Math.random() * validLayerNames.length)];
}
