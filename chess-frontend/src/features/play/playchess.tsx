import React, { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js'

import ChessBoardView from '../../components/chessboard/chessboard';
const PlayChess: React.FC = () => {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;
    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    useEffect(() => {
            console.log("Chess game initialized with position:", chessPosition);
        }, []);
    return (
        <>
            <div className="col-span-12 xl:col-span-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <h4 className="mb-4 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        Play
                    </h4>

                    {/* Load your chess UI here */}
                    {/* <ChessUI /> */}
                    <div className="flex items-center justify-center h-[930px] text-gray-400">
                        <ChessBoardView
                            position={chessPosition }
                            boardOrientation="white"
                            arePiecesDraggable={true}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
export default PlayChess;
