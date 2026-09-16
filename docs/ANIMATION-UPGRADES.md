# More character in the workshop

The five original drawings now have a wider acting range: 32 performances each, including the original 14 and 18 additions. Their shapes, lettering, layers and original animation tracks are preserved. The new performances change how the characters react, gesture and move.

## Meet the cast

| Character | How they play a scene | Try these first |
| --- | --- | --- |
| **Smartphone** | Deadpan and sarcastic. A pause before reacting, an uneven brow and a small, dry gesture do most of the talking. | Suspicious → Facepalm → Shrug; then try its contained Laugh. |
| **Flip-phone** | The theatrical one. Broad tilts, expressive hands and a screen hinge that follows the reaction. | Startled → Shy → Proud → Bow. |
| **App-bot** | Eager and bouncy. Quick anticipation, springy rebounds and panels that follow the body a beat later. | Wake up → Point right → Jump → Laugh. |
| **Pager** | Anxious and alert. Smaller movement, nervous glances and tightly held reactions. | Suspicious → Think → Startled → Sleepy. |
| **Handheld** | Competitive and crisp. Decisive accents, held poses, compact fists and athletic movement. | Proud → Run right → Jump → Frustrated. |

These differences are in the motion tracks. They are not just personality labels attached to identical animation.

## Ask the desktop computer

The office computer now has **12 expression states**. On the home page, **Ask the computer** cycles through skeptical, amused, thinking, proud, sleepy and startled reactions, each paired with a short remark. Look for the doubtful brow, contained laugh, searching glance, pleased posture, heavy eyelids and sudden double take.

Its original six states—idle, alert, overheating, searching, defeated and revived—remain available. The office drawing and its lettering are preserved. The smaller characters use corresponding reactions when the home scene switches to mobile.

## Try the playground

Open the **Work** page and find **Meet the characters**. Pick a character, then choose a quick feeling or use **All expressions and moves** to explore the full set. The description beside the selector explains the selected performance.

Use **Walk left**, **Walk right**, **Run across**, **Make an entrance**, **Take a peek** or **Jump** for stage direction. Tapping an empty place on the stage sends the character toward it. Dragging moves the character; releasing lets it settle. The drawing keeps its normal orientation while travelling left or right, so its lettering stays readable.

For keyboard movement, focus the character and press **Space** to pick it up. Use the arrow keys to move it, hold **Shift** for smaller steps, and press **Space** again to drop it. **Escape** releases it. When it is not held, Left/Right walk, Up jumps, Down/Home returns to the middle and End walks right.

**A little performance** plays a short sequence: an entrance, suspicion, laughter, a run, a proud pause, a jump, a bow and a return to the mark. **Stop the performance** hands control back to you. **Reset stage** brings the character home. Choosing another action, another character or a new stage direction also interrupts the show.

**Pause animations** pauses both acting and movement. With reduced motion enabled, new expressions are shown at their selected peak poses and travelling controls are unavailable: Sleepy looks sleepy, and Startled looks startled, without playing the movement. The original rude gesture remains an explicit opt-in and stays censored; it is not included in the automatic performance.

## The new performances

| Performance | The intended acting beat |
| --- | --- |
| **Laugh** | A small chuckle builds into two laughs, followed by an exhale. |
| **Proud** | Gather composure, lift the chest and hold a pleased pose. |
| **Shy** | Look away, tuck the shoulders, draw the hands inward and peek back. |
| **Suspicious** | Narrow the eyes, raise a brow and give a cautious double take. |
| **Startled** | Take a sharp breath, lift the hands, recoil and recover. |
| **Frustrated** | Build tension, shake twice and settle with a sigh. |
| **Sleepy** | Let the eyelids grow heavy, nod twice and finish asleep. |
| **Wake up** | Start from the matching sleeping pose, stretch and regain focus. |
| **Think** | Search with the eyes, raise a thinking hand and arrive at an idea. |
| **Facepalm** | Realize the problem, bring a palm to the screen edge, hold and release. |
| **Shrug** | Raise both shoulders, turn the palms outward and settle unevenly. |
| **Point left / right** | Look toward the destination before pointing, hold the cue and retract. |
| **Bow** | Gather the hands, lean into a bow, pause and rise. |
| **Jump** | Plant, compress, launch, tuck and land with a recovery. |
| **Land** | Descend, compress through the knees and rebound to rest. |
| **Run right / left** | Alternate quick strides and opposing arms, with a trailing cable. |

Sleepy and Wake up share their joining pose, so they can form one scene. Run left and Run right use separate movement cycles; the character is not flipped backward. The existing Idle, Happy, Excited, Sad, Angry, Confused, Searching, Sassy, Eye Roll, Rude Flip Off, Wave, Revived and walking performances remain available.

## Review status

The source contains **five rigs, 32 performances per rig and 160 total timelines**. A portable fixture records the original five scene-file fingerprints, all 70 original timeline metadata records and 4,466 original track fingerprints. It is included so preservation checks work after the package is transferred, without needing the original project beside it.

The separate Node acceptance checks cover preservation, the public action list, complete pose resets, finite values, positive scales, limb connections, stage-space joint positions, material changes at the named peak times, different acting profiles, transition cleanup and playback scheduling. These are numerical and source checks; they do not establish how natural a movement looks on every device.

**Acceptance, 2026-09-13:** the separate Node suite passed **36 checks with no failures or skips**. This includes the original artwork and track fingerprints, completed-playback restart behavior, and the Sleepy and Startled still poses under reduced motion. The upgraded native records list all 32 performances in each of the five files, and their hashes match the shipped files.

The separate native release evidence records **960 samples across 160 performances** using the official Canvas runtime, version 2.42.1. The acceptance suite checks that this evidence names the expected performances and identifies the shipped bytes; it does not repeat that native-runtime run or constitute a visual review.

**Browser verification is blocked by the session’s explicit browser policy.** No alternate browser was used. The native Canvas results do not establish browser WebGL behavior or appearance on a device.

To run this document’s independent checks after transfer:

```sh
node --test tests/animation/upgrade-acceptance.test.mjs
```

The unchanged office and the desktop computer have their own preservation and expression checks elsewhere in the release evidence.
