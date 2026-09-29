export interface Sede {
    id: number;
    name: string;
    description: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    _count: {
        licenses: number;
    };
}

export interface SedeConfig {
    name: string;
    description?: string | null;
    active?: boolean;
}
