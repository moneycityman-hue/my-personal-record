export type ImportantLink = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
};

export type ImportantLinkInput = {
  title: string;
  url: string;
};
