import { memo } from 'react';
import type { ArtProps } from '../types';

/** View through the window. Local geometry: placement belongs to RoomObject. */
export const Outside = memo(function Outside({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--outside`} data-part="outside" display={hiddenParts?.includes("outside") ? "none" : undefined} data-art="outside">
      <rect id={`${idPrefix}--outside-sky`} data-part="outside-sky" x="0" y="0" width="318" height="363" rx="0" fill={palette.paper} stroke="none" strokeWidth="1.5" />
      <rect id={`${idPrefix}--outside-warm-glass`} data-part="outside-warm-glass" x="0" y="0" width="318" height="363" rx="0" fill={palette.rust} stroke="none" strokeWidth="1.5" opacity="0.045" />
      <g id={`${idPrefix}--outside-cloud-drift`} data-part="outside-cloud-drift" display={hiddenParts?.includes("outside-cloud-drift") ? "none" : undefined} data-motion="cloud" data-phase="0.2">
        <path id={`${idPrefix}--outside-cloud-west`} data-part="outside-cloud-west" d="M82 201 C83 189 99 186 107 194 C109 174 131 176 137 188 C151 179 165 185 165 197 C179 196 188 201 188 207 H82 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.78" />
        <path id={`${idPrefix}--outside-cloud-east`} data-part="outside-cloud-east" d="M191 249 C193 237 206 236 213 242 C222 225 246 232 247 244 C264 241 270 251 267 256 H191 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      </g>
      <path id={`${idPrefix}--outside-distant-roofs`} data-part="outside-distant-roofs" d="M0 356 L0 332 22 332 22 320 52 320 52 337 72 337 72 316 94 316 94 303 110 303 110 338 136 338 136 289 164 289 164 350 193 350 193 319 218 319 218 294 241 294 241 316 270 316 270 329 303 329 303 315 318 315 318 363 0 363 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.38" />
      <rect id={`${idPrefix}--outside-city-window-1`} data-part="outside-city-window-1" x="144" y="296" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-2`} data-part="outside-city-window-2" x="153" y="296" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-3`} data-part="outside-city-window-3" x="144" y="307" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-4`} data-part="outside-city-window-4" x="153" y="307" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-5`} data-part="outside-city-window-5" x="144" y="318" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-6`} data-part="outside-city-window-6" x="153" y="318" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-7`} data-part="outside-city-window-7" x="102" y="316" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-8`} data-part="outside-city-window-8" x="226" y="305" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <rect id={`${idPrefix}--outside-city-window-9`} data-part="outside-city-window-9" x="234" y="305" width="3" height="5" rx="0" fill={palette.paper} stroke="none" strokeWidth="0" />
      <g id={`${idPrefix}--outside-trees-motion`} data-part="outside-trees-motion" display={hiddenParts?.includes("outside-trees-motion") ? "none" : undefined} data-motion="tree" data-pivot="218,361" data-phase="0.7">
        <path id={`${idPrefix}--outside-tree-right`} data-part="outside-tree-right" d="M195 363 C182 344 210 341 204 328 C190 322 198 310 211 311 C199 297 209 287 219 294 C209 278 217 269 230 277 C225 260 237 252 244 265 C243 247 257 247 261 261 C270 247 277 256 272 267 C290 260 294 271 282 282 C304 278 307 292 293 300 C309 301 310 314 298 319 C318 319 318 334 305 339 C318 344 313 354 306 363 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
        <path id={`${idPrefix}--outside-tree-left`} data-part="outside-tree-left" d="M0 301 C10 290 20 299 17 312 C32 298 44 310 34 324 C56 316 60 331 48 339 C69 338 71 354 61 363 H0 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.62" />
        <path id={`${idPrefix}--outside-branch-lines`} data-part="outside-branch-lines" d="M249 362 L249 290 M249 333 l-16 -21 M249 324 l16 -29 M249 348 l-26 -15 M249 345 l22 -11 M19 363 L19 331 l12 -8" fill="none" stroke={palette.paper} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </g>
    </g>
  );
});
