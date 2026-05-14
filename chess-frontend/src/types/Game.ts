export interface Game {
    id: string;
    uuid: string;
    variant: 'standard';
    timeControl: 'unlimited';
    status: 'created' | 'ongoing' | 'finished';
    result: 'ongoing' | 'white_win' | 'black_win' | 'draw';
    movesCount: number;
    currentFen: string;
    visibility: 'public' | 'private';
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    terminationReason: string | null;
}