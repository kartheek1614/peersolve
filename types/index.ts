export interface User {
  id: string;
  email: string;
  anon_name: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
  // Joined from users table
  anon_name?: string;
  // Computed
  reply_count?: number;
  user_has_voted?: boolean;
}

export interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined
  anon_name?: string;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
}
