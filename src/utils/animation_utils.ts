import gsap from 'gsap';

export function performSaveAnimation(
    someRef: React.MutableRefObject<HTMLDivElement>,
    color: string = '#7e4dfb'
) {
    gsap.timeline()
        .to(someRef.current, {
            duration: 0.2,
            repeat: 0,
            ease: 'elastic.out(1, 0.3)',
            autoAlpha: 1,
        })
        .to(someRef.current, {
            duration: 0.2,
            backgroundColor: color,
            ease: 'none',
            delay: 0.5,
        })
        .to(someRef.current, {
            duration: 0.2,
            backgroundColor: 'transparent',
            ease: 'none',
            delay: 0.5,
        });
}

export function performHeaderAnimation(
    someRef: React.MutableRefObject<HTMLDivElement>,
    color: string = '#FFFFFF',
    endClassName: string = 'h-14 w-28 text-white text-xl font-bold'
) {
    gsap.timeline()
        .to(someRef.current, {
            duration: 1,
            backgroundColor: color,
            ease: 'none',
            delay: 1,
        })
        .to(someRef.current, {
            x: '100%',
            duration: 2,
            repeat: 0,
            ease: 'bounce.out',
            onComplete: () => {
                if (endClassName) {
                    someRef.current.className = endClassName;
                }
            },
        })
        .to(someRef.current, {
            duration: 1,
            backgroundColor: 'transparent',
            ease: 'none',
            delay: 1,
        });
}
