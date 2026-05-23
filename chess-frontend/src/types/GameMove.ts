export interface GameMove {
    from: string;
    to: string;
    promotion?: string; // optional, used for pawn promotion
}