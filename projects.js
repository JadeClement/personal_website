// Work Experiences stacked-card scrollytelling.
// Implements the "sticky stage + tall scroll container + step-based transitions" behavior.
document.addEventListener("DOMContentLoaded", () => {
    const scrolly = document.querySelector("#work-scrolly");
    if (!scrolly) return;

    // Static list: expand all cards and position timeline dots/dates once.
    scrolly.classList.add("work-scrolly--static-list");
    const staticSticky = scrolly.querySelector(".work-scrolly__sticky");
    const staticStage = scrolly.querySelector(".work-scrolly__stage");
    const staticTimelineLeft = scrolly.querySelector(
        ".work-scrolly__timeline-left"
    );
    const staticCards = Array.from(
        scrolly.querySelectorAll(".work-scrolly__card[data-work-card]")
    );
    const staticTimelineItems = Array.from(
        scrolly.querySelectorAll(".work-timeline-item[data-work-timeline]")
    );

    if (
        staticSticky &&
        staticStage &&
        staticTimelineLeft &&
        staticCards.length > 0 &&
        staticTimelineItems.length === staticCards.length
    ) {
        const applyOnce = () => {
            const timelineRect = staticTimelineLeft.getBoundingClientRect();

            staticCards.forEach((card, i) => {
                const body = card.querySelector(".work-scrolly__body");
                const meta = card.querySelector(".work-scrolly__meta");

                // Ensure expanded and visible (CSS does most of it; this is belt+suspenders).
                card.style.opacity = "1";
                card.style.transform = "none";
                card.style.maxHeight = "none";

                if (body) {
                    body.style.maxHeight = "none";
                    body.style.opacity = "1";
                }
                if (meta) {
                    meta.style.maxHeight = "none";
                    meta.style.opacity = "1";
                }

                const timelineItem = staticTimelineItems[i];
                if (timelineItem) {
                    const cardRect = card.getBoundingClientRect();
                    const centerY = cardRect.top - timelineRect.top + cardRect.height / 2;
                    const itemRect = timelineItem.getBoundingClientRect();
                    timelineItem.style.opacity = "1";
                    // With JS-driven positioning, align the timeline item's center
                    // to the card's center.
                    timelineItem.style.top = `${centerY - itemRect.height / 2}px`;
                    timelineItem.style.transform = "none";
                }
            });

            // Make sure the timeline line spans the full list height.
            staticTimelineLeft.style.setProperty("--rail-bottom", "0px");
        };

        requestAnimationFrame(applyOnce);
        return; // stop the rest of the animation logic
    }

    // Static mode: no scroll-driven animation. All cards remain expanded,
    // and timeline dots/dates are positioned to match each card.
    const STATIC_MODE = true;

    const sticky = scrolly.querySelector(".work-scrolly__sticky");
    const stage = scrolly.querySelector(".work-scrolly__stage");
    const timelineLeft = scrolly.querySelector(".work-scrolly__timeline-left");
    const cards = Array.from(scrolly.querySelectorAll(".work-scrolly__card[data-work-card]"));
    const timelineItems = Array.from(scrolly.querySelectorAll(".work-timeline-item[data-work-timeline]"));
    if (!sticky || !stage || cards.length === 0) return;

    const ANIMATION_MIN_WIDTH_PX = 1000;
    const shouldAnimate = window.matchMedia?.("(min-width: 1000px)")?.matches ?? window.innerWidth >= ANIMATION_MIN_WIDTH_PX;

    if (!shouldAnimate) {
        // Static layout (<1000px):
        // Ensure timeline date/dots are visually aligned to each card block.
        // CSS handles the overall static layout; this step only fixes alignment.
        const staticAlign = () => {
            const cardsWrap = scrolly.querySelector(".work-scrolly__cards");
            if (!cardsWrap) return;

            // Reset any inline overrides from previous resizes.
            timelineItems.forEach((item) => {
                item.style.position = "";
                item.style.left = "";
                item.style.right = "";
                item.style.top = "";
                item.style.transform = "";
                item.style.opacity = "1";
            });

            const timelineLeftRect = timelineLeft.getBoundingClientRect();
            const cardsWrapRect = cardsWrap.getBoundingClientRect();

            // Make the rail line reach the bottom of the full card stack.
            timelineLeft.style.height = `${cardsWrapRect.height}px`;

            // Compute translateY deltas without mutating between measurements.
            const deltas = cards.map((card, i) => {
                const timelineItem = timelineItems[i];
                if (!timelineItem) return 0;

                const cardRect = card.getBoundingClientRect();
                const itemRect = timelineItem.getBoundingClientRect();

                const cardCenterY = cardRect.top - timelineLeftRect.top + cardRect.height / 2;
                const itemCenterY = itemRect.top - timelineLeftRect.top + itemRect.height / 2;
                return cardCenterY - itemCenterY;
            });

            timelineItems.forEach((timelineItem, i) => {
                if (!timelineItem) return;
                const deltaY = deltas[i];
                if (!Number.isFinite(deltaY)) return;
                timelineItem.style.transform = `translateY(${deltaY}px)`;
                timelineItem.style.opacity = "1";
            });
        };

        requestAnimationFrame(staticAlign);
        window.addEventListener("resize", staticAlign, { passive: true });
        return;
    }

    const timelineByIndex = new Map(
        timelineItems
            .map((el) => {
                const idx = parseInt(el.getAttribute("data-work-timeline") || "", 10);
                return Number.isFinite(idx) ? [idx, el] : null;
            })
            .filter(Boolean)
    );

    const CENTER_OFFSET_PX = 300;
    // Controls how much physical scroll distance is consumed per card step.
    // Lowering this makes both the forward and reverse passes feel faster.
    // Keep a reasonable step size for forward entry timing so cards
    // only appear progressively (not all at once).
    const STEP_PX = 420;
    const CARD_COUNT = cards.length;
    const TOP_PADDING = 0;
    const COLLAPSED_GAP = 16; // spacing between collapsed cards
    const BELOW_OFFSET_PX = 100;
    const STACK_SHIFT_PER_CARD_PX = 20;
    // Downward visibility shift so cards 1+ don't end up too high.
    // Card 0 is handled separately to align to the top timeline position.
    const VISIBILITY_SHIFT_PX = 220;
    // Active card: collapse only over the last this many px of vertical travel
    // (CENTER_OFFSET_PX is total y travel per step). Using a %-of-step like
    // collapseStartWithin=0.97 only leaves ~3% of STEP_PX scroll (~12px) for
    // collapse — one wheel tick skips it, so the card looks "instantly" shrunk.
    const COLLAPSE_LAST_PX = 72;
    // Timeline circles vertical spacing (when aligned to card centers).
    const TIMELINE_DOT_SPACING_PX = 40;
    // Stagger where subsequent cards start coming into view.
    // Card 1 starts at BELOW_OFFSET_PX, card 2 at BELOW_OFFSET_PX + 50px, etc.
    const STAGGER_INCREMENT_PX = 50;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // Ensure the sticky parent has explicit scroll distance.
    // This drives the scrollytelling progress via window scrolling.
    scrolly.style.height = `calc(100vh + ${CARD_COUNT} * ${STEP_PX}px)`;
    scrolly.style.overflow = "visible";

    // Small slack to avoid clipping due to sub-pixel rounding/wrapping changes.
    // Small slack to avoid clipping due to sub-pixel rounding/wrapping changes.
    // Reducing this makes collapsed cards vertically smaller.
    const HEIGHT_SLACK_PX = 12;

    // Measured values (set during init, after fonts are ready).
    let headerHeights = [];
    let titleHeights = [];
    let metaHeights = [];
    let expandedBodyHeights = [];
    let pinnedCenters = [];
    let lastClampedScroll = 0;
    let lastScrollY = window.scrollY;
    let reachedEnd = false;
    let smoothClampedScroll = 0;
    let hasSmoothClampedScroll = false;
    let displayRaw = 0;
    let hasDisplayRaw = false;

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function computePastShift(stageHeight, iPast) {
        const pinnedCenter = pinnedCenters[iPast] ?? 0;
        const stageCenter = stageHeight / 2;
        // Card 0 aligns to the top timeline; cards 1+ get a downward
        // visibility shift so they don't end up too far above.
        const visibility = iPast === 0 ? 0 : VISIBILITY_SHIFT_PX;
        return pinnedCenter - stageCenter + visibility;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function staggeredBelowOffset(i) {
        // Only the 2nd+ experiences should start lower than the first.
        // Index 0 (first experience) stays centered; index 1 starts at BELOW_OFFSET_PX.
        if (i <= 0) return 0;
        return BELOW_OFFSET_PX + (i - 1) * STAGGER_INCREMENT_PX;
    }

    function setInitial() {
        // Active card centered.
        cards.forEach((card, i) => {
            const body = card.querySelector(".work-scrolly__body");
            const meta = card.querySelector(".work-scrolly__meta");

            card.style.setProperty("--y", `${staggeredBelowOffset(i)}px`);
            card.style.opacity = i === 0 ? "1" : "0";
            const titleH = titleHeights[i] || 0;
            card.style.maxHeight = i === 0
                ? `${titleH + metaHeights[i] + expandedBodyHeights[i] + HEIGHT_SLACK_PX}px`
                : `${titleH + HEIGHT_SLACK_PX}px`;

            if (body) {
                const maxH = expandedBodyHeights[i] || 0;
                body.style.maxHeight = i === 0 ? `${maxH + HEIGHT_SLACK_PX}px` : "0px";
                body.style.opacity = i === 0 ? "1" : "0";
            }

            if (meta) {
                const mh = metaHeights[i] || 0;
                meta.style.maxHeight = i === 0 ? `${mh + HEIGHT_SLACK_PX}px` : "0px";
                meta.style.opacity = i === 0 ? "1" : "0";
            }
        });

        timelineByIndex.forEach((item, idx) => {
            item.style.setProperty("--y", `${staggeredBelowOffset(idx)}px`);
            item.style.opacity = idx === 0 ? "1" : "0";
        });
    }

    function update() {
        const outerTopY = scrolly.getBoundingClientRect().top + window.scrollY;
        const scrolledPx = window.scrollY - outerTopY;

        const maxScroll = CARD_COUNT * STEP_PX;
        const clampedScroll = clamp(scrolledPx, 0, maxScroll);

        // Use window.scrollY deltas to detect scroll direction reliably.
        // Using clampedScroll can jitter because the sticky stage affects
        // boundingClientRect measurements.
        const deltaY = window.scrollY - lastScrollY;
        const scrollingUp = deltaY < -0.1;
        if (clampedScroll >= maxScroll - 1) reachedEnd = true;

        const collapseLocked = reachedEnd && scrollingUp;

        // Smooth only the downward progression so `active` doesn't skip
        // multiple indices in a single frame (which makes cards appear to
        // "come in together"). Reverse/up should remain responsive.
        if (!hasSmoothClampedScroll) {
            smoothClampedScroll = clampedScroll;
            hasSmoothClampedScroll = true;
            } else if (!scrollingUp) {
            // Lower smoothing factor = less "skipping" multiple steps at once.
            const DOWN_SMOOTHING = 0.03;
            smoothClampedScroll = smoothClampedScroll + (clampedScroll - smoothClampedScroll) * DOWN_SMOOTHING;
        } else {
            smoothClampedScroll = clampedScroll;
        }

        let effectiveClampedScroll = scrollingUp ? clampedScroll : smoothClampedScroll;
        if (scrollingUp) {
            // Speed up reverse by scaling how far we are from the bottom.
            // This makes higher projects appear sooner when scrolling upward.
            const UP_SPEED_MULTIPLIER = 3.0;
            const distanceFromEnd = maxScroll - clampedScroll; // 0..maxScroll
            const effectiveDistance = distanceFromEnd * UP_SPEED_MULTIPLIER;
            effectiveClampedScroll = maxScroll - effectiveDistance;
            effectiveClampedScroll = clamp(effectiveClampedScroll, 0, maxScroll);
        }

        const rawTarget = effectiveClampedScroll / STEP_PX; // 0..CARD_COUNT
        let raw = rawTarget;

        // Downward: cap how fast raw can advance per frame to avoid
        // multiple cards flipping into "past/active" in a single update.
        if (!scrollingUp) {
            if (!hasDisplayRaw) {
                displayRaw = rawTarget;
                hasDisplayRaw = true;
            } else {
                // Stricter cap: reduce chance that we skip over the active window
                // and immediately turn a card into a "past/collapsed" card.
                // Keep active/within from jumping too far forward in one frame.
                const MAX_RAW_DELTA_DOWN = 0.15; // at most ~0.15 card-step per frame
                const delta = rawTarget - displayRaw;
                displayRaw = displayRaw + clamp(delta, -MAX_RAW_DELTA_DOWN, MAX_RAW_DELTA_DOWN);
            }
            raw = displayRaw;
        } else {
            // Upward: keep immediate response (reverse mapping / end-lock).
            displayRaw = rawTarget;
            raw = rawTarget;
        }

        raw = clamp(raw, 0, CARD_COUNT);

        let active = Math.floor(raw);
        active = clamp(active, 0, CARD_COUNT - 1);
        // Recompute within after clamping active so last card can finish.
        let within = raw - active; // 0..1 in each step (last card included)
        const progressPastFirst = clamp(raw, 0, CARD_COUNT - 1);
        // Start drifting once the second card begins entering (raw > 0).
        // Negative value shifts the whole stack upward in the viewport.
        const stackDriftY = -progressPastFirst * STACK_SHIFT_PER_CARD_PX;

        // For the last card, we still let `within` progress so it can
        // settle from the 300px-offset "arrival" position to its final.

        const stageHeight = stage.getBoundingClientRect().height || window.innerHeight;
        // Use timeline-left height so pinned positions are relative to
        // the element that hosts the date dots.
        const timelineHeight =
            (timelineLeft?.getBoundingClientRect().height || stageHeight) || window.innerHeight;

        // Crop the timeline rail to end 300px below the final collapsed last card (center position).
        if (timelineLeft && pinnedCenters.length === CARD_COUNT && headerHeights.length === CARD_COUNT) {
            const lastIndex = CARD_COUNT - 1;
            const finalStackDriftY = -(CARD_COUNT - 1) * STACK_SHIFT_PER_CARD_PX;
            const lastFinalCenterY = (pinnedCenters[lastIndex] || 0) + finalStackDriftY;
            const railVisibility = lastIndex === 0 ? 0 : VISIBILITY_SHIFT_PX;
            const railEndY = lastFinalCenterY + CENTER_OFFSET_PX + railVisibility;
            const railBottom = clamp(stageHeight - railEndY, 0, stageHeight);
            timelineLeft.style.setProperty("--rail-bottom", `${railBottom}px`);
        }

        cards.forEach((card, i) => {
            const body = card.querySelector(".work-scrolly__body");
            const timeline = timelineByIndex.get(i);
            const meta = card.querySelector(".work-scrolly__meta");

            // Keep "collapse" (max-height) from starting until the card finishes
            // sliding into its final pinned position.
            const CARD_TRANSFORM_MS = 450;
            let collapseDelayMs = 0;

            // Keep the very first card pinned to the top timeline position
            // (avoid the global stack drift moving it upward while it shrinks).
            const driftForCard = i === 0 ? 0 : stackDriftY;
            const driftForCardEnd = i === 0 ? 0 : (-(CARD_COUNT - 1) * STACK_SHIFT_PER_CARD_PX);

            let opacity = 0;
            let yShift = BELOW_OFFSET_PX;
            let bodyMax = 0;
            let metaMax = 0;
            let metaOpacity = 0;

            if (collapseLocked) {
                // On scroll-up after reaching the bottom, freeze the end-state:
                // show all cards in their final collapsed/pinned positions.
                opacity = 1;
                // Drift should also be pinned to the end-state (otherwise cards "walk" as you scroll).
                yShift = computePastShift(timelineHeight, i) + driftForCardEnd;
                bodyMax = 0;
                metaMax = 0;
                metaOpacity = 0;
                collapseDelayMs = CARD_TRANSFORM_MS;
            } else if (i < active) {
                // Past cards: collapsed and pinned to the top stack.
                opacity = 1;
                yShift = computePastShift(timelineHeight, i) + driftForCard;
                bodyMax = 0;
                metaMax = 0;
                metaOpacity = 0;
                collapseDelayMs = CARD_TRANSFORM_MS;
            } else if (i === active) {
                opacity = 1;
                const targetShift = computePastShift(timelineHeight, i);

                // Active: slide upward into final position while staying
                // expanded, then collapse proportionally to how close it is to
                // its final position.
                yShift = lerp(
                    targetShift + CENTER_OFFSET_PX,
                    targetShift,
                    within
                ) + driftForCard;
                const distRemainingY = CENTER_OFFSET_PX * (1 - within);
                // Start collapsing only when very close to final.
                const COLLAPSE_DISTANCE_PX = 70;
                let collapseAmount = 0;
                if (distRemainingY <= COLLAPSE_DISTANCE_PX) {
                    const t = clamp(
                        1 - distRemainingY / COLLAPSE_DISTANCE_PX,
                        0,
                        1
                    );
                    // Ease so it stays open until near the end, then snaps.
                    collapseAmount = Math.pow(t, 2.6);
                }
                bodyMax = lerp(expandedBodyHeights[i] || 0, 0, collapseAmount);
                metaMax = lerp(metaHeights[i] || 0, 0, collapseAmount);
                metaOpacity = lerp(1, 0, collapseAmount);
                collapseDelayMs = 0;
            } else if (i === active + 1) {
                // Next rises from below into the center.
                // Make it quickly fully visible as it rises.
                opacity = clamp(within / 0.2, 0, 1);
                const targetShift = computePastShift(timelineHeight, i);
                const centerY = targetShift + CENTER_OFFSET_PX + driftForCard;
                // Force the entry start to be below the center so it moves upward.
                const entryBelowExtraPx = 160;
                const startY = Math.max(
                    staggeredBelowOffset(i) + driftForCard,
                    centerY + entryBelowExtraPx
                );

                yShift = lerp(startY, centerY, within);

                // Entering card starts fully expanded.
                bodyMax = expandedBodyHeights[i] || 0;
                metaMax = metaHeights[i] || 0;
                metaOpacity = 1;
                collapseDelayMs = 0;
            } else {
                // Future cards remain hidden below.
                opacity = 0;
                yShift = staggeredBelowOffset(i) + driftForCard;
                bodyMax = 0;
                metaMax = 0;
                metaOpacity = 0;
                collapseDelayMs = 0;
            }

            card.style.opacity = String(opacity);
            card.style.setProperty("--y", `${yShift}px`);

            const titleH = titleHeights[i] || 0;
            const hasAnyContent = (bodyMax || 0) > 0.01 || (metaMax || 0) > 0.01;
            const cardMax =
                titleH +
                (metaMax || 0) +
                (bodyMax || 0) +
                (hasAnyContent ? HEIGHT_SLACK_PX : 0);
            card.style.maxHeight = `${cardMax}px`;
            // Delay the outer card box shrink until after the transform finishes.
            // Otherwise the visible "box" height collapses before it lands.
            card.style.transitionDelay = `${collapseDelayMs}ms`;

            if (body) {
                const bodySlack = bodyMax > 0 ? HEIGHT_SLACK_PX : 0;
                // Delay collapse timing only when needed; most of the
                // time we rely on distance-to-final-position for collapse.
                body.style.transitionDelay = `${collapseDelayMs}ms`;
                body.style.maxHeight = `${bodyMax + bodySlack}px`;
                // Use bodyMax to decide visibility so collapsed/past states
                // don't briefly show expanded text.
                body.style.opacity = bodyMax > 0.01 ? "1" : "0";
            }

            if (meta) {
                const metaSlack = metaMax > 0 ? HEIGHT_SLACK_PX : 0;
                meta.style.transitionDelay = `${collapseDelayMs}ms`;
                meta.style.maxHeight = `${metaMax + metaSlack}px`;
                meta.style.opacity = metaOpacity > 0.01 ? "1" : "0";
            }

            if (timeline) {
                timeline.style.opacity = String(opacity);
                timeline.style.setProperty("--y", `${yShift}px`);
            }
        });

        lastClampedScroll = clampedScroll;
        lastScrollY = window.scrollY;
    }

    if (prefersReducedMotion) {
        // Simple fallback: show all cards stacked normally.
        cards.forEach((card) => {
            card.style.position = "relative";
            card.style.top = "auto";
            card.style.left = "auto";
            card.style.right = "auto";
            card.style.bottom = "auto";
            card.style.transform = "none";
            card.style.opacity = "1";
            card.style.maxHeight = "none";
            const body = card.querySelector(".work-scrolly__body");
            if (body) {
                body.style.maxHeight = "none";
                body.style.opacity = "1";
            }
            const meta = card.querySelector(".work-scrolly__meta");
            if (meta) {
                meta.style.maxHeight = "999px";
                meta.style.opacity = "1";
            }
        });
        timelineByIndex.forEach((item) => {
            item.style.opacity = "1";
            item.style.setProperty("--y", "0px");
        });
        return;
    }

    const measureHeights = () => {
        // Pre-measure header/body heights so collapse is accurate.
        // Doing this after fonts are ready prevents clipped content from under-measuring text wrapping.
        headerHeights = cards.map((card) => {
            const header = card.querySelector(".work-scrolly__header");
            return header ? header.scrollHeight : 0;
        });
        metaHeights = cards.map((card) => {
            const meta = card.querySelector(".work-scrolly__meta");
            return meta ? meta.scrollHeight : 0;
        });
        expandedBodyHeights = cards.map((card) => {
            const body = card.querySelector(".work-scrolly__body");
            return body ? body.scrollHeight : 0;
        });

        // Title height excludes the collapsible meta portion inside the header.
        // headerHeights was measured with meta expanded, so subtracting metaHeights
        // gives us a stable title-only baseline.
        titleHeights = headerHeights.map((hh, i) => {
            const mh = metaHeights[i] || 0;
            return Math.max(0, hh - mh);
        });

        // Compute pinned centers for each collapsed card.
        // Requirement: when dots/circles are aligned to the middle of each block,
        // they should be 150px apart vertically.
        pinnedCenters = (() => {
            const base = TOP_PADDING + (headerHeights[0] || 0) / 2;
            return headerHeights.map((_, i) => base + i * TIMELINE_DOT_SPACING_PX);
        })();
    };

    let initialized = false;

    function applyStaticLayout() {
        const stageHeight = stage.getBoundingClientRect().height || window.innerHeight;
        const timelineHeight =
            (timelineLeft?.getBoundingClientRect().height || stageHeight) || window.innerHeight;

        const stackDriftYEnd = -(CARD_COUNT - 1) * STACK_SHIFT_PER_CARD_PX;

        cards.forEach((card, i) => {
            const body = card.querySelector(".work-scrolly__body");
            const meta = card.querySelector(".work-scrolly__meta");

            const driftForCardEnd = i === 0 ? 0 : stackDriftYEnd;
            const yShift = computePastShift(timelineHeight, i) + driftForCardEnd;

            card.style.opacity = "1";
            card.style.setProperty("--y", `${yShift}px`);
            card.style.transition = "none";

            // Expand everything.
            if (body) {
                body.style.transition = "none";
                const bodyMax = expandedBodyHeights[i] || 0;
                body.style.maxHeight = `${bodyMax + HEIGHT_SLACK_PX}px`;
                body.style.opacity = "1";
            }

            if (meta) {
                meta.style.transition = "none";
                const metaMax = metaHeights[i] || 0;
                meta.style.maxHeight = `${metaMax + HEIGHT_SLACK_PX}px`;
                meta.style.opacity = "1";
            }

            // Ensure card box can grow to fit content.
            card.style.maxHeight = "9999px";
        });

        timelineByIndex.forEach((item, idx) => {
            const driftForCardEnd = idx === 0 ? 0 : stackDriftYEnd;
            const yShift = computePastShift(timelineHeight, idx) + driftForCardEnd;
            item.style.opacity = "1";
            item.style.transition = "none";
            item.style.setProperty("--y", `${yShift}px`);
        });
    }

    const init = () => {
        measureHeights();
        if (STATIC_MODE) {
            applyStaticLayout();
            initialized = true;
            return;
        }

        setInitial();
        update();
        initialized = true;
    };

    // Wait for webfonts so measurements match what you see.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init).catch(init);
    } else {
        init();
    }

    let ticking = false;
    const onScroll = () => {
        if (!initialized) return;
        if (STATIC_MODE) return;
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            update();
            ticking = false;
        });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
});

