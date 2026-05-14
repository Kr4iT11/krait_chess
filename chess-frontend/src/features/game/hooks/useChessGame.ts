import { useState, useRef } from "react";
import { Chess } from "chess.js";
import { createGame } from "../api/gameApi";
import type { Game } from "../../../types/Game";


export const useChessGame = () => {
    const chessGameRef = useRef(new Chess());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chessGame = chessGameRef.current;
    const [chessPosition, setChessPosition] = useState(chessGame.fen());

    const startGame = async (payload: Game) => {
        try {
            setLoading(true);
            setError(null);
            payload.variant = 'standard';
            payload.timeControl = 'unlimited';
            payload.status = 'created';
            payload.result = 'ongoing';
            payload.visibility = 'public';
            
            const response = await createGame(payload);
            return response;
        } catch (err) {
            throw err;
        }
        finally { 
            setLoading(false);
        }
    };
    return {
        chessGame
        , chessPosition
        , setChessPosition
    }

}