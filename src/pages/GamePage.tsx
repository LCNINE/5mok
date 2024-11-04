import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";

interface GameState {
  board: string[];
  currentTurn: "black_player" | "white_player";
}

export default function GamePage() {
  const location = useLocation();
  const { user, gameId } = location.state as { user: { id: string }; gameId: number };
  const [gameState, setGameState] = useState<GameState>({
    board: Array(225).fill(""),
    currentTurn: "black_player",
  });
  const [players, setPlayers] = useState<{ black: string; white: string | null }>({ black: "", white: null });
  const [gameTitle, setGameTitle] = useState<string>("");
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  useEffect(() => {
    async function fetchGame() {
      const { data, error } = await supabase.from("games").select("*").eq("id", gameId).single();
      if (error) {
        console.error("게임 불러오기 에러:", error);
        return;
      }
      setPlayers({ black: data.black_player, white: data.white_player });
    //   console.log(data, players)
      setGameTitle(data.title);
    }
    fetchGame();

   
  }, [gameState, gameId]);

//   마우스호버
  function handleMouseEnter(position: number) {
    setHoverPosition(position);
  }

//   마우스떠남
  function handleMouseLeave() {
    setHoverPosition(null);
  }

// 클릭
  async function handleMove(position: number) {
    if (
      gameState.board[position] || 
      (gameState.currentTurn === "black_player" && players.black !== user.id) || 
      (gameState.currentTurn === "white_player" && players.white !== user.id)
    ) {
      return;
    }

    const currentStone = gameState.currentTurn === "black_player" ? "흑" : "백";
    const newBoard = [...gameState.board];
    newBoard[position] = currentStone;
    const newTurn = gameState.currentTurn === "black_player" ? "white_player" : "black_player";

    //보드를 차례로 업데이트
    setGameState({ board: newBoard, currentTurn: newTurn });

    supabase.from("moves")
    .insert([{ game_id: gameId, position, move_order: newBoard.filter((cell) => cell).length }])
    .then(({ error }) => {
      if (error) {
        console.error("moves insert오류:", error);
        console.log(gameId, position, newBoard.filter((cell) => cell).length)
      } else {
      
        if (checkWin(position, newBoard)) {
          alert(`${currentStone} 승리!`);
        }
      }
    })
  
  }

  function checkWin(position: number, board: string[]) {
    const directions = [
      [1, -1],
      [15, -15],
      [14, -14],
      [16, -16],
    ];

    const playerStone = board[position];
    for (const [step, negStep] of directions) {
      let count = 1;
      for (const dir of [step, negStep]) {
        let pos = position + dir;
        while (pos >= 0 && pos < board.length && board[pos] === playerStone) {
          count++;
          pos += dir;
        }
      }
      if (count >= 5) return true;
    }
    return false;
  }

  return (
    <div className="p-4">
      <h2>오목 게임 - {gameTitle}</h2>
      <p>게임 ID: {gameId}</p>
      <p>현재 차례: {gameState.currentTurn === "black_player" ? "흑" : "백"}</p>
      
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: "repeat(15, 32px)",
        }}
      >
        {gameState.board.map((cell, index) => (
          <div
            key={index}
            onClick={() => handleMove(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            style={{ width: "32px", height: "32px" }}
            className={`flex items-center justify-center border ${
              cell === "흑"
                ? "bg-black"
                : cell === "백"
                ? "bg-white"
                : hoverPosition === index
                ? gameState.currentTurn === "black_player"
                  ? "bg-black opacity-50"
                  : "bg-white opacity-50"
                : "bg-gray-200"
            }`}
          >
            {cell && <span className="text-xs">{cell}</span>}
          </div>
        ))}
      </div>

      <Button onClick={() => window.history.back()} className="mt-4">
        나가기
      </Button>
    </div>
  );
}
