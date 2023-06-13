import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useContextStore } from 'store/contextStore';
import { REGENERATION_ALLOTMENT_MINUTES } from 'bashConstants';

interface ErrorModalProps {
    onClose: () => void;
}

const GenerationErrorsModal: React.FC<ErrorModalProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    let numImagesGeneratedWithinTimeFrame = useContextStore(
        (state) => state.numImagesGeneratedWithinTimeFrame
    );

    useEffect(() => {
        if (modalRef.current) {
            gsap.fromTo(
                modalRef.current,
                { borderColor: '#8980f5' },
                { borderColor: '#e5e7eb', duration: 1 }
            );
        }
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
                <h1 className="text-xl font-semibold text-purple-400 mb-1">
                    "Sorry, but you have errors"
                </h1>
                <p className="text-m font-semibold text-gray-700">- Bashful</p>
            </div>
            <div className="mt-3">
                <div className="text-center">
                    <p className="text-m font-semibold text-gray-700">
                        You have generated {numImagesGeneratedWithinTimeFrame}{' '}
                        images during this session. You are alloted 1 generation
                        every {REGENERATION_ALLOTMENT_MINUTES} minutes.
                    </p>
                </div>
            </div>
            <div className="text-center mt-6">
                <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default GenerationErrorsModal;
