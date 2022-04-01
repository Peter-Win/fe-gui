const {expect} = require('chai')
const {createReactComponent} = require('./ReactComponent.utils')

const indexCode = `export * from "./MyComponent";`

const simpleJS = `import * as React from "react";

export const MyComponent = () => (
  <div></div>
);`

const simpleJSwithReturn = `import * as React from "react";

export const MyComponent = () => {
  return <div></div>;
};`

const simpleTS = `import * as React from "react";

export const MyComponent: React.FC = () => (
  <div></div>
);`

const TSXwithRequiredName = `import * as React from "react";

interface PropsMyComponent {
  name: string;
}

export const MyComponent: React.FC<PropsMyComponent> = ({ name }: PropsMyComponent) => (
  <div></div>
);`

const JSXwithRequiredName = `import * as React from "react";
import PropTypes from "prop-types";

export const MyComponent = ({ name }) => (
  <div></div>
);

MyComponent.propTypes = {
  name: PropTypes.string.isRequired,
};`

const JSXwithDefaultName = `import * as React from "react";
import PropTypes from "prop-types";

export const MyComponent = ({ name }) => (
  <div></div>
);

MyComponent.propTypes = {
  name: PropTypes.string,
};

MyComponent.defaultProps = {
  name: 'World',
};`

const simpleJSWithCSS = `import * as React from "react";
import "./MyComponent.css";

export const MyComponent = () => (
  <div className="my-component"></div>
);`

describe('createReactComponent', () => {
    it('Most simple', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            props: [],
            tech: { language: 'JavaScript' },
        }
        const res = createReactComponent(params)
        expect(res.folders).have.lengthOf(0)
        expect(res.files).have.lengthOf(1)
        expect(res.files[0].name).to.equal('MyComponent.jsx')
        expect(res.files[0].data).to.equal(simpleJS)
    })

    it('Simple JSX with create a folder', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            props: [],
            tech: { language: 'JavaScript'},
            createFolder: true,
        }
        const res = createReactComponent(params)
        expect(res.folders).to.deep.equal(['MyComponent'])
        expect(res.files).have.lengthOf(2)
        expect(res.files[0].name).to.equal('MyComponent/MyComponent.jsx')
        expect(res.files[0].data).to.equal(simpleJS)
        expect(res.files[1].name).to.equal('MyComponent/index.js')
        expect(res.files[1].data).to.equal(indexCode)
    })

    it('JSX with return', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            useReturn: true,
            props: [],
            tech: { language: 'JavaScript' },
        }
        const res = createReactComponent(params)
        expect(res.folders).have.lengthOf(0)
        expect(res.files).have.lengthOf(1)
        expect(res.files[0].name).to.equal('MyComponent.jsx')
        expect(res.files[0].data).to.equal(simpleJSwithReturn)
    })

    it('Simple TSX', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            props: [],
            tech: { language: 'TypeScript' },
        }
        const res = createReactComponent(params)
        expect(res.folders).have.lengthOf(0)
        expect(res.files).have.lengthOf(1)
        expect(res.files[0].name).to.equal('MyComponent.tsx')
        expect(res.files[0].data).to.equal(simpleTS)
    })

    it('JSX with required name', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            props: [
                { propName: 'name', isRequired: true, type: 'string' }
            ],
            tech: { language: 'JavaScript' },
        }
        const res = createReactComponent(params)
        expect(res.folders).have.lengthOf(0)
        expect(res.files).have.lengthOf(1)
        expect(res.files[0].name).to.equal('MyComponent.jsx')
        expect(res.files[0].data).to.equal(JSXwithRequiredName)
    })

    it('TSX with required name', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            props: [
                { propName: 'name', isRequired: true, type: 'string' }
            ],
            tech: { language: 'TypeScript' },
        }
        const res = createReactComponent(params)
        expect(res.folders).have.lengthOf(0)
        expect(res.files).have.lengthOf(1)
        expect(res.files[0].name).to.equal('MyComponent.tsx')
        expect(res.files[0].data).to.equal(TSXwithRequiredName)
    })

    it('JSX with CSS', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            styles: 'css',
            props: [],
            tech: { language: 'JavaScript' },
        }
        const res = createReactComponent(params)
        expect(res.files).have.lengthOf(3)
        expect(res.folders).have.lengthOf(1)
        expect(res.folders[0]).to.equal('MyComponent')
        expect(res.files[0].name).to.equal('MyComponent/MyComponent.jsx')
        expect(res.files[0].data).to.equal(simpleJSWithCSS)
        expect(res.files[1].name).to.equal('MyComponent/MyComponent.css')
        expect(res.files[1].data).to.equal(`.my-component {\n  margin: 0;\n}`)
        expect(res.files[2].name).to.equal('MyComponent/index.js')
        expect(res.files[2].data).to.equal(`export * from "./MyComponent";`)
    })

    it('JSX with default value', () => {
        const params = {
            folder: 'src/components',
            name: 'MyComponent',
            props: [{ propName: 'name', isRequired: false, type: 'string', defaultValue: "'World'"}],
            tech: { language: 'JavaScript'},
        }
        const res = createReactComponent(params)
        expect(res.folders).have.lengthOf(0)
        expect(res.files).have.lengthOf(1)
        expect(res.files[0].name).to.equal('MyComponent.jsx')
        expect(res.files[0].data).to.equal(JSXwithDefaultName)
    })

    it('TSX with Jest', () => {
      const params = {
        folder: 'src/components',
        name: 'HelloWorld',
        tech: { language: 'TypeScript'},
        techVer: { framework: '17.0.2' },
        props: [],
        useJest: true,
      }
      const res = createReactComponent(params)
      expect(res.folders).is.deep.equal(['HelloWorld'])
      expect(res.files).have.lengthOf(3)
      expect(res.files[0].name).to.equal('HelloWorld/HelloWorld.tsx')
      expect(res.files[1].name).to.equal('HelloWorld/HelloWorld.spec.tsx')
      expect(res.files[2].name).to.equal('HelloWorld/index.ts')
      const needSpec = `import * as React from "react";
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
});`.split('\n')
      const actualSpec = res.files[1].data.split('\n')
      for (const i in actualSpec) {
        expect(actualSpec[i]).to.equal(needSpec[i], `in line ${+i+1}`)
      }
    })
})
