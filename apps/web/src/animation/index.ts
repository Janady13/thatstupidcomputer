// Import these into your host React app. Keep the noindex lab layout out of production routes.
export { AnimationProvider, useAnimation } from './orchestration/AnimationProvider';
export { AdaptiveScene } from './AdaptiveScene';
export { Character } from './rive/Character';
export { MobileCharacter } from './mobile/MobileCharacter';
export type { CharacterHandle, MobileCharacterProps } from './mobile/MobileCharacter';
export { DesktopCharacter } from './desktop/DesktopCharacter';
export { RoomScene } from './office/RoomScene';
export type { RoomSceneProps, RoomOverrides, RoomAddition, RoomEffects } from './office/types';
export type { AnimationEvent, AnimationState, SiteCue, ScenePreference } from './core/contracts.mjs';
export type { CharacterSlug, ActionName } from './mobile/types';
