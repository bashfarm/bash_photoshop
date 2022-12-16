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
