import { LuCircleAlert } from "react-icons/lu";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="auth-field-error" role="alert">
      <LuCircleAlert aria-hidden="true" size={15} />
      {message}
    </p>
  );
}
