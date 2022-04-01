import * as React from "react";
import pretty from "pretty";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { FormDemo } from "./FormDemo";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("FormDemo", () => {
  let container = null;
  let root = null;

  const getElement = (selector) => container.querySelector(selector);

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

  it("empty form", () => {
    const onSubmit = jest.fn();
    act(() => {
      root.render(<FormDemo name="empty" onSubmit={onSubmit} />);
    });

    const login = getElement("input[name=login]");
    expect(login.value).toBe("");

    const password = getElement("input[name=password]");
    expect(password.value).toBe("");

    const submit = getElement("button[type=submit]");
    expect(submit.disabled).toBe(true);
  });

  it("form with initial data", () => {
    const onSubmit = jest.fn();
    act(() => {
      root.render(
        <FormDemo
          name="filled"
          onSubmit={onSubmit}
          initialData={{ login: "user", password: "mypass" }}
        />
      );
    });

    const login = getElement("input[name=login]");
    expect(login.value).toBe("user");

    const password = getElement("input[name=password]");
    expect(password.value).toBe("mypass");

    const submit = getElement("button[type=submit]");
    expect(submit.disabled).toBe(false);
  });

  it("form events", () => {
    const onSubmit = jest.fn();
    act(() => {
      root.render(<FormDemo name="empty" onSubmit={onSubmit} />);
    });

    const login = getElement("input[name=login]");
    expect(login.value).toBe("");

    const password = getElement("input[name=password]");
    expect(password.value).toBe("");

    const submit = getElement("button[type=submit]");
    expect(submit.disabled).toBe(true);

    act(() => {
      submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // this click have no effect because form is not valid with empty fields
    expect(onSubmit).toHaveBeenCalledTimes(0);

    // fill form fields
    act(() => {
      login.setAttribute("value", "test");
      login.dispatchEvent(new InputEvent("input", { bubbles: true }));
      password.setAttribute("value", "123");
      password.dispatchEvent(new InputEvent("input", { bubbles: true }));
    });
    expect(submit.disabled).toBe(false);

    act(() => {
      // this click going to submit
      submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({
      login: "test",
      password: "123",
    });
  });

  it("Inline snapshot", () => {
    const onSubmit = jest.fn();
    act(() => {
      root.render(
        <FormDemo
          name="inline"
          initialData={{ login: "test_login", password: "test_password" }}
          onSubmit={onSubmit}
        />
      );
    });
    expect(pretty(container.innerHTML || "").replace(/"/g, "'"))
      .toMatchInlineSnapshot();
  });
});
