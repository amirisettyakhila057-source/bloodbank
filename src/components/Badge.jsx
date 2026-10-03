import { toneFor } from '../utils/format';

/** Status pill. Pass `tone` explicitly or let it be derived from the text. */
export default function Badge({ children, tone }) {
  return (
    <span className={`badge badge-${tone || toneFor(children)}`}>
      <span className="badge-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export function BloodGroupTag({ group }) {
  return <span className="blood-tag">{group}</span>;
}
