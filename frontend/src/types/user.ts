export interface User {
  id: string | undefined | null;
  username: string | undefined | null;
  email: string | undefined | null;
  first_name: string | undefined | null;
  last_name: string | undefined | null;
  picture: string | undefined | null;
  onboarding_completed: boolean | undefined | null;
  social_profiles?: {
    [provider: string]: {
      picture?: string | null;
      locale?: string | null;
    };
  };
}