import { useGame } from '../state/GameContext';
import BoardView from './BoardView';

const Board = () => {
  const { boardRotation } = useGame();

  return (
    <div className="board-container">
      <BoardView boardRotation={boardRotation} />
      {/* Aqui serão adicionados futuramente os peões dos jogadores usando o estado de 'players' */}
    </div>
  );
};

export default Board;
