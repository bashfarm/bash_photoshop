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
	console.dir(ref.current.uxpShow)
	console.dir(ref.current.uxpShowModal)
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

export async function popUp(
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
	console.log("ref.current", ref.current)
    document.body.appendChild(ref.current);
	console.log(ref.current)
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

// const popUpModal = async (popupRef: any) => {
//     if (!popupRef.current) {
// 		popupRef.current = document.createElement("dialog");
//       ReactDOM.render(<popUpComponent dialog={popupRef.current} />, popupRef.current);
//     }
//     document.body.appendChild(popupRef.current);

//     const response = await popupRef.current.uxpShowModal({
//       title: "Please authenticate...",
//       resize: "both",
//       size: {
//         width: 400,
//         height: 200
//       }
//     });
//     authPopup.current.remove();
//     console.log("RESPONZE", response);
//     // God, why have I to do that
//     if (!response ||
//       response === "reasonCanceled" ||
//       response.reason === "reasonCanceled") {
//       console.log("nope");
//       return;
//     }

//     if (response.reason === "OK") {
//       console.log("response.credentials", response.credentials)
//       // https://stackoverflow.com/a/58877875/1625148
//       setCredentials(response.credentials);
//     }

//   }

export function logCallingFunction(func: Function) {
    console.log(func);
}
