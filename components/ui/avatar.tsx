"use client";

import Image from "next/image";
import { useState } from "react";
import { type Person } from "@/fixtures/seed";

export function Avatar({
  person,
  size = 20,
}: {
  person: Person;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);

  if (person.avatarUrl && !errored) {
    return (
      <Image
        src={person.avatarUrl}
        alt={person.name}
        title={person.name}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

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
