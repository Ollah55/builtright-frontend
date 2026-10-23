import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./passwordInput.css";

export default function PasswordInput({ className = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={`password-input-shell ${className}`.trim()}>
      <input {...inputProps} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-visibility-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
      </button>
    </span>
  );
}
