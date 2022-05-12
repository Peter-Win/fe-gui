const { getHiVersion } = require('../../sysUtils/versions')
const { makeComponentCall } = require('./makeComponentCall')
const { newMobxInstance } = require('./newMobxInstance')

/**
 * Create code for Jest test
 * @param {Object} params
 * @param {string} params.name
 * @param {boolean} params.isTS
 * @param {boolean} params.isReactTestingLibrary
 * @param {string} params.className
 * @param {{framework?:string;}} params.techVer
 * @param {boolean} params.useInlineSnapshot
 * @param {boolean} params.usePretty
 * @param {{propName: string; isRequired: boolean; testValue?: string; }[]} params.props
 * @param {string} params.testRenderBody content of <div> in it('render')
 * @param {string?} params.styles css, less, module.css, module.less
 * @param {string?} params.mobxStoreName
 * @param {string?} params.mobxClassName
 * @returns {{specFileName: string; specCode: string[];}}
 */
const createJest = ({name, isTS, className, useInlineSnapshot, usePretty, props=[], techVer,
  isReactTestingLibrary,
  testRenderBody='', styles='',
  mobxClassName, mobxStoreName, mobx,
}) => {
  const containerType = isTS ? `: HTMLDivElement | null` : ''
  const safe = isTS ? '?' : ''
  const classExpr = className ? ` class="${className}"` : ''
  const componentCallSrc = makeComponentCall({name, props, mobxStoreName: mobxStoreName || 'store' })
  const ccList = componentCallSrc.split('\n')
  const componentCall = ccList.length === 1 ? componentCallSrc :
    ccList.map((row, i) => i === 0 ? row : `      ${row}`).join('\n')
  const children = props.find(({propName}) => propName === 'children')
  const renderBody = testRenderBody || (children ? children.testValue : '')

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
    expect(container${safe}.innerHTML).toBe('<div${classExpr}>${renderBody}</div>');
  });
});`

    const specCodeRTL = 
`import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ${name} } from "./${name}";

describe ("${name}", () => {
  it("render", () => {
    const { container } = render(${componentCall});
    expect(container${safe}.innerHTML).toBe('<div${classExpr}>${renderBody}</div>');
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
    expect(container${safe}.innerHTML).toBe('<div${classExpr}>${renderBody}</div>');
  });
});`

    let specCode = []

    if (isReactTestingLibrary) {
      specCode = specCodeRTL.split('\n')
    } else {
      const isReact17 = getHiVersion(techVer.framework, 18) <= 17
      specCode = (isReact17 ? specCode17 : specCode18).split('\n')  
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
    }


    if (mobxClassName) {
      const ipos = specCode.findIndex(row => row.startsWith(`import { ${name} }`))
      if (ipos >= 0) {
        specCode.splice(ipos+1, 0, `import { ${mobxStoreName || mobxClassName} } from "./${mobxClassName}";`)
      }
      if (!mobxStoreName) {
        for (let i=0; i<specCode.length; i++) {
          if (specCode[i].trim().startsWith('it("')) {
            const spaceArray = /^(\s*)/.exec(specCode[i+1])
            const space = spaceArray ? spaceArray[0] : ''
            const line = `${space}const store = ${newMobxInstance({ mobxClassName, mobx })};`
            specCode.splice(i+1, 0, line)
          }
        }
      }
    }

    return {
        specFileName: `${name}.spec.${isTS ? 'tsx' : 'jsx'}`, 
        specCode,
    }
}

module.exports = { createJest }