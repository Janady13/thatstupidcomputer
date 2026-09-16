/** Acting catalog. No asset or runtime network requests. */
export const PERFORMANCE_VERSION='2.0.0';
export const LEGACY_ACTIONS=Object.freeze(["Idle","Happy","Excited","Sad","Angry","Confused","Searching","Sassy","EyeRoll","RudeFlipOff","Wave","Revived","WalkRight","WalkLeft"]);
export const NEW_ACTIONS=Object.freeze(["Laugh","Proud","Shy","Suspicious","Startled","Frustrated","Sleepy","WakeUp","Think","Facepalm","Shrug","PointLeft","PointRight","Bow","Jump","Land","RunRight","RunLeft"]);
export const ALL_ACTIONS=Object.freeze([...LEGACY_ACTIONS,...NEW_ACTIONS]);
export const PERFORMANCES=Object.freeze({
  "Idle": {
    "name": "Idle",
    "label": "Idle",
    "group": "mood",
    "seconds": 4.4,
    "loop": true,
    "description": "Tired, patient breathing with a small glance.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Happy": {
    "name": "Happy",
    "label": "Happy",
    "group": "mood",
    "seconds": 3.2,
    "loop": true,
    "description": "Soft crescent eyes, a pleased nod and open hands.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Excited": {
    "name": "Excited",
    "label": "Excited",
    "group": "mood",
    "seconds": 3,
    "loop": false,
    "description": "Anticipation squat, fist pump, two-foot hop and a soft landing.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Sad": {
    "name": "Sad",
    "label": "Sad",
    "group": "mood",
    "seconds": 4,
    "loop": true,
    "description": "Slow sag, drooping eyes and heavy arms.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Angry": {
    "name": "Angry",
    "label": "Angry",
    "group": "mood",
    "seconds": 3.2,
    "loop": false,
    "description": "Planted stance, clenched hands and a short foot stamp.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Confused": {
    "name": "Confused",
    "label": "Confused",
    "group": "mood",
    "seconds": 3.6,
    "loop": true,
    "description": "Alternating head tilts, raised brow and a questioning hand.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Searching": {
    "name": "Searching",
    "label": "Searching",
    "group": "mood",
    "seconds": 3.6,
    "loop": true,
    "description": "Hand above the screen, scanning gaze and a careful lean.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Sassy": {
    "name": "Sassy",
    "label": "Sassy",
    "group": "mood",
    "seconds": 3,
    "loop": false,
    "description": "Side-eye, raised palm and a dismissive wrist sweep.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "EyeRoll": {
    "name": "EyeRoll",
    "label": "Eye Roll",
    "group": "reaction",
    "seconds": 2.8,
    "loop": false,
    "description": "Look away, eyes sweep up, followed by a tired shrug.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "RudeFlipOff": {
    "name": "RudeFlipOff",
    "label": "Rude Flip Off",
    "group": "gesture",
    "seconds": 3.8,
    "loop": false,
    "description": "Anticipate, raise hand, extend finger, hold, retract and settle.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Wave": {
    "name": "Wave",
    "label": "Wave",
    "group": "gesture",
    "seconds": 3,
    "loop": false,
    "description": "Open-palm wave with a relaxed return.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "Revived": {
    "name": "Revived",
    "label": "Revived",
    "group": "reaction",
    "seconds": 4.2,
    "loop": false,
    "description": "Straighten, smile, lift both palms and settle with relief.",
    "isNew": false,
    "travel": false,
    "peakSeconds": 1.55
  },
  "WalkRight": {
    "name": "WalkRight",
    "label": "Walk Right",
    "group": "movement",
    "seconds": 1.3333333333333333,
    "loop": true,
    "description": "Rightward foot-planted walking cycle; host travel is separate.",
    "isNew": false,
    "travel": true,
    "peakSeconds": 1.55
  },
  "WalkLeft": {
    "name": "WalkLeft",
    "label": "Walk Left",
    "group": "movement",
    "seconds": 1.3333333333333333,
    "loop": true,
    "description": "Leftward foot-planted walking cycle, without mirroring the artwork.",
    "isNew": false,
    "travel": true,
    "peakSeconds": 1.55
  },
  "Laugh": {
    "name": "Laugh",
    "label": "Laugh",
    "group": "mood",
    "seconds": 3.2,
    "loop": false,
    "description": "A contained chuckle builds into two laughs, then exhales.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.34
  },
  "Proud": {
    "name": "Proud",
    "label": "Proud",
    "group": "mood",
    "seconds": 3.8,
    "loop": false,
    "description": "Gather composure, lift the chest and present a quietly triumphant pose.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.6
  },
  "Shy": {
    "name": "Shy",
    "label": "Shy",
    "group": "mood",
    "seconds": 3.6,
    "loop": false,
    "description": "Look away, tuck the shoulders and bring the hands inward before peeking back.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.51
  },
  "Suspicious": {
    "name": "Suspicious",
    "label": "Suspicious",
    "group": "mood",
    "seconds": 4,
    "loop": false,
    "description": "A narrow-eyed double take with one raised brow and a cautious side lean.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.68
  },
  "Startled": {
    "name": "Startled",
    "label": "Startled",
    "group": "reaction",
    "seconds": 2.2,
    "loop": false,
    "description": "A sharp intake, raised hands and recoil followed by a visible recovery.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 0.42
  },
  "Frustrated": {
    "name": "Frustrated",
    "label": "Frustrated",
    "group": "reaction",
    "seconds": 3.4,
    "loop": false,
    "description": "Tension builds into two restrained shakes and a long settling sigh.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.43
  },
  "Sleepy": {
    "name": "Sleepy",
    "label": "Sleepy",
    "group": "mood",
    "seconds": 5.2,
    "loop": false,
    "description": "Heavy lids, two head nods and a soft fold into a held sleeping pose.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 4.5
  },
  "WakeUp": {
    "name": "WakeUp",
    "label": "Wake up",
    "group": "reaction",
    "seconds": 3.6,
    "loop": false,
    "description": "Wake from the matching sleeping pose, stretch and regain focus.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.51
  },
  "Think": {
    "name": "Think",
    "label": "Think",
    "group": "mood",
    "seconds": 4.8,
    "loop": false,
    "description": "Search with the eyes, hold a chin-side thinking hand, then find an idea.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 2.02
  },
  "Facepalm": {
    "name": "Facepalm",
    "label": "Facepalm",
    "group": "gesture",
    "seconds": 3.8,
    "loop": false,
    "description": "A slow realization, palm to the screen edge, held disbelief and release.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.6
  },
  "Shrug": {
    "name": "Shrug",
    "label": "Shrug",
    "group": "gesture",
    "seconds": 3.2,
    "loop": false,
    "description": "Lift both shoulders, turn both palms out and settle after an asymmetric hold.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.34
  },
  "PointLeft": {
    "name": "PointLeft",
    "label": "Point left",
    "group": "gesture",
    "seconds": 3,
    "loop": false,
    "description": "Look left before extending a pointing hand, hold the cue, then retract.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.26
  },
  "PointRight": {
    "name": "PointRight",
    "label": "Point right",
    "group": "gesture",
    "seconds": 3,
    "loop": false,
    "description": "Look right before extending a pointing hand, hold the cue, then retract.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.26
  },
  "Bow": {
    "name": "Bow",
    "label": "Bow",
    "group": "gesture",
    "seconds": 3.6,
    "loop": false,
    "description": "Gather the hands, hinge into a respectful bow, pause and rise with follow-through.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 1.51
  },
  "Jump": {
    "name": "Jump",
    "label": "Jump",
    "group": "movement",
    "seconds": 2.2,
    "loop": false,
    "description": "Plant the feet, compress, launch into a tucked hop and land with a soft recovery.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 0.92
  },
  "Land": {
    "name": "Land",
    "label": "Land",
    "group": "movement",
    "seconds": 1.6,
    "loop": false,
    "description": "A short descending arrival compresses through the knees and rebounds to rest.",
    "isNew": true,
    "travel": false,
    "peakSeconds": 0.5
  },
  "RunRight": {
    "name": "RunRight",
    "label": "Run right",
    "group": "movement",
    "seconds": 0.9,
    "loop": true,
    "description": "A quick rightward running cycle with airborne feet, opposing arms and trailing cable.",
    "isNew": true,
    "travel": true,
    "peakSeconds": 0.38
  },
  "RunLeft": {
    "name": "RunLeft",
    "label": "Run left",
    "group": "movement",
    "seconds": 0.9,
    "loop": true,
    "description": "A quick leftward running cycle with airborne feet, opposing arms and trailing cable.",
    "isNew": true,
    "travel": true,
    "peakSeconds": 0.38
  }
});
export const PERFORMANCE_GROUPS=Object.freeze([
  {
    "id": "mood",
    "label": "Moods",
    "actions": [
      "Idle",
      "Happy",
      "Excited",
      "Sad",
      "Angry",
      "Confused",
      "Searching",
      "Sassy",
      "Laugh",
      "Proud",
      "Shy",
      "Suspicious",
      "Sleepy",
      "Think"
    ]
  },
  {
    "id": "reaction",
    "label": "Reactions",
    "actions": [
      "EyeRoll",
      "Revived",
      "Startled",
      "Frustrated",
      "WakeUp"
    ]
  },
  {
    "id": "gesture",
    "label": "Gestures",
    "actions": [
      "RudeFlipOff",
      "Wave",
      "Facepalm",
      "Shrug",
      "PointLeft",
      "PointRight",
      "Bow"
    ]
  },
  {
    "id": "movement",
    "label": "Movement",
    "actions": [
      "WalkRight",
      "WalkLeft",
      "Jump",
      "Land",
      "RunRight",
      "RunLeft"
    ]
  }
]);
export const CHARACTER_PERFORMANCES=Object.freeze({
  "smartphone": {
    "name": "Smartphone",
    "personality": "Deadpan and sarcastic",
    "actingNotes": "Longer thought before a reaction; asymmetric brows, contained chest motion and dry pauses.",
    "recommendedActions": [
      "Suspicious",
      "Facepalm",
      "Think",
      "Shrug",
      "Laugh"
    ]
  },
  "flip-phone": {
    "name": "Flip-phone",
    "personality": "Theatrical and expressive",
    "actingNotes": "The screen hinge leads with a broad head tilt; hands stage the gesture and the hinge follows through.",
    "recommendedActions": [
      "Bow",
      "Startled",
      "Laugh",
      "Shy",
      "Proud"
    ]
  },
  "app-bot": {
    "name": "App-bot",
    "personality": "Eager and bouncy",
    "actingNotes": "Light anticipation, springy torso rebounds and staggered rear-panel follow-through.",
    "recommendedActions": [
      "Jump",
      "Laugh",
      "Proud",
      "WakeUp",
      "PointRight"
    ]
  },
  "pager": {
    "name": "Pager",
    "personality": "Anxious and alert",
    "actingNotes": "Small footwork, brief nervous eye darts and tightly contained body/kickstand jitter.",
    "recommendedActions": [
      "Suspicious",
      "Startled",
      "Shy",
      "Think",
      "Sleepy"
    ]
  },
  "handheld": {
    "name": "Handheld",
    "personality": "Competitive and crisp",
    "actingNotes": "Fast decisive accents, steady holds, compact fists and precise athletic takeoffs.",
    "recommendedActions": [
      "Proud",
      "Jump",
      "RunRight",
      "Frustrated",
      "PointLeft"
    ]
  }
});
export const RESET_ADDITIONS=Object.freeze([['shoulder-left','y'],['shoulder-right','y'],['screen-cursor','opacity'],['screen-cursor','x']]);
export const SOURCE_FINGERPRINTS=Object.freeze({
  "smartphone": {
    "sceneSHA256": "69d5e0795888558649a943be96cc1096079f390404fb4622f19956cd219d1471",
    "legacyClips": {
      "Idle": "e9f259a5ae8869e1bce1faaa67cb5249dcb2d6c239ecb5bcfb353afab48d7e49",
      "Happy": "631ae0d450f51aa4ddec93fd01d3e0382d31ff989d978a9d865072bd1dafe199",
      "Excited": "95687913f5d7a5b4813c086eb0a66934ab12a85ca43d897b385791f8adecbbd4",
      "Sad": "4bedb0a17509f653a7058a4bbeb0154fe51cb43ae29fd30c6d7ceffcdabc3b2c",
      "Angry": "6eea23ca384604095c2f36e2ac8f25da30f851b2bf50861b49ede53ffcf05e01",
      "Confused": "788c4890563e8fa6a565a22d87f59554c0fe338d1eccf9b0c2ba2afa0f34513a",
      "Searching": "3694d7eb764822533ef813e9b4fe970b19e24d131e93bc3fe068c5d43feabe5c",
      "Sassy": "36409233fe03d2ab07c648b804c961ffad4114030e3cb5ef097e82918bd02e39",
      "EyeRoll": "0b34e75281d80e66a40b4f65a9499132dc3349446e3231794d650508525b5aca",
      "RudeFlipOff": "1a933acd2bf084b11c6dcb443e9a5a7b283decf86e9bf5388aa6a2c0f267f68f",
      "Wave": "7e9b7ad73111369252834148167f34134c9fb4d87c2204d1c3df32b4efeafedd",
      "Revived": "3574ee28f6b9026abb6be2cc3eccaa046dad0f8e34ddc597b745c4059786c001",
      "WalkRight": "95aaa28f2a39b3f12330fae9a7dc675b0df3520a3f4a24da3405afbd7d469fca",
      "WalkLeft": "9fa27b3d6f1447e4b3ef831ddf74f72337233efcbc3c35f334d5cb69403b7bc3"
    }
  },
  "flip-phone": {
    "sceneSHA256": "1df4c3afea2b29baedd9b8896e5561de526f62d1b7e4d15eec3b332e9553db52",
    "legacyClips": {
      "Idle": "43bb44ccfe44d7de66bb81c0f3635fd0ef05db44810edb455d7c2e179d5b5876",
      "Happy": "dee7b31f52b57848f0a30472f3ec1c02c3ee71c008226ec60da9e2437f1740e7",
      "Excited": "c96fec1ef0af625950f3f1bff59292093788b573ebbf41cbab8ffd13231deb8c",
      "Sad": "f50e20c022cc7b7c88677ccd625fdf8d5399bc14b9761375ecf8f5c884c583ae",
      "Angry": "2f0b02c789e746273a884be96a38546297df33386702caedaa9163c8942d0f84",
      "Confused": "44f2f39055f6b2374412967b968590c7691d9a8ff04e5bd7dcfca4cebe54a583",
      "Searching": "3cfed42679892d48b50003c806d074ef9a6774641474c9991c919a50b88222ea",
      "Sassy": "af62f04973d0efcefa82e81e74c0a7b11a7316fdca720d28c7655208cdc6b504",
      "EyeRoll": "97ce762c3b486eaaffe1d1eff5a79cb933a7645a9ae0d690f42ef4683cf9a03b",
      "RudeFlipOff": "d3220242b42cf5804edf68eb677c7e5e2f65157cb1bab39384ea592c4a253352",
      "Wave": "8d9a2ce87ea673c45877b092ccbdae0b3850fd851e21bf9c9cb2575418f00eb0",
      "Revived": "05d61e9296a744add25e4d6032d85df257859190317c027a7164961a8478b84f",
      "WalkRight": "f4fc3486a4c57b4d5afdc0f8586b0bff38a2a17e41d2f9e539e2aace8e375d4c",
      "WalkLeft": "189185eecef3498af7f13684bd39a566066d496d15abdd9b4a2ef5028d45cf27"
    }
  },
  "app-bot": {
    "sceneSHA256": "f34e060674f32328801fe1b25be9bc553c79dd1fbd02f24910a99e6841a6a430",
    "legacyClips": {
      "Idle": "0c477d9f5814ee8b1e638935487fc0d7a2dee96cdc3b48f7eeb49dd7204092fc",
      "Happy": "4173b05acdfdd61d5f18c0ac5ea76b594ec465e35176a4c586f3e7695e831be8",
      "Excited": "009b5ec6e3928947140d2b4f436faba352012e64944281be1170c4b57b211ab1",
      "Sad": "9a6965f903a3f021d0cb84ed53634e084edf4cf9b83c7bf13e5a8ae3f6f606c1",
      "Angry": "fb03a8022a54dffd07e35f9b1fc1cb5789039646c224fd0cb3c6226c1d661dce",
      "Confused": "22e392586b4fc5805321b8208e4e790a800e903a88d6e85cdec134f385fca578",
      "Searching": "05336f3fc06c0b96e0895a55c76f5e34d2860da463c5ac0b771e3b8f4bc5a061",
      "Sassy": "b13497c9fb1a2227ad1a47ff92a24af7921f5a97b8c70e98aa38b95feac16043",
      "EyeRoll": "f46f9a5cd58388066e791d4c4805c886fed1a325a2ecf5a5c9d24249f32ef17d",
      "RudeFlipOff": "c60a1c357de0a86941d0311ffcbf265e1c5c6f205f63b471265c7f5fe50bd6a3",
      "Wave": "d2a74347887791990f0019bc88657e06d150d29de34b1bab732e3abbf8fd954d",
      "Revived": "ff79ea38887753a4fbff2c7ad652ce86f052e51bb372abf93b3689383c67c454",
      "WalkRight": "d77fdc4fdcad01f5bae4da8b3d248ad617e74e8bfde40de9e2eb53c3c3e7b744",
      "WalkLeft": "983731950b48e1bcad70cf164ef5cc8fc39d467369c4380988cea78713d39a09"
    }
  },
  "pager": {
    "sceneSHA256": "b8617ae5fa4d677a026ba88b3a5c881689202c61d4a37ea1480c689b36908549",
    "legacyClips": {
      "Idle": "02e85584e15f056c6f47aef37bda80574b189a9efd0ce074e329cb1429703f90",
      "Happy": "c034d4dd1b59a00af3066ad52d448a1126eccbeabe35cb73d1e5f2ae8da1259e",
      "Excited": "2d61d82a454206bd9d7be773838cf81cfec737d0de1baef40fa7aa50fe0e600c",
      "Sad": "1d645d807123017dc04345f8b2b5e1f898b5c06bdf842796e6d2f190545e574c",
      "Angry": "dffe7b02c1abba88204557af2367608cba18c6473dd3e80761bfd6e9f7415381",
      "Confused": "3009de609dacd4f0a5af7e826809919c0aa154a91a43c5fb9ba1c7aaabc581db",
      "Searching": "ff2864b864f4cc8dba540d3c2378ea85f73f150430457cef613ffc340f7cef01",
      "Sassy": "3f83be8616de6632e1f5acfa2dd093303110d0b1ac9d0c2a1a931e4c84571e4a",
      "EyeRoll": "b13007771ae5075944bc9879bab06e52c0b6f7718e5617ca39d6a82fa16554c6",
      "RudeFlipOff": "9978b021f6c6376c262ae0f1e24db3dd0879e366c410c3f79a8470c39b505026",
      "Wave": "9f88f5e5b7788ef1256f94b5bb88066f10aa3d274af17237f5cf6e19455b4f53",
      "Revived": "18b8de4128e76587681aa9537931823c57fadfc064da7a4695481b27085e07f2",
      "WalkRight": "3763fa82dc50cf41b803811fddf07e568b142c27dc57a8e1db54748d72bb576c",
      "WalkLeft": "74b92136a411694b72346b8b4f3c84c295f954f2bc35a708833b1bffcb702387"
    }
  },
  "handheld": {
    "sceneSHA256": "906e12056995b6eb226281b2871de62955b2b23ba88d27f93ff39bdbbb4de849",
    "legacyClips": {
      "Idle": "627fea4dbbcbeef36f9255d501d8bae7d81f878620e914bb2d3ca015f1ddce94",
      "Happy": "fa339f52b428666d52321fb634700783aa40ed6dd2bc4e1623a0c0fd8288d620",
      "Excited": "38df47844c6a86a9acad4b56c07bf107a3474c287255af9fd6a651e40c54b860",
      "Sad": "47cd408ed106ef070f0904687cb838660cbdcff65b284005ae52439afcdfc704",
      "Angry": "daa523b8515681885c0f6f78b509df0091556c548c1f6cb04c0dc54ebdb55fd1",
      "Confused": "6df0c5367ad5dc75dd674c7fe8e8c69a65e1dd9b5a222e0a97ff14aa92cbd95c",
      "Searching": "42e9eea762b5ab7206b177a60157598bb24876302358fd7c5b0870a25531631c",
      "Sassy": "1e7d3b03bb447210301eba499570b53d6c7ac76e63cd7c649fd96872e9531071",
      "EyeRoll": "0253b2c00df7f39bcee87536492b236e70a6485c1634bd80c0ac55b38c13381d",
      "RudeFlipOff": "42b95eab0922da065182f66f919320c2d42548e80660363e185467a475ced57f",
      "Wave": "27af1cc18b830d2982bc0e5f31d9607cb9ff733f63db60a98a3a8eb15da9f0ca",
      "Revived": "26b5512746b7be6daabaaca19e0ecb4c27fa47b3994167d0d432d9b6eebdaf05",
      "WalkRight": "c9b52f93d25f5790491fd01fc3db6ee8cddbf55142208aaa81e28cea598d88a4",
      "WalkLeft": "e61e525cb34bef4a6a8e092067589fcb9cfcb1f41b994a45dfa158ccc8449ca3"
    }
  }
});
