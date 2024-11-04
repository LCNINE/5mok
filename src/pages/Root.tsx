import { supabase } from "@/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Games {
  id: number;
  title: string;
  black_player: string;
  white_player: string | null;
  created_at: string;
}

export default function RootPage() {
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Games[]>([]);
  const navigate = useNavigate();

  async function fetchGames() {
    const { data, error } = await supabase.from("games").select("*");
    setGames(data || []);
    console.log({
      data: data,
      error: error,
    });
  }

  useEffect(() => {
    const callbackState = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGames();
      }
    });

    return () => {
      callbackState.data.subscription.unsubscribe();
    };
  }, []);

  // 게임 상태
  function getGameStatus(game: Games) {
    return game.white_player ? "게임 중" : "대기 중";
  }

  // 방 참가
  async function joinGame(gameId: number) {
    if (user) {
      const { error } = await supabase
        .from("games")
        .update({ white_player: user.id })
        .eq("id", gameId);
      if (error) {
        console.error("게임 참여 에러", error);
      } else {
        fetchGames();
        navigate(`/game/${gameId}`, { state: { user, gameId } });
      }
    }
  }

  // 로그아웃
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("로그아웃 에러:", error);
    } else {
      setUser(null);
      navigate("/auth/sign-in");
    }
  }

  return (
    <div className="p-6">
      {user ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p>{user.email}님, 안녕하세요</p>
            <Button onClick={handleLogout} variant="secondary">로그아웃</Button>
          </div>
          <Button onClick={() => navigate("/create-room", { state: { user } })} className="mb-6">
            방 만들기
          </Button>
          <h3 className="text-xl font-semibold mb-4">게임 방 목록</h3>
          <Table className="w-full">
            <TableCaption>현재 생성된 게임 방 목록입니다.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>게임 제목</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>참가</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>{game.title}</TableCell>
                  <TableCell>{getGameStatus(game)}</TableCell>
                  <TableCell>
                    {getGameStatus(game) === "대기 중" && game.black_player !== user.id ? (
                      <Button onClick={() => joinGame(game.id)}>참가하기</Button>
                    ) : (
                      <Button variant="secondary">참가불가</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <>
          <p className="mb-4">비회원</p>
          <Button onClick={() => navigate("/auth/sign-in")}>로그인 페이지로 이동</Button>
        </>
      )}
    </div>
  );
}
