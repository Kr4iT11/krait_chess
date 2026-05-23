import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MoveDto {
    // @IsString()
    // @IsNotEmpty()
    // fen!: string;
    @IsString()
    @IsNotEmpty()
    from!: string;
    @IsString()
    @IsNotEmpty()
    to!: string;
    @IsString()
    @IsOptional()
    promotion?: string; // e.g., 'q' for queen, 'r' for rook, etc. Optional for non-pawn moves
}