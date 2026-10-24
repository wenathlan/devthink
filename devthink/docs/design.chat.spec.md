# the chat redesign spec — the reference grammar decided

the canonical spec of the chat redesign operation, merged from the four reference analyses: zcode, synara, t3code and the openai feature absorption. every value below is decided, not suggestive: the implementation waves answer to this document. the file follows the writing rules: dot hierarchy, lowercase, english, links only in the last paragraph.

## the decided grammar

### the shell

. the chat column reads at one centered lane, max width 46rem on wide viewports, with the reading column shared by the timeline and the composer so the eye never reflows between them.
. the session rail stays resizable with the persisted width, the active row carried by background only, never by divider lines.
. the header answers 44px with the gradient hairline divider and the title truncate, the thread title renamed by double click.

### the composer

. the well is the floating glass dock over the timeline: radius 1.2rem squircle family, the frosted glass on a before pseudo element with blur 40px and saturate 150 percent over the popover fill at 55 percent, the transcript tucking 20px under the top edge and dissolving in a 40px mask band, the footer clearance 52px.
. the resting state is the single line pill: unfocused with one line of draft the well collapses to the round pill, the grid carrying lead controls, the editor and the tail, the footer joining by display contents, and the multi line draft returns the block radius.
. the control bar sits under the input inside the shell: the lead cluster carries the tool chips and the plus menu, the tail cluster carries the context ring, the provider model effort trigger, the mic and the send circle.
. the send key is the 32px circle that morphs by state: the up arrow to send, the filled square to stop, the spinner while submitting, the split implement refine pill on plan follow ups, and the disabled state until content.
. the model effort trigger label freezes at open time size while its menu is open so the tuning never drags the popup sideways.
. the control ladder collapses by measurement: labels first, icon only at narrow widths, the collapse decided by the fit hook, never by media queries alone.
. the drag over state tints the pane and rings the well, the drop overlay carrying the centered pill.
. the placeholder is state aware: the empty invitation, the follow up, the approval answer, the question answer, one string per session phase.

### the timeline

. the turns are asymmetric and avatarless: the user turn is the right aligned bubble at max width 80 percent, radius 1rem with the 2px tail corner top right, padding 12px 14px, the background from the user message token, the border transparent so the geometry never shifts between states.
. the assistant turn is the full width naked markdown at the chat size with the 1.625 leading shared by the bubbles, the editor and the reading column, one leading for every chat surface.
. the long user message collapses at the measured height with the gradient mask and the show full ghost button.
. the meta is quiet and hover revealed: the timestamps, copy, edit, fork, the verdict keys and the read aloud key appear on row hover and focus within, always visible on touch, the timestamps day aware, the time today, the weekday and time this week, the date older, the full stamp on the title attribute.
. the day separators stay for the structural events only: the compaction, the fork, the model change, the load earlier turns, the hairline with the centered label, never for plain date grouping.
. the row cadence: the user rows 16px bottom, the assistant and work rows 8px, the working rows 4px, the working banner reading worked for with the tabular clock and the disclosure chevron folding the work rows.

### the reasoning

. the cognition head owns the violet: the collapsed default, the shimmering thinking state while streaming, the thought for ns duration when settled, the one line rolling summary while collapsed and streaming with the edge masks, and the auto collapse on completion respecting the user interaction.
. the expanded trace is the max height 96 markdown scroller that follows live, sticking to the bottom unless the reader scrolled from the edge.

### the work rows

. every tool call is the one line row: the 24px icon gutter, the 16px tool icon, the label at the secondary tone lifting to full foreground on hover, the truncated command chips, the failure tinted destructive.
. the consecutive calls group under the one collapsible summary header with the count, the expanded bodies capped and scrollable, the inline cap of 4 rows with the more link.

### the streaming

. the answer streams with the block caret at the text end, the 2px current color block with the one second steps blink, inert under reduced motion.
. the markdown settles by blocks: the completed top level blocks parse once, only the tail re parses, the reveal smooth.
. the jump to message highlight holds 1200ms, the back to bottom pill floats when the reader scrolled up.

### the draft state

. the greeting is the time of day headline at the adaptive size with the elastic spacer so the composer stays anchored exactly where it lives for the whole conversation.
. the sub line is honest, the suggestion chips waterfall at 65ms stagger in the hidden scrollbar row, the click prefills the composer without sending.
. the recents row resurfaces the recent conversations under the chips.

### the session list

. the rows are 32px with the hover and active backgrounds only, the leading status slot carrying the spinner, the error dot, the unread dot, the success check.
. the date group headers compute with the calendar day math: today, yesterday, the days ago, this week, last week, this month, last month, older.
. the pinned group sits above, the search matches titles and message snippets with the highlighted excerpts.
. the settled rows desaturate: the grayscale favicon, the muted title, the compact relative time with the tabular numbers.

### the icon presentation

. the solbot mark is one glyph everywhere: the corona rays and rim in current color, the amber core the only color voice, the internal radial gradient washing inside the disc.
. the motion states key by the data state attribute: idle static, thinking the slow corona rotation of one 8 to 12s linear turn, streaming the core breathing at the 1.6 to 2.4s pulse, speaking the rays pulsing with the utterance, halted the core dimmed to neutral.
. every animation inert under prefers reduced motion, the mark never carries a badge, a dot or a count.

## the features ranked for the waves

. the reasoning duration chips and the streaming shimmer on the cognition head, hours, the drawer exists, this is the head swap.
. the read aloud key and the verdict keys on the action rail, low effort, speech synthesis is free, the verdict stays on the device.
. the streaming caret, trivial polish value high.
. the edit branch choice, the update in place against the clone into the new session, the clone machine already written.
. the canvas side panel, the flagship: the versioned text and code buffer beside the thread, the mount grammar reused from the sandbox lane, the artifact chip on the turns that carry one.
. the projects seam, the local records with the pinned instructions, the session list grouping, the prompt stitch.
. the saved memories, the quiet fact list with the delete keys and the injection seam.
. the auto effort row, the adaptive resolution by the draft token estimate, the meta line reporting the level actually used.
. the composer plus menu, the tools graduate into the flyout once they exceed four, the pressed tools stay visible as chips.
. the temporary chat, the session that never persists, the memory off, the honest sub line.
. the sidebar search and pin, the filter field matching titles and turn text.
. the citation source chips, the slot built, the provider fills it.
. the sandbox task cards, the tool call bridge between the thread and the saddle engine, the command rows with the verdicts and the diff view.
. the scheduled tasks deferred, ranked last on purpose, no always on worker owns a schedule in the browser surface.

## the verification law

. every wave lands only after the mandatory flow: the lint clean, the typecheck clean, the dev server 200, the agent browser and the vision model confirming the surface in dark and light, the active and inactive states, no glitches, no console errors, the proof of render as the blocking gate.

## to visit, the references this spec reads

. zcode reference. /tmp/allan-refs/repo/docs/temp/zcode
. synara reference. /tmp/allan-refs/repo/docs/temp/synara
. t3code reference. /tmp/allan-refs/repo/docs/temp/t3code
. the landed chat surface. devthink/Sol/chat
. the rules mapping. devthink/docs/rules.ofical.md
. the owner rule file. upload/ofical2.txt

| reference | the grammar it owns in the merge |
| --- | --- |
| zcode | the control bar ladder, the reasoning display, the session status slots, the hover reveal economy, the semantic token discipline |
| synara | the floating glass composer, the single token typography at 1.625 leading, the work row grammar, the state aware placeholder, the density and width settings |
| t3code | the asymmetric avatarless turns, the work log grouping, the send state machine, the session shelves, the long message collapse, the glass dock resting pill |
| openai | the reasoning summary chips, the action bar, the canvas panel, the projects and memories, the icon presentation law, the streaming caret |
