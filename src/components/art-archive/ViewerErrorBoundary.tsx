import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** 3D ビューアの例外で地図・モーダル全体を落とさない */
export default class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Artwork3DViewer]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[320px] w-full items-center justify-center bg-[#12110d] p-6 text-center">
          <p className="font-mono text-xs leading-relaxed text-white/70">
            3Dビューアの表示に失敗しました。
            <br />
            ページを再読み込みしてください。
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
