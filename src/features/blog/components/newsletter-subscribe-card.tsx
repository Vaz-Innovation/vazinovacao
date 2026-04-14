import { FormEvent, useMemo, useState } from "react";

import {
  CREATE_USER_MUTATION,
  type CreateUserMutationData,
  type CreateUserMutationVariables,
} from "@/graphql/mutations/create-user.mutation";
import { executeRaw } from "@/graphql/execute";

interface NewsletterSubscribeCardProps {
  compact?: boolean;
}

function buildUsernameFromEmail(email: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "user"}-${suffix}`;
}

function generatePassword(): string {
  return `Vaz-${Math.random().toString(36).slice(2, 14)}!`;
}

function splitSubscriberName(fullName: string): {
  displayName?: string;
  firstName?: string;
  lastName?: string;
} {
  const normalized = fullName.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return {};
  }

  const [firstName, ...lastNameParts] = normalized.split(" ");

  return {
    displayName: normalized,
    firstName,
    lastName: lastNameParts.length > 0 ? lastNameParts.join(" ") : undefined,
  };
}

export function NewsletterSubscribeCard({
  compact = false,
}: NewsletterSubscribeCardProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cardClasses = useMemo(
    () =>
      compact
        ? "bg-card rounded-xl overflow-hidden border-2 border-dashed border-primary/30 p-6"
        : "mt-16 pt-8 border-t border-foreground/10 text-center",
    [compact],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    const trimmedEmail = email.trim();

    const nameParts = splitSubscriberName(name);

    const variables: CreateUserMutationVariables = {
      username: buildUsernameFromEmail(trimmedEmail),
      password: generatePassword(),
      email: trimmedEmail,
      displayName: nameParts.displayName,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
    };

    if (!variables.email) {
      setError("Informe um e-mail válido.");
      setLoading(false);
      return;
    }

    try {
      const data = await executeRaw<CreateUserMutationData>(
        CREATE_USER_MUTATION,
        variables,
      );

      if (!data.createUser?.user?.id) {
        throw new Error("Não foi possível cadastrar este e-mail.");
      }

      setFeedback("Inscrição confirmada. Obrigado por acompanhar.");
      setEmail("");
      setName("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível concluir sua inscrição agora.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardClasses}>
      <h3 className="text-xl font-normal mb-2">Gostou? Receba mais conteúdos como este</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Insights semanais sobre tecnologia e inovação.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-3 text-left">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome (opcional)"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Seu melhor e-mail"
          required
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-foreground text-background px-4 py-2 text-sm disabled:opacity-70"
        >
          {loading ? "Enviando..." : "Quero receber novidades"}
        </button>
      </form>

      {feedback && <p className="mt-4 text-sm text-foreground">{feedback}</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
