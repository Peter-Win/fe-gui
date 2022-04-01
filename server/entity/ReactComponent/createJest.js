const { getHiVersion } = require('../../sysUtils/versions')
const { makeComponentCall } = require('./makeComponentCall')


/**
 * Create code for Jest test
 * @param {Object} params
 * @param {string} params.name
 * @param {boolean} params.isTS
 * @param {string} params.className
 * @param {{framework?:string;}} params.techVer
 * @param {boolean} params.useInlineSnapshot
 * @param {boolean} params.usePretty
 * @param {{propName: string; isRequired: boolean; testValue?: string; }[]} params.props
 * @param {string} params.testRenderBody content of <div> in it('render')
 * @param {string?} params.styles css, less, module.css, module.less
 * @returns {{specFileName: string; specCode: string[];}}
 */
 const createJest = ({name, isTS, className, useInlineSnapshot, usePretty, props=[], techVer, testRenderBody='', styles=''}) => {
    const containerType = isTS ? `: HTMLDivElement | null` : ''
    const safe = isTS ? '?' : ''
    const classExpr = className ? ` class="${className}"` : ''
    const componentCall = makeComponentCall({name, props})

    const specCode17 = 
`import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { ${name} } from "./${name}";

describe ("${name}", () => {
  let container${containerType} = null;

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
      render(${componentCall}, container);
    });
    expect(container${safe}.innerHTML).toBe('<div${classExpr}>${testRenderBody}</div>');
  });
});`

    const rootType = isTS ? ': Root | null' : ''
    const rootImport = isTS ? ', Root' : ''
    const specCode18 =
`import * as React from "react";
import { createRoot${rootImport} } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { ${name} } from "./${name}";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("${name}", () => {
  let container${containerType} = null;
  let root${rootType} = null;

  beforeEach(() => {
    container = document.createElement("div");
    root = createRoot(container);
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root${safe}.unmount();
      root = null;
      container = null;
    });
  });

  it("render", () => {
    act(() => {
      root${safe}.render(${componentCall});
    });
    expect(container${safe}.innerHTML).toBe('<div${classExpr}>${testRenderBody}</div>');
  });
});`

    const isReact17 = getHiVersion(techVer.framework, 18) <= 17
    let specCode = (isReact17 ? specCode17 : specCode18).split('\n')

    if (isTS) {
        const pos = specCode.findIndex(row => row.startsWith('globalThis.'))
        if (pos >= 0) specCode.splice(pos, 0, `// @ts-ignore`)
    }

    const snapCode = `
  it("inline snapshot", () => {
    act(() => {
      ${isReact17 ? `render(${componentCall}, container)` : `root${safe}.render(${componentCall})`};
    });
    expect(
      ${usePretty ? 'pretty' : ''}(container?.innerHTML || "").replace(/"/g, "'")
    ).toMatchInlineSnapshot();
  });`

    if (useInlineSnapshot) {
        if (usePretty) {
            specCode.splice(1, 0, 'import pretty from "pretty";')
        }
        specCode = [...specCode.slice(0, -1), ...snapCode.split('\n'), ...specCode.slice(-1)]
    }

    return {
        specFileName: `${name}.spec.${isTS ? 'tsx' : 'jsx'}`, 
        specCode,
    }
}

module.exports = { createJest }