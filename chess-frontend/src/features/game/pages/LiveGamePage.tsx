import React, { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js'
import ChessBoard from '../components/ChessBoard';
import { getGameByUuid, movePiece } from '../api/gameApi';
import { useParams } from 'react-router-dom';
import type { PieceDropHandlerArgs } from 'react-chessboard';
import type { GameMove } from '../../../types/GameMove';

const LiveGamePage: React.FC = () => {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;
    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [playerSide, setPlayerSide] = useState<'white' | 'black'>('white');


    const gameId = useParams();

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const data = await getGameByUuid(gameId.gameId!);
                if (data && data.currentFen) {
                    console.log("Fetched game data:", data);
                    chessGame.load(data.currentFen);
                    setChessPosition(data.currentFen);
                    setPlayerSide(data.gamePlayers[0].side);
                } else {
                    console.log("Invalid game data received:", data);
                }
            } catch (error) {
                console.log("Error fetching game data:", error);
            }
        };
        fetchGameData();
    }, [gameId]);

    // Implement Drag and Drop and Square click in future

    const onPieceDrop = async ({
        sourceSquare,
        targetSquare
    }: PieceDropHandlerArgs) => {

        if (!targetSquare) {
            return false; // Invalid move if targetSquare is not defined
        }
        try {
            // Attempt to make the move on the chess game instance
            // from and to are in algebraic notation (e.g., 'e2', 'e4')
            const moves: GameMove = {
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // always promote to a queen for example simplicity
            }
            const localMove = chessGame.move(moves);
            if (!localMove) {
                return false; // Invalid move according to chess rules
            }
            const result = await moveChessPiece(gameId.gameId!, moves);
            chessGame.load(result.currentFen);
            setChessPosition(result.currentFen);
            console.log("Move made, new FEN:", result.currentFen);
            // return true as the move was successful
            return true;
        } catch {
            // return false as the move was not successful
            return false;
        }
    };

    const moveChessPiece = async (uuid: string, moves: GameMove) => {
        try {
            const response = await movePiece(uuid, moves);
            return response;
        } catch (error) {
            console.log("Error fetching game data:", error);
        }
    };

    return (
        <>
            <div className="col-span-12 xl:col-span-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <h4 className="mb-4 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        Play
                    </h4>

                    <div className="flex items-center justify-center w-full">
                        <ChessBoard
                            position={chessPosition}
                            boardOrientation={playerSide}
                            arePiecesDraggable={true}
                            onPieceDrop={onPieceDrop}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
export default LiveGamePage;
