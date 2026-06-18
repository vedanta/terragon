import { type Person } from "@/fixtures/seed";

export function Avatar({
  person,
  size = 20,
}: {
  person: Person;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: person.color,
        fontSize: size * 0.42,
      }}
      title={person.name}
    >
      {person.initials}
    </span>
  );
}
