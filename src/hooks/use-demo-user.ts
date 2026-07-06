"use client";

import { useEffect, useState } from "react";

interface DemoProfile {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export function useDemoUser() {
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/demo/users")
      .then((r) => r.json())
      .then((data) => {
        const users = data.users ?? [];
        const current = users.find((u: { isCurrent?: boolean }) => u.isCurrent) ?? users[0];
        if (current) {
          setProfile({
            name: current.name,
            email: current.email,
            avatarUrl: current.avatarUrl,
          });
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  return { isLoaded: loaded, profile };
}
