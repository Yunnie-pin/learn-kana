// Vitest setup (vite.config.mjs, test.setupFiles): adds the jest-dom matchers
// (toBeInTheDocument, toHaveClass, toHaveTextContent, ...) to expect().
import '@testing-library/jest-dom';

// react-router's data router (createMemoryRouter) builds a Request with the
// AbortSignal of jsdom, which Node's Request refuses: keep the signal next to
// the request instead. Only the tests run with jsdom; browsers are unaffected.
const NodeRequest = globalThis.Request;
globalThis.Request = class Request extends NodeRequest {
  constructor(input, init) {
    if (!init || !init.signal) {
      super(input, init);
      return;
    }
    const { signal, ...rest } = init;
    super(input, rest);
    Object.defineProperty(this, 'signal', { value: signal });
  }
};
