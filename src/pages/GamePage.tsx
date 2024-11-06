import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameState {
  currentTurn: "black_player" | "white_player";
}

interface Move {
  game_id: number;
  position: number;
  move_order: number;
}

interface TimeState {
  timeLeft: number;
}

const TURN_TIME = 60; // 턴 당 60초

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const gameIdNumber = parseInt(gameId as string, 10);
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>({
    currentTurn: "black_player",
  });
  const [players, setPlayers] = useState<{
    black: string;
    white: string | null;
  }>({
    black: "",
    white: null,
  });
  const [gameTitle, setGameTitle] = useState<string>("");
  const [moves, setMoves] = useState<Move[]>([]);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [userStone, setUserStone] = useState<string>("");
  
  const [blackTime, setBlackTime] = useState<TimeState>({
    timeLeft: TURN_TIME
  });
  const [whiteTime, setWhiteTime] = useState<TimeState>({
    timeLeft: TURN_TIME
  });

  // moves 배열로 board 계산
  const board = useMemo(() => {
    const newBoard = Array(225).fill("");
    moves.forEach((move) => {
      const stone = move.move_order % 2 === 1 ? "흑" : "백";
      newBoard[move.position] = stone;
    });
    return newBoard;
  }, [moves]);

  const getMoveAtPosition = (position: number) => {
    return moves.find(move => move.position === position);
  };

  // 타이머
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (gameState.currentTurn) {
      const setTime = gameState.currentTurn === "black_player" 
        ? setBlackTime 
        : setWhiteTime;

      intervalId = setInterval(() => {
        setTime(prev => {
          if (prev.timeLeft > 0) {
            return { timeLeft: prev.timeLeft - 1 };
          } else {
            // 시간 초과 시 다음 차례로
            setGameState(current => ({
              currentTurn: current.currentTurn === "black_player" 
                ? "white_player" 
                : "black_player"
            }));
            clearInterval(intervalId);
            return prev;
          }
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameState.currentTurn]);

  // 턴 변경 시 시간 리셋
  useEffect(() => {
    if (gameState.currentTurn === "black_player") {
      setBlackTime({ timeLeft: TURN_TIME });
    } else {
      setWhiteTime({ timeLeft: TURN_TIME });
    }
  }, [gameState.currentTurn]);

  useEffect(() => {
    async function fetchGameData() {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) {
          console.error("사용자 정보를 불러올 수 없습니다.");
          navigate("/auth/sign-in");
          return;
        }

        if (!gameIdNumber) {
          console.error("유효하지 않은 게임 ID입니다.");
          navigate("/");
          return;
        }

        // 게임 데이터 조회
        const { data: gameData, error: gameError } = await supabase
          .from("games")
          .select("*")
          .eq("id", gameIdNumber)
          .single();
        
        if (gameError) throw gameError;

        setPlayers({
          black: gameData.black_player,
          white: gameData.white_player,
        });
        setGameTitle(gameData.title);
        setUserStone(user.id === gameData.black_player ? "흑" : "백");

        // moves 데이터 조회
        const { data: movesData, error: movesError } = await supabase
          .from("moves")
          .select("*")
          .eq("game_id", gameIdNumber)
          .order("move_order", { ascending: true });
        
        if (movesError) throw movesError;

        setMoves(movesData || []);
        
        const nextTurn = (movesData?.length ?? 0) % 2 === 0 
          ? "black_player" 
          : "white_player";
        setGameState({ currentTurn: nextTurn });

      } catch (error) {
        console.error("게임 데이터 로딩 중 오류:", error);
        alert("게임을 불러오는데 실패했습니다.");
      }
    }

    fetchGameData();

    // 실시간
    const movesChannel = supabase
      .channel(`game-${gameIdNumber}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "moves",
          filter: `game_id=eq.${gameIdNumber}`,
        },
        (payload) => {
          const newMove = payload.new as Move;
          setMoves((currentMoves) => {
            const updatedMoves = [...currentMoves, newMove];
            
            // board 상태 계산
            const newBoard = Array(225).fill("");
            updatedMoves.forEach((move) => {
              const stone = move.move_order % 2 === 1 ? "흑" : "백";
              newBoard[move.position] = stone;
            });
            
            // 승리 체크
            if (checkWin(newMove.position, newBoard)) {
              const winner = newBoard[newMove.position];
              alert(`플레이어 ${winner} 승리!`);
            }
            
            return updatedMoves;
          });

          setGameState((current) => ({
            currentTurn: newMove.move_order % 2 === 0 
              ? "black_player" 
              : "white_player",
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(movesChannel);
    };
  }, [gameId, gameIdNumber, navigate]);

  function handleMouseEnter(position: number) {
    setHoverPosition(position);
  }

  function handleMouseLeave() {
    setHoverPosition(null);
  }

  async function handleMove(position: number) {
    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        console.error("사용자 인증이 필요합니다.");
        return;
      }

      // 이미 놓인 위치인지 확인
      if (getMoveAtPosition(position)) {
        return;
      }

      // 사용자 차례 확인
      const isCurrentPlayer = (
        (gameState.currentTurn === "black_player" && players.black === user.id) ||
        (gameState.currentTurn === "white_player" && players.white === user.id)
      );

      if (!isCurrentPlayer) {
        alert("당신의 차례가 아닙니다.");
        return;
      }

      const nextMoveOrder = moves.length + 1;

      // 새로운 move 추가
      const { error: insertError } = await supabase
        .from("moves")
        .insert([{
          game_id: gameIdNumber,
          position,
          move_order: nextMoveOrder,
        }]);

      if (insertError) {
        throw insertError;
      }

    } catch (error) {
      console.error("Move 처리 중 오류 발생:", error);
      alert("돌을 놓는데 실패했습니다. 다시 시도해주세요.");
    }
  }

  function checkWin(position: number, board: string[]) {
    const directions = [
      [1, -1],    // 가로
      [15, -15],  // 세로
      [14, -14],  // /
      [16, -16],  // \
    ];

    const playerStone = board[position];
    if (!playerStone) return false;

    for (const [step, negStep] of directions) {
      let count = 1;
      
      for (const dir of [step, negStep]) {
        let pos = position + dir;
        
        while (
          pos >= 0 && 
          pos < board.length && 
          board[pos] === playerStone &&
          (step !== 1 || Math.floor(pos / 15) === Math.floor((pos - dir) / 15))
        ) {
          count++;
          pos += dir;
        }
      }
      
      if (count >= 5) return true;
    }
    
    return false;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 게임 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate(-1)} 
              variant="secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold">
              {gameTitle}
            </h2>
          </div>
          <Badge
            variant="outline"
            className="text-orange-500 border-orange-500"
          >
            Game #{gameId}
          </Badge>
        </div>

        {/* 게임 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 플레이어 정보  */}
          <Card className="md:col-span-1 bg-white/80">
            <CardContent className="p-6">
              {/* 내 돌 정보 */}
              <div className="my-4 p-4 flex items-center gap-3">
                <p className="text-sm">내 돌</p>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full",
                    userStone === "흑"
                      ? "bg-black"
                      : "bg-white border-2 border-gray-300"
                  )}
                />
              </div>

              <div className="space-y-4">
                {/* 흑돌 플레이어 정보 */}
                <div
                  className={cn(
                    "p-4 rounded-lg transition-colors",
                    gameState.currentTurn === "black_player"
                      ? "bg-orange-100"
                      : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-black" />
                    <div>
                      <p className="font-medium">흑돌</p>
                      <p className="text-s">{players.black.slice(0, 8)}...</p>
                    </div>
                    {gameState.currentTurn === "black_player" && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          blackTime.timeLeft <= 10 ? "text-red-500" : "text-orange-500"
                        )}>
                          {blackTime.timeLeft}초
                        </span>
                        <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 백돌 플레이어 정보 */}
                <div
                  className={cn(
                    "p-4 rounded-lg transition-colors",
                    gameState.currentTurn === "white_player"
                      ? "bg-orange-100"
                      : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white border-2" />
                    <div>
                      <p className="font-medium">백돌</p>
                      <p className="text-s">
                        {players.white
                          ? players.white.slice(0, 8) + "..."
                          : "대기중"}
                      </p>
                    </div>
                    {gameState.currentTurn === "white_player" && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          whiteTime.timeLeft <= 10 ? "text-red-500" : "text-orange-500"
                        )}>
                          {whiteTime.timeLeft}초
                        </span>
                        <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 오목판 */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div
                className="grid  gap-[1px] p-[1px]"
                style={{
                  gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                }}
              >
                {board.map((cell, index) => (
                  <div
                    key={index}
                    onClick={() => handleMove(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    style={{ aspectRatio: "1/1" }}
                    className={cn(
                      "relative flex items-center justify-center",
                      "before:absolute before:inset-0 before:bg-yellow-700/20",
                      "before:content-[''] before:z-0",
                      "cursor-pointer",
                      cell === "흑" && "bg-black rounded-full z-10",
                      cell === "백" &&
                        "bg-white rounded-full z-10 border-2 border-gray-300",
                      cell === "" && "hover:bg-orange-200/50",
                      hoverPosition === index &&
                        !cell &&
                        (gameState.currentTurn === "black_player"
                          ? "bg-black/30 rounded-full"
                          : "bg-white/50 rounded-full")
                    )}
                  >
                    {cell && (
                      <span
                        className={cn(
                          "text-[0.65rem] font-bold z-20",
                          cell === "흑" ? "text-white" : "text-black"
                        )}
                      >
                        {getMoveAtPosition(index)?.move_order}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
