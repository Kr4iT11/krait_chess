export type GameStatus = 'created' | 'ongoing' | 'finished';
export type GameResult = 'ongoing' | 'white_win' | 'black_win' | 'draw' | 'aborted';
export type TimeControl = 'unlimited' | 'bullet' | 'blitz' | 'rapid' | 'classical';
export type GameVisibility = 'public' | 'private';
export interface Game {
    id?: string;
    uuid?: string;
    variant: 'standard';
    timeControl: TimeControl;
    status: GameStatus;
    result: GameResult;
    moves_count: number;
    current_fen: string;
    visibility: GameVisibility;
    createdAt?: string;
    started_at?: string | null;
    finished_at?: string | null;
    termination_reason?: string | null;
    userId?: string;
}