export namespace GitHub {
  export type User = {
    login: string;
  };

  export type Reviewer = {
    login: string;
    id: number;
    avatar_url: string;
    gravatar_id: string;
  };

  export type PR = {
    id: string;
    html_url: string;
    number: string;
    title: string;
    state: string;
    created_at: string;
    closed_at: string | null;
    user: User;
    requested_reviewers: Reviewer[];
  };
}
