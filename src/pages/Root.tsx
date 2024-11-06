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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Plus, Users, Gamepad, Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const form = useForm<{ title: string }>();

  async function onSubmit(data: { title: string }) {
    if (!user?.id) {
      console.error("사용자가 로그인되어 있지 않습니다.");
      return;
    }

    const black_player = user.id;

    const { data: gameData, error } = await supabase
      .from("games")
      .insert([{ title: data.title, black_player, white_player: null }])
      .select();

    if (error) {
      console.error("방 만들기 에러:", error);
    } else if (gameData && gameData[0]) {
      const newGameId = gameData[0].id;
      navigate(`/game/${newGameId}`);
    }
  }

  async function fetchGames() {
    setIsLoading(true);
    const { data, error } = await supabase.from("games").select("*");
    setGames(data || []);
    setIsLoading(false);
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

  function getGameStatus(game: Games) {
    return game.white_player ? "게임 중" : "대기 중";
  }

  async function joinGame(gameId: number, blackPlayerId: string) {
    if (user) {
      if (user.id !== blackPlayerId) {
        const { error } = await supabase
          .from("games")
          .update({ white_player: user.id })
          .eq("id", gameId);
        if (error) {
          console.error("게임 참여 에러", error);
          return;
        }
      }
      fetchGames();
      navigate(`/game/${gameId}`);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("로그아웃 에러:", error);
    } else {
      setUser(null);
      navigate("/auth/sign-in");
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Gamepad className="h-12 w-12 text-orange-500" />
              <h1 className="text-2xl font-bold ">오목 게임</h1>
              <p className="text-gray-500 text-center">
                게임을 시작하려면 로그인이 필요합니다
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate("/auth/sign-in")}
              >
                로그인하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Gamepad className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold ">오목 게임</h1>
              <p className="text-s text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>

        <Separator className="my-6" />

       
          {/* 통계 */}
          <div className="flex flex-col md:flex-row gap-4 w-full mb-6">
            <Card className="flex-1">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Gamepad className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-s font-medium text-gray-500">총 게임 수</p>
                    <p className="text-2xl font-bold">{games.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-1">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Play className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-s font-medium text-gray-500">진행 중</p>
                    <p className="text-2xl font-bold">
                      {games.filter(game => game.white_player).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-1">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-s font-medium text-gray-500">대기 중</p>
                    <p className="text-2xl font-bold">
                      {games.filter(game => !game.white_player).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 게임 목록 */}
          <Card className="my-6">
            <CardContent className="p-6 ">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">게임 방 목록</h2>
                <Form {...form}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        새 게임 만들기
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                          <DialogTitle>새 게임 방 만들기</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>방 제목</FormLabel>
                                <FormControl>
                                  <Input placeholder="게임 방 제목을 입력하세요" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">만들기</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </Form>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>게임 제목</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>생성 시간</TableHead>
                      <TableHead className="text-right">참가</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              !game.white_player && "text-green-600 bg-green-50"
                            )}
                          >
                            {getGameStatus(game)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(game.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {getGameStatus(game) === "대기 중" ? (
                            <Button
                              size="sm"
                              onClick={() => joinGame(game.id, game.black_player)}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              참가하기
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled
                            >
                              참가불가
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        
      </div>
    </div>
  );
}