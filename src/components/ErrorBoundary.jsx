import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Ballen UI Error]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center text-ink font-sans">
          <div className="max-w-md rounded-3xl border-[3px] border-ink bg-ballen p-8 shadow-hard">
            <h1 className="font-display text-4xl uppercase tracking-wide">Hang tight!</h1>
            <p className="mt-3 font-medium text-ink/80">
              Something tripped up the boys. Refresh the page to get back in action.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full border-2 border-ink bg-paper px-6 py-3 font-display text-lg uppercase tracking-wide shadow-[3px_3px_0_0_#111] hover:bg-ink hover:text-ballen"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
