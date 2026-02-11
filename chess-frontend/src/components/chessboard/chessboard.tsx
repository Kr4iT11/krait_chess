import { Chessboard } from 'react-chessboard';

const ChessBoardView = ({
    position,
    onPieceDrop,
    boardOrientation = "white",
    arePiecesDraggable = true
}: {
    position: any;
    onPieceDrop?: any;
    boardOrientation?: "white" | "black";
    arePiecesDraggable?: boolean;
}) => {

    const chessBoardOptions = {
        position: position,
        onPieceDrop: onPieceDrop,
        boardOrientation: boardOrientation,
        arePiecesDraggable: arePiecesDraggable
    }
    return (
        <Chessboard options={chessBoardOptions} />
    );
}

export default ChessBoardView;