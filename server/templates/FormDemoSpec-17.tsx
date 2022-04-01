import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import pretty from "pretty";
import { FormDemo } from "./FormDemo";

describe("FormDemo", () => {
  let container: HTMLDivElement | null = null;

  const getElement = <T extends HTMLElement>(selector: string): T | null =>
    container?.querySelector(selector) as (T | null);

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

  it("empty form", () => {
    const onSubmit = jest.fn();
    act(() => {
      render(<FormDemo name="empty" onSubmit={onSubmit} />, container);
    });

    const login = getElement<HTMLInputElement>("input[name=login]");
    expect(login?.value).toBe("");

    const password = getElement<HTMLInputElement>("input[name=password]");
    expect(password?.value).toBe("");

    const submit = getElement<HTMLButtonElement>("button[type=submit]");
    expect(submit?.disabled).toBe(true);
  });

  it("form with initial data", () => {
    const onSubmit = jest.fn();
    act(() => {
      render(
        <FormDemo
          name="filled"
          onSubmit={onSubmit}
          initialData={{ login: "user", password: "mypass" }}
        />,
        container
      );
    });

    const login = getElement<HTMLInputElement>("input[name=login]");
    expect(login?.value).toBe("user");

    const password = getElement<HTMLInputElement>("input[name=password]");
    expect(password?.value).toBe("mypass");

    const submit = getElement<HTMLButtonElement>("button[type=submit]");
    expect(submit?.disabled).toBe(false);
  });

  it("form events", () => {
    const onSubmit = jest.fn();
    act(() => {
      render(<FormDemo name="empty" onSubmit={onSubmit} />, container);
    });

    const login = getElement<HTMLInputElement>("input[name=login]");
    expect(login?.value).toBe("");

    const password = getElement<HTMLInputElement>("input[name=password]");
    expect(password?.value).toBe("");

    const submit = getElement<HTMLButtonElement>("button[type=submit]");
    expect(submit?.disabled).toBe(true);

    act(() => {
      submit?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // this click have no effect because form is not valid with empty fields
    expect(onSubmit).toHaveBeenCalledTimes(0);

    // fill form fields
    act(() => {
      login?.setAttribute("value", "test");
      login?.dispatchEvent(new InputEvent("input", { bubbles: true }));
      password?.setAttribute("value", "123");
      password?.dispatchEvent(new InputEvent("input", { bubbles: true }));
    });
    expect(submit?.disabled).toBe(false);

    act(() => {
      // this click going to submit
      submit?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
      render(
        <FormDemo
          name="inline"
          initialData={{ login: "test_login", password: "test_password" }}
          onSubmit={onSubmit}
        />,
        container
      );
    });
    expect(pretty(container?.innerHTML || "").replace(/"/g, "'"))
      .toMatchInlineSnapshot();
  });
});
