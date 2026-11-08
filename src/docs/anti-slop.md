# AI-DESIGN SLOP LINT — COMPRESSED

**CORE RULE.** Everything is tokenized; no framework/AI defaults. Any intentional slop pattern requires an exception log entry: owner, reason, expiry, removal path. Accessibility failure blocks release. Designs need real content models, real states, and a kill switch for trend elements.

---

**COLOR**
Ban: purple→blue default; AI purple (#7C3AED/#8B5CF6)+cyan; neon on near-black; aurora/blob haze; gradient text; rainbow iridescence; emerald=trust; black+gold=premium; vaporwave; per-section random gradients; oversaturated exports; beige=luxury; red=AI danger; corporate blue; semantic colors as decor; brand color on every element; color-only states; framework indigo CTA.
Rule: one accent max; saturation capped; palette from audience/domain; semantic colors reserved; gradients tokenized + solid fallback; states use color+icon+label+shape.

**LAYOUT**
Ban: centered hero+CTA over gradient; 3 identical feature columns; bento with Zap/Shield/Cpu icons; card-in-card-in-card; box-only; default shadcn look; hero→logos→features→testimonials→pricing→FAQ→CTA; centered-logo pill-CTA nav; fake "trusted by" strip; alternating image/text rows; glowing "Most Popular" tier; testimonial wall with avatars+5 stars; giant CTA after every section; floating UI cards; fake dashboard; filler bento; scroll-jacking; shrunken-desktop mobile; repetitive long pages; eyebrow+title+subtitle everywhere; homepage feature dump; one card grid for all content; arbitrary section padding; giant sitemap footer; product tour for simple product; modal navigation; equal dashboard widgets; undesigned empty states.
Rule: IA from user task/content; hierarchy over symmetry; rhythm from content weight; one primary job per page; mobile hierarchy redesigned; empty/error/loading/partial/success designed first; spacing scale by section importance.

**BORDERS**
Ban: one radius everywhere; 24px+ container radius; left side-stripe; neon/glow borders; thick black + hard offset (brutalist preset); default gray; inconsistent thickness per role; gradient rings; hairline everything; 1px neon; rounded page frame; mixed radius in a flow; low-contrast outline buttons; double borders; avatar rings on cards; brutalist as garnish; outlined/glow text; border-color as brand; dashed "wireframe" borders; gradient input borders; borders on all media; mismatched nested radii.
Rule: radius/width/color tokens per component role; borders only for structure/contrast/state; nested radii computed from parent+padding.

**TEXTURE / DEPTH**
Ban: glassmorphism everywhere; shadow+blur on everything; maximalist detail; zero grain; aurora mesh; neumorphism; floating 3D primitives; lens flares over UI; chrome/iridescence; text shadows; plastic 3D icons in flat UI; grain on all dark; depth by blur only; overlit studio render; glass+shadow+gradient+noise stacked; fake material metaphors; plastic surfaces; ambient blur; shadow on every control; gloss without light logic; excessive specular; mixed depth styles.
Rule: one dominant material language; max two decorative layers per surface; elevation via scale+contrast+spacing+layering+shadow tokens; texture only with brand rationale; light direction/shadow softness defined.

**IMAGERY**
Ban: dead-center symmetry; poreless faces; golden-hour default; unmotivated bokeh; lighthouse/cathedral/lonely tree/neon city; robot+human hands; glowing brain/circuit head; constellation dots; floating holographic dashboard; stock pointing at nothing; empty startup office; astronaut/portal; macro eye; isometric city; rim-lit over-smiles; product on pedestal; surreal floating objects; glowing map pins; AI hand artifacts; sparkle-as-AI; clean desk+laptop+coffee; diverse models staring at glowing object; impossible reflections; hero gazing away; mirrors/portals; generic emotional gestures; bad face crops; unrelated imagery.
Rule: specify light direction, texture, age, ethnicity, expression, context; motif tied to narrative/product; real product/UI over abstraction; QA anatomy; crop preserves identity.

**TYPOGRAPHY**
Ban: Inter/default sans identity; giant gradient headline; tight display line-height; all-caps eyebrows everywhere; ultra-thin "futurism"; oversized no-hierarchy; lorem ipsum final; outline/gradient body; too many weights; mixed numerals; text over busy imagery without scrim; default tracking everywhere; mono for "tech"; all-centered; exaggerated scale no path; condensed for urgency; decorative+generic pairing; random variable axes; inconsistent capitalization; huge quotes no attribution; type as decoration.
Rule: max 2 families + mono; solid high-contrast body; scale semantic by task priority; tracking per optical size; tabular numerals in data; visible labels; line-height by size; one dominant display level per view.

**ICONS**
Ban: generic icons across features; gradient squircle containers; mixed outline/filled/emoji/3D; emoji as feature icon; sparkle on every AI feature; shield/lock/gear clichés; over-detailed small pictograms; random gradient colors; inconsistent stroke/radius; 3D inflated in flat; blobs as functional; arrow=growth; rocket/lightbulb/target=innovation; duplicate icons; icon contradicting label; icon-only nav; checkmarks as filler; inconsistent perspective; logo as functional icon; colorblind-unsafe status.
Rule: one icon grammar; grid+stroke+radius tokens; 16/20/24px legibility; icon maps to task; accessible names; icon+label reinforce; status uses shape+label+color.

**MOTION**
Ban: fade-up on every element; parallax blobs; hover-scale on all cards; mouse-tilt everywhere; autoplay video; infinite gradient loops; springy controls; content-hiding page transitions; animated fake metrics; confetti for trivial actions; cursor trails; skeleton everywhere; default sound; scroll-linked fighting reading; hover-only disclosure; decorative loading; purposeless micro-interactions; motion on fake data; auto-carousels; content-covering sticky; infinite scroll without landmarks.
Rule: motion = enter/exit/state/change/feedback; reduced-motion fallback required; duration/easing tokens; feedback only on interactive; transitions fast+cancellable; loops only for loading/brand; essential content accessible without hover/motion; pagination for infinite scroll.

**COMPONENTS**
Ban: "New/AI/Beta" pills everywhere; ⌘K as hero decor; avatar stacks; sourceless stars; gradient tab underline; toggle for non-settings; floating labels only; icon+label+gradient+shadow buttons; fake terminal; hover-reveal as sole path; tooltip-only info; fake breadcrumbs; illustration-only empty states; modal everything; dark-pattern consent; forms without all states; ambiguous chips; too many card actions; search as decoration; fake notification badges; progress without total; decorative steppers; accordion-buried critical content; overflowing tabs; timezone-less dates; cards replacing dense tables; fake code; "coming soon" filler.
Rule: badges only for real status; palette only if real; labels always visible; max 1 primary action per card; all states specified; consent equal effort; control choice matches semantics; critical content inline.

**DASHBOARDS**
Ban: KPI row with fake numbers+green arrows; forced-rising lines; 3-slice donuts; rainbow palettes; gradient/glow area charts; 3D pie/bar; glowing map dots; neon dark default; too many charts; unlabeled axes; truncated axes; status pills without key; fake activity feed; progress rings everywhere; health scores without methodology; context-free sparklines; legend-heavy charts; unexplained heatmaps; gauges for trivial metrics; color-only row status; tooltip-only values; fake "real-time"; vanity metrics first; forecast styled as actual; unexplained anomalies.
Rule: real labeled time-bound metrics; chart type from comparison task; colorblind-safe sequential/diverging; direct labeling when few series; critical values exportable; one primary question per view; forecasts distinct; anomaly = cause/confidence/action.

**BRAND / LOGO**
Ban: gradient blob/orbit/node logo; default spark/asterisk; lettermark in rounded square; circuit/brain/robot mascot; default sans logotype; small-size-failing gradient; literal clipart; inconsistent logo treatment; "Powered by AI" identity; trend-built brand; impossible small details; random dynamic variants; gradient-dependent recognition; competitor-derived palette; ruleless mascot; voice/style mismatch; logo animation default; "minimal" with no signature; gradient-as-rebrand; no don'ts.
Rule: logo concept tied to name/function; works at 16px mono; locked variants + clear space; mark recognizable single-color; define principles before trends; brand kit includes banned motifs + misuse + exceptions.

**ILLUSTRATION / 3D**
Ban: Corporate Memphis blobs; isometric office; waving clay characters; abstract torus/sphere/cube; floating hands/devices; surreal eyes/doors/stairs; impossible anatomy; outline+gradient mashup; stickers in serious domains; one style for all contexts; fake illustrated UI; literal abstract concepts; inconsistent camera; no representation diversity; illustration hiding weak content; random puzzle/gear/lightbulb metaphors; floating 3D panels; cute style in high-risk; inconsistent line/light; 3D with no 2D fallback.
Rule: style from brand; line/fill consistent; metaphor maps to mechanism; tone matches domain risk; perspective/focal/lighting tokenized; illustration supports not replaces content; works flat + small.

**COPY**
Ban: unleash/supercharge/revolutionize/game-changing; "AI-powered" unexplained; seamlessly/intelligently/automagically; "future of X"; fake "10k+ teams"; overpromised autonomy; feature names off user jobs; "Get Started"-only CTA; first-name-only testimonials; cute/hidden legal; playful in high-risk; platform/solution/ecosystem soup; "trusted by innovators"; unlimited no-code claim; "secure/private" unsupported; "beautifully designed" as value; second-person promise overload; jokes in destructive flows; quote-only empty states; blame-user errors; buried "cancel anytime"; footer-hidden AI disclosure.
Rule: specific verifiable user-outcome claims; state what AI does/limits/control; CTA states consequence + intent alternatives; testimonials with role/company/outcome; risk language clear; errors = cause+impact+recovery; empty states give next action; AI disclosure where decisions happen.

**ACCESSIBILITY**
Ban: low-contrast gray text; gradient/low-contrast placeholders; icon buttons without names; focus removed; glass reducing readability; tiny targets; motion overload; color-only errors; essential content in autoplay/carousel; no keyboard path; confirm-shaming; excess friction on low-risk; locked text size; no SR semantics; charts without text alternative; uncaptioned media; undeclared/poor locale; inaccessible autocomplete; gesture-only; silent timeouts.
Rule: AA body minimum; visible focus token (never `outline:none` without replacement); labels always visible (placeholder ≠ label); errors = icon+message+position; reduced-motion + no flashing; keyboard-complete; data tables for critical charts; captions/transcripts; disclosure + extendable timeouts.

**BACKGROUND DECOR**
Ban: aurora blobs; dot grid+spotlight; constellation lines; wave dividers; angled slices; scanlines/CRT/noise; contour lines; circuit traces; floating orbs/particles; giant watermarks; neural nodes; decorative equations; blueprint grid; synthwave sun; brush strokes; halftone everywhere; random floating primitives; high-contrast pattern; dividers replacing spacing; meaningless tech glyphs.
Rule: background from brand surface tokens; decorative layer below content contrast threshold; motif only for actual concept; spacing system primary; symbols map to semantics.

**FORMS / ONBOARDING**
Ban: 10-field signup before value; password-only default; obvious-UI carousel; fake personalization; no progress in multi-step; no skip/undo; invisible autofill; over-friendly serious-domain forms; unmarked required fields; submit-only validation; hidden password rules; giant dropdowns; pre-explanation permission asks; single-name assumption; locale-blind phone/date; mascot onboarding; success with no next step; casual destructive settings; signup-locked preferences.
Rule: minimal fields, progressive profiling; modern auth where appropriate; contextual help; progress visible+accurate; inline validation; required/optional explicit; requirements shown before input; permissions contextual+deferrable; success routes to first value; destructive actions separated+confirmed.

**PROMPT / PROCESS**
Ban: one-shot whole brand; "modern/sleek/futuristic/clean/minimal"; "make it pop"; negative-prompt-only; no brand constraints in prompt; accepting first generation; no content inventory; no a11y pass; no multi-device check; no token export; trend keywords as strategy; "logo ideas" without positioning; generated UI as final spec; "clean dashboard" without data model; "premium" without constraints; unreviewed claims; unverified image rights; no consistency pass; AI output as research; no rollback plan.
Rule: brief → moodboard → tokens → components → QA; measurable attributes not vibes; positive direction + lint rules; real content/edge cases; automated+manual WCAG; test target devices; export tokens; trends need rationale+kill switch; legal/security review public claims; license-verified imagery; trend elements isolated behind tokens/components.

**KILL SWITCHES**
Block/remove if: slop pattern with no exception log; framework default look; decoration without content reason; motif overexposure; critical-flow a11y failure; fake social proof; gradient/glow without state meaning; layout without content model; trend adoption without task/state/tokens; brand system with no don'ts.

**LINT GATE (15 checks)**
1. Color tokenized; no default AI/framework palette.
2. Every gradient has purpose (brand/focus/hero/state).
3. Layout follows content; no template sequence.
4. Cards justified (bounded/comparable/interactive/meaningful).
5. Borders/radii tokenized per role.
6. Depth semantic (hierarchy/state).
7. Imagery specific; no AI/stock clichés.
8. Typography readable; real copy; no gradient body.
9. Icons consistent + meaningful.
10. Motion serves state/hierarchy; reduced-motion ok.
11. Data truthful, labeled; no fake KPIs.
12. Claims verifiable; no invented proof.
13. Accessibility non-negotiable.
14. Kill switch exists.
15. Exception log exists and is time-boxed.