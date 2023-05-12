import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { APIErrorMessage } from 'services/validation_service';

interface APIErrors {
    errors: APIErrorMessage[];
    onClose: () => void;
}

function APIErrorsModal(props: APIErrors) {
    const modalRef = useRef<HTMLDivElement>(null);
    const headersRef = useRef<HTMLHeadingElement[]>([]);

    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        //   tl.to(modalRef.current, { backgroundColor: '#d6c9f9', duration: 1 });
        //   tl.to(modalRef.current, { backgroundColor: '#ffffff', duration: 1 });
        tl.to(headersRef.current, { y: -10, duration: 0.5, stagger: 0.1 });
        tl.to(headersRef.current, { y: 0, duration: 0.5, stagger: 0.1 });
    }, []);

    return (
        <div
            className="bg-white p-6 rounded shadow-md w-full max-w-2xl mx-auto mt-10 relative overflow-y-auto"
            style={{ maxHeight: '80vh' }}
        >
            <div
                className="w-full p-40 bg-cover bg-center"
                style={{
                    backgroundImage:
                        'url(https://res.cloudinary.com/dxqgoyv5b/image/upload/v1681153654/bashful.ai/images/Characters/original/Bashful/bashful_error_message_zn80qp.png)',
                }}
            >
                <a
                    href="https://www.bashful.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src="https://res.cloudinary.com/dxqgoyv5b/image/upload/v1678375281/bashful.ai/images/Branding/Logo/Untitled_design_62_gejda7.png"
                        alt="Logo"
                        className="w-32 absolute top-4 right-4 mt-8"
                    />
                </a>
            </div>
            <div className="text-center mt-6">
                <h1
                    ref={(el) =>
                        headersRef.current.push(el as HTMLHeadingElement)
                    }
                    className="text-xl font-semibold text-purple-400 mb-1"
                >
                    "You have network connectivity errors"
                </h1>
                <p className="text-m font-semibold text-gray-700">- Bashful</p>
            </div>
            <div className="mt-3">
                {props.errors?.map(
                    (errorMessage: APIErrorMessage, index: number) => {
                        return (
                            <div key={errorMessage.name} className="mb-4">
                                <h2
                                    ref={(el) =>
                                        headersRef.current.push(
                                            el as HTMLHeadingElement
                                        )
                                    }
                                    className="text-lg font-semibold text-purple-400 mb-1 border-b border-purple-400 mx-1 self-stretch my-2"
                                >
                                    {'Error: '}
                                    <span className="text-lg font-semibold text-purple-700 mb-2 inline-block">
                                        {errorMessage.name}
                                    </span>
                                </h2>

                                <ul className="list-disc pl-5">
                                    <li className="text-gray-700 mb-1 italic hover:not-italic">
                                        {errorMessage.description}
                                    </li>
                                </ul>
                            </div>
                        );
                    }
                )}
            </div>
            <div className="text-center mt-6">
                <button
                    onClick={props.onClose}
                    className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default APIErrorsModal;
