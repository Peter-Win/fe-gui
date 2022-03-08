/**
 * FormDemo component contains a form, two input fields (login and password) and a submit button.
 * The form validates the input fields: the submit button enable only if both fields are not empty.
 */
import * as React from "react";

export interface FormDemoData {
  login: string;
  password: string;
}

interface PropsFormDemo {
  name: string;
  initialData?: FormDemoData;
  onSubmit(data: FormDemoData): void;
}

export const FormDemo: React.FC<PropsFormDemo> = ({
  name,
  initialData = { login: "", password: "" },
  onSubmit,
}: PropsFormDemo) => {
  const validate = (content: FormDemoData) =>
    !!content.login && !!content.password;
  const [data, setData] = React.useState<FormDemoData>(initialData);
  const [isValid, setValid] = React.useState(validate(initialData));
  const update = (newData: Partial<FormDemoData>) => {
    setData((prev) => {
      const combined = { ...prev, ...newData };
      setValid(validate(combined));
      return combined;
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };
  return (
    <form name={name} onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="login"
          placeholder="Login"
          value={data.login}
          onChange={(e) => update({ login: e.target.value })}
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => update({ password: e.target.value })}
        />
      </div>
      <div>
        <button type="submit" disabled={!isValid}>
          Accept
        </button>
      </div>
    </form>
  );
};

FormDemo.defaultProps = {
  initialData: undefined,
};
