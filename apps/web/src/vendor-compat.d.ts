/**
 * @rive-app/react-webgl2 4.34.2 still names global JSX.Element in its
 * published component declaration. React 19 correctly owns React.JSX.
 * Bridge this one equivalent type; strict dependency checking stays enabled.
 */
import type { JSX as ReactJSX } from 'react';
declare global {
  namespace JSX {
    type Element = ReactJSX.Element;
  }
}
export {};
