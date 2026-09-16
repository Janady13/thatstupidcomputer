'use client';
import { Component, type ReactNode, type ErrorInfo } from 'react';
export class AnimationBoundary extends Component<{children: ReactNode; fallback: ReactNode; onError?: (error: unknown) => void}, {failed: boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, _info: ErrorInfo) { this.props.onError?.(error); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
