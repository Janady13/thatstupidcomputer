import type { CharacterSlug, ActionName } from '../mobile/types';
/** Filled only by the native promotion gate. A type declaration is not verification. */
export interface VerifiedRiveAsset {
  slug: CharacterSlug; src: string; artboard: string; sha256: string;
  status: 'runtime-verified'; runtimeVersion: string; reviewedAt: string;
  animations: ActionName[];
}
