import gsap from 'gsap';

export function getSaveAnimationTimeline(
    someRef: React.MutableRefObject<HTMLDivElement>,
    borderOnly: boolean = true,
    color: string = '#7e4dfb'
) {
    let tl = gsap.timeline({
        defaults: { duration: 0.2, delay: 0.1, repeat: 1, yoyo: true },
    });

    if (borderOnly) {
        tl.to(someRef.current, {
            delay: 0,
            opacity: 0.5,
            duration: 1,
            borderColor: color,
            borderWidth: '2px',
            color: color,
        });
    } else {
        tl.to(someRef.current, {
            delay: 0,
            opacity: 0.5,
            duration: 1,
            backgroundColor: color,
        });
    }

    tl.paused(true);
    return tl;
}

export function performHeaderAnimationTimeline(
    someRef: React.MutableRefObject<HTMLDivElement>,
    color: string = '#FFFFFF'
) {
    gsap.context(() => {
        gsap.timeline()
            .to('span', {
                y: 8,
                stagger: 0.1,
                delay: 1,
                duration: 0.1,
                color: '#FFFFFF',
            })
            .to('.bash', {
                y: -3,
                color: '#7e4dfb',
                stagger: 0.1,
                delay: 1,
                duration: 0.1,
            });
    }, someRef);
}
