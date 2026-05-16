export interface Game {
    id?: string;
    uuid?: string;
    variant: 'standard';
    timeControl: string | 'unlimited';
    status: 'created' | 'ongoing' | 'finished';
    result: 'ongoing' | 'white_win' | 'black_win' | 'draw' | 'aborted';
    moves_count: number;
    current_fen: string;
    visiblity: 'public' | 'private';
    createdAt?: string;
    started_at?: string | null;
    finished_at?: string | null;
    termination_reason?: string | null;
    userId?: string;
}