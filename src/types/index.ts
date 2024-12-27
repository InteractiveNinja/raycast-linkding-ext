export interface Preferences {
  showSubtitle: boolean;
  showFavicon: boolean;
  subtitleSource: SubtitleSource;
}

export enum SubtitleSource {
  DESCRIPTION = "description",
  NOTE = "note",
}

export interface LinkdingBookmark {
  id: number;
  url: string;
  title: string;
  description?: string;
  notes?: string;
  website_title?: string;
  website_description?: string;
  favicon_url?: string;
  tag_names: string[];
}

export interface GetLinkdingBookmarkResponse {
  count: number;
  results: LinkdingBookmark[];
}

export interface LinkdingAccount {
  serverUrl: string;
  apiKey: string;
  ignoreSSL: boolean;
}

export interface LinkdingAccountForm extends LinkdingAccount {
  name?: string;
}

export type LinkdingAccountMap = { [name: string]: LinkdingAccount };

export interface WebsiteMetadata {
  title: string;
  description?: string;
}

export interface PostLinkdingBookmarkPayload {
  url: string;
  title: string;
  description: string;
  notes: string;
  is_archived: boolean;
  unread: boolean;
  shared: boolean;
  tag_names: string[];
}
