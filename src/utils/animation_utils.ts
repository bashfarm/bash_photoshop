import gsap from 'gsap';

export function getSaveAnimationTimeline(
    someRef: React.MutableRefObject<HTMLDivElement>,
    borderOnly: boolean = true,
    color: string = '#7e4dfb'
) {
    let prevOpacity = someRef.current.style.opacity;
    let prevBackgroundColor = someRef.current.style.backgroundColor;
    let preBorderColor = someRef.current.style.borderColor;
    let prevBorderWidth = someRef.current.style.borderWidth;

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
        });
    } else {
        tl.to(someRef.current, {
            delay: 0,
            opacity: 0.5,
            duration: 1,
            backgroundColor: color,
        });
        // .to(someRef.current, {
        // 	duration: 1,
        // 	opacity: prevOpacity,
        // 	backgroundColor: prevBackgroundColor,
        // })
    }

    tl.paused(true);
    return tl;
}

export function getHeaderAnimationTimeline(
    someRef: React.MutableRefObject<HTMLDivElement>,
    color: string = '#FFFFFF',
    endClassName: string = 'h-14 w-28 text-white text-xl font-bold'
) {
    let tl = gsap
        .timeline()
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

    tl.paused(true);
    return tl;
}
