const {expect} = require('chai')
const {compareText} = require('../../sysUtils/compareText')
const {createJest} = require('./createJest')

describe('createJest', () => {

  it('JS + React17', () => {
        const params = {
            name: 'HelloWorld',
            isTS: false,
            className: 'hello-world',
            techVer: { framework: '17.0.2' },
            props: [{ propName: 'name', isRequired: true, testValue: '"Peter"'}],
        }
        const {specFileName, specCode} = createJest(params)
        expect(specFileName).to.equal('HelloWorld.spec.jsx')
        compareText(specCode, jsReact17)
  })

  it('TS + React17', () => {
        const params = {
            name: 'HelloWorld',
            isTS: true,
            techVer: { framework: '17.0.2' },
            props: [],
            useInlineSnapshot: true,
            usePretty: true,
        }
        const {specFileName, specCode} = createJest(params)
        expect(specFileName).to.equal('HelloWorld.spec.tsx')
        expect(specCode.join('\n')).to.equal(tsReact17)
  })

  it('JS + React18', () => {
        const params = {
            name: 'HelloWorld',
            isTS: false,
            className: 'hello-world',
            techVer: { framework: '18.0.0' },
        }
        const {specFileName, specCode} = createJest(params)
        expect(specFileName).to.equal('HelloWorld.spec.jsx')
        compareText(specCode, jsReact18)
  })

  it('TS + React18', () => {
    const params = {
      name: 'HelloWorld',
      className: 'hello-world',
      isTS: true,
      techVer: { framework: '18.0.0' },
      useInlineSnapshot: true,
      usePretty: false,
    }
    const {specFileName, specCode} = createJest(params)
    expect(specFileName).to.equal('HelloWorld.spec.tsx')
    compareText(specCode, tsReact18)
  })

  it('TS + React18 + MobX', () => {
    const {specFileName, specCode} = createJest({
      name: 'HelloWorld',
      isTS: true,
      techVer: { framework: '18.0.0' },
      useInlineSnapshot: true,
      usePretty: false,
      mobxClassName: 'HelloWorldStore',
      props: [{propName: 'store', isRequired: true, type: 'MobX store'}],
      mobx: { fields: [] },
    })
    expect(specFileName).to.equal('HelloWorld.spec.tsx')
    compareText(specCode, tsReact18_mobx)
  })

  it('TS + React18 + MobX with exported store', () => {
    const {specFileName, specCode} = createJest({
      name: 'HelloWorld',
      isTS: true,
      techVer: { framework: '18.0.0' },
      useInlineSnapshot: true,
      usePretty: false,
      mobxClassName: 'HelloWorldStore',
      mobxStoreName: 'helloWorldStore',
      props: [{propName: 'store', isRequired: true, type: 'MobX store'}],
    })
    expect(specFileName).to.equal('HelloWorld.spec.tsx')
    compareText(specCode, tsReact18_mobxStore)
  })
})

const jsReact17 =
`import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { HelloWorld } from "./HelloWorld";

describe ("HelloWorld", () => {
  let container = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    }
  });

  it("render", () => {
    act(() => {
      render(<HelloWorld name={"Peter"} />, container);
    });
    expect(container.innerHTML).toBe('<div class="hello-world"></div>');
  });
});`

const tsReact17 =
`import * as React from "react";
import pretty from "pretty";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { HelloWorld } from "./HelloWorld";

describe ("HelloWorld", () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    }
  });

  it("render", () => {
    act(() => {
      render(<HelloWorld />, container);
    });
    expect(container?.innerHTML).toBe('<div></div>');
  });

  it("inline snapshot", () => {
    act(() => {
      render(<HelloWorld />, container);
    });
    expect(
      pretty(container?.innerHTML || "").replace(/"/g, "'")
    ).toMatchInlineSnapshot();
  });
});`

const jsReact18 =
`import * as React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { HelloWorld } from "./HelloWorld";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("HelloWorld", () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement("div");
    root = createRoot(container);
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
      root = null;
      container = null;
    });
  });

  it("render", () => {
    act(() => {
      root.render(<HelloWorld />);
    });
    expect(container.innerHTML).toBe('<div class="hello-world"></div>');
  });
});`

const tsReact18 = 
`import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { HelloWorld } from "./HelloWorld";

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("HelloWorld", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    root = createRoot(container);
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
      root = null;
      container = null;
    });
  });

  it("render", () => {
    act(() => {
      root?.render(<HelloWorld />);
    });
    expect(container?.innerHTML).toBe('<div class="hello-world"></div>');
  });

  it("inline snapshot", () => {
    act(() => {
      root?.render(<HelloWorld />);
    });
    expect(
      (container?.innerHTML || "").replace(/"/g, "'")
    ).toMatchInlineSnapshot();
  });
});`

const tsReact18_mobx = 
`import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { HelloWorld } from "./HelloWorld";
import { HelloWorldStore } from "./HelloWorldStore";

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("HelloWorld", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    root = createRoot(container);
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
      root = null;
      container = null;
    });
  });

  it("render", () => {
    const store = new HelloWorldStore();
    act(() => {
      root?.render(<HelloWorld store={store} />);
    });
    expect(container?.innerHTML).toBe('<div></div>');
  });

  it("inline snapshot", () => {
    const store = new HelloWorldStore();
    act(() => {
      root?.render(<HelloWorld store={store} />);
    });
    expect(
      (container?.innerHTML || "").replace(/"/g, "'")
    ).toMatchInlineSnapshot();
  });
});`

const tsReact18_mobxStore = 
`import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { HelloWorld } from "./HelloWorld";
import { helloWorldStore } from "./HelloWorldStore";

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("HelloWorld", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    root = createRoot(container);
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
      root = null;
      container = null;
    });
  });

  it("render", () => {
    act(() => {
      root?.render(<HelloWorld store={helloWorldStore} />);
    });
    expect(container?.innerHTML).toBe('<div></div>');
  });

  it("inline snapshot", () => {
    act(() => {
      root?.render(<HelloWorld store={helloWorldStore} />);
    });
    expect(
      (container?.innerHTML || "").replace(/"/g, "'")
    ).toMatchInlineSnapshot();
  });
});`