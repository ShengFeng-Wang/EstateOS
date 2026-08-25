import { Component } from 'react';
import type { ReactNode } from 'react';

interface DigitalTwinErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface DigitalTwinErrorBoundaryState {
  hasError: boolean;
}

// Catches WebGL/Three.js render errors so a scene crash falls back to the 2D view
// instead of taking down the whole application shell (spec: "WebGL unavailable/context
// lost").
export class DigitalTwinErrorBoundary extends Component<DigitalTwinErrorBoundaryProps, DigitalTwinErrorBoundaryState> {
  state: DigitalTwinErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): DigitalTwinErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.error('Digital Twin scene error, falling back to 2D view:', error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
