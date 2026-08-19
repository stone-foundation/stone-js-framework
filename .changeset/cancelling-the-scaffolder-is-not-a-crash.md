---
'@stone-js/cli': patch
---

Report a cancelled scaffold as the decision it is, not as a crash.

Answering `no` to the final confirmation of `npm create @stone-js` ended the run with `✖`, an
`npm error` wall and a debug-log path, for doing exactly what the prompt offered. Cancellation now
travels as its own `CancellationError`, which the console error handler prints as one neutral line
and turns into exit `0`. Genuine failures keep exiting non-zero, which is the defect the previous
change fixed and this one had to preserve.

Interrupting a prompt with Ctrl-C is covered by the same path. It was worse than a noisy exit:
`prompts` resolves with nothing rather than ending the process, so the questionnaire carried on
asking and would scaffold from answers nobody gave. An abandoned prompt now stops the run, while an
empty answer stays a real answer.
