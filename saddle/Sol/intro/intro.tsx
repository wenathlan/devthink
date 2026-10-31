// the saddle intro of the theme.
/**
 * intro.tsx — the opening splash of the APPLICATION: the akash floor. The
 * drawn mark lands with the Akash spring (the overshoot curve
 * cubic-bezier(.34,1.56,.64,1)), the name rises with the backOut lift and
 * the honest role line fades in under the 1.6s hold. The exit slides the
 * whole stage up over 0.8s (cubic-bezier(0.76,0,0.24,1)) and hands the
 * surface DIRECTLY to the onboarding at /onboarding — the intro itself
 * advances the flow. No loading dots, no spinner: the mark speaks. A click,
 * any key or prefers-reduced-motion skips. The seen flags ride the one
 * accessor (onboardingstate.ts — the database, the offline cache, the
 * memory): while the state resolves the page renders null, a finished flow
 * replaces straight back to the home (the close-caption relaunch lands
 * there, the intro never replays) and a mid-flow visitor resumes at
 * /onboarding.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
        loadOnboardingState,
        markIntroSeen,
        readOnboardingState,
        type VisitorOnboarding,
} from '../../onboardingstate.ts';
import { label } from '../../labels.ts';
import { SaddleMark } from '../shell/Shell.tsx';

/** how long the brand holds before the exit (ms) — the doctrine asks ~1.6s */
const HOLD_MS = 1600;
/** how long the slide-up exit runs before the hand-over (ms) */
const LEAVE_MS = 800;

/** the lifecycle of the opening act: pending (the state read resolves) →
 * playing (the akash floor) → leaving (the slide-up runs). */
type SplashPhase = 'pending' | 'playing' | 'leaving';

/**
 * The intro page: the brand lands, holds ~1.6s, slides up and hands the
 * surface to the onboarding. Click, any key or reduced motion skips.
 *
 * @returns the intro element (null while the seen state resolves).
 */
export default function Intro() {
        const [, navigate] = useLocation();
        const [phase, setPhase] = useState<SplashPhase>('pending');
        const seenRef = useRef<VisitorOnboarding>({ introseen: false, onboardingseen: false });
        const leftRef = useRef(false);

        /** the hand-over route: the onboarding, unless the flow already finished. */
        const handover = useCallback(
                (): string => (seenRef.current.onboardingseen ? '/' : '/onboarding'),
                [],
        );

        /** the leave: the intro counts as seen (leaving counts — the visitor
         * answered the stage), the stage slides, the hand-over follows. One
         * guarded run — the skip listeners and the hold timer share it. */
        const leave = useCallback(() => {
                if (leftRef.current) return;
                leftRef.current = true;
                markIntroSeen();
                setPhase('leaving');
                window.setTimeout(() => navigate(handover()), LEAVE_MS);
        }, [handover, navigate]);

        useEffect(() => {
                let live = true;
                const known = readOnboardingState();
                if (known) seenRef.current = known;
                loadOnboardingState().then((state) => {
                        if (!live) return;
                        seenRef.current = state;
                        // the flow law: a finished visitor never replays the opening (the
                        // close-caption relaunch lands home); a mid-flow one resumes ahead
                        if (state.onboardingseen) navigate('/', { replace: true });
                        else if (state.introseen) navigate('/onboarding', { replace: true });
                        else setPhase('playing');
                });
                return () => {
                        live = false;
                };
        }, [navigate]);

        useEffect(() => {
                if (phase !== 'playing') return;
                // reduced motion skips the choreography and hands over at once
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        if (!leftRef.current) {
                                leftRef.current = true;
                                markIntroSeen();
                                navigate(handover());
                        }
                        return;
                }
                const hold = window.setTimeout(leave, HOLD_MS);
                const skip = (event: KeyboardEvent | MouseEvent): void => {
                        if (event.type === 'keydown' || (event as MouseEvent).button === 0) leave();
                };
                window.addEventListener('keydown', skip);
                window.addEventListener('pointerdown', skip);
                return () => {
                        window.clearTimeout(hold);
                        window.removeEventListener('keydown', skip);
                        window.removeEventListener('pointerdown', skip);
                };
        }, [handover, leave, navigate, phase]);

        // the state read holds the page: nothing renders, the canvas alone shows — no flash
        if (phase === 'pending') return null;

        return (
                <div
                        className="winintro"
                        data-leaving={phase === 'leaving' ? 'true' : undefined}
                        role="status"
                        aria-label={label('intro.status')}
                >
                        <div className="winintro__stage">
                                <span className="winintro__mark" aria-hidden="true">
                                        <SaddleMark size={96} />
                                </span>
                                <h1 className="winintro__name">{label('intro.name')}</h1>
                                <p className="winintro__role">{label('intro.role')}</p>
                        </div>
                        <p className="winintro__skip" aria-hidden="true">
                                {label('intro.skip')}
                        </p>
                </div>
        );
}
