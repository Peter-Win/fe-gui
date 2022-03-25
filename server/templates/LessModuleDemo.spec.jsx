import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import {LessModuleDemo} from "./LessModuleDemo";

describe("LessModuleDemo", () => {
    let container<%= containerType %> = null;

    beforeEach(() => {
        // setup a DOM element as a render target
        container = document.createElement("div");
        document.body.appendChild(container);
    });
    
    afterEach(() => {
        // cleanup on exiting
        if (container) {
          unmountComponentAtNode(container);
          container.remove();
          container = null;
        }
    });
    
    it("test text", () => {
        act(() => {
            render(<LessModuleDemo />, container);
        });
      
        expect(container<%= safe %>.querySelector("div")<%= safe %>.innerHTML).toBe("<div>LESS Module demo</div>")
    })
})