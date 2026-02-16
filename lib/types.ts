export type Role = 'student' | 'admin' | 'mentor';

export interface Profile {
    id: string;
    email: string;
    role: Role;
    created_at: string;
    full_name?: string;
    avatar_url?: string;
}

export interface MarketUpdate {
    id: string;
    title: string;
    content: string;
    author_id: string;
    created_at: string;
    tags: string[];
}

export interface Roadmap {
    id: string;
    student_id: string;
    title: string;
    steps: RoadmapStep[];
}

export interface RoadmapStep {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed';
}
