import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type FragmentType, graphql, useFragment } from "@/graphql/__gen__";

export const BlogAuthorCardAuthorFragment = graphql(/* GraphQL */ `
  fragment BlogAuthorCard_AuthorFragment on User {
    id
    slug
    name
    firstName
    lastName
    description
    avatar(size: 160) {
      url
    }
  }
`);

interface BlogAuthorCardProps {
  author: FragmentType<typeof BlogAuthorCardAuthorFragment>;
}

function getInitials(firstName?: string | null, lastName?: string | null, name?: string | null) {
  if (firstName || lastName) {
    return `${firstName?.at(0) || ""}${lastName?.at(0) || ""}`.toUpperCase() || "VA";
  }

  return name?.slice(0, 2).toUpperCase() || "VA";
}

export function BlogAuthorCard({ author }: BlogAuthorCardProps) {
  const authorData = useFragment(BlogAuthorCardAuthorFragment, author);

  const hasFullName = Boolean(authorData.firstName || authorData.lastName);
  const fullName = hasFullName
    ? `${authorData.firstName || ""} ${authorData.lastName || ""}`.trim()
    : authorData.name;

  if (!fullName) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar className="h-16 w-16 border border-foreground/10">
          <AvatarImage src={authorData.avatar?.url || undefined} alt={fullName} />
          <AvatarFallback>{getInitials(authorData.firstName, authorData.lastName, fullName)}</AvatarFallback>
        </Avatar>

        <div className="space-y-2 ">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Autor</p>
          {authorData.slug ? (
            <Link href={`/blog/author/${authorData.slug}`} className="text-xl font-semibold hover:underline">
              {fullName}
            </Link>
          ) : (
            <p className="text-xl font-semibold">{fullName}</p>
          )}
          {authorData.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{authorData.description}</p>
          )}
          <br />
          {authorData.slug ? (
            <Link
              href={`/blog/author/${authorData.slug}`}
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Ver perfil e artigos do autor
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
