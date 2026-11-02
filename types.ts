export type Choice = "A" | "B" | "C";

export type Round = {
  id: string;
  code: string;
  title: string | null;
  group_sizes: Record<string, number>;
  created_at: string;
};

export type StudentProfile = {
  id: string;
  round_id: string;
  group_number: number;
  initials: string;
  updated_at: string;
};

export type ResponseRow = {
  id: string;
  round_id: string;
  user_id: string;
  group_number: number;
  aspect_key: string;
  current_choice: Choice;
  desired_choice: Choice;
  submitted_at: string;
};

export type GroupDecision = {
  id: string;
  round_id: string;
  group_number: number;
  aspect_key: string;
  selected_choice: Choice;
  updated_at: string;
};

export type ActionPlan = {
  id: string;
  round_id: string;
  group_number: number;
  aspect_key: string;
  decision_choice: Choice;
  what_text: string;
  how_text: string;
  where_text: string;
  when_text: string;
  who_text: string;
  scrum_owner: string;
  updated_at: string;
};
