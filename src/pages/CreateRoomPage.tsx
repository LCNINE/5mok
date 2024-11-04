import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";

export default function CreateRoomPage() {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  async function handleCreateRoom() {
    // 방 생성 후, select()를 사용하여 생성된 방의 ID를 가져옴
    const { data, error } = await supabase.from("games").insert([
      {
        title,
        black_player: user.id,
        white_player: null,
      },
    ]).select(); // select()를 추가하여 생성된 데이터 가져옴

    if (error) {
      console.error("방 만들기 에러:", error);
    } else if (data && data[0]) {
      // 생성된 방의 ID로 이동
      const newGameId = data[0].id;
      navigate(`/game/${newGameId}`, { state: { user, gameId: newGameId } });
    }
  }

  return (
    <div>
      <p>{user.id}</p>
      <h2>새 게임 방 만들기</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="방 제목을 입력하세요"
        className="border p-2 w-full mb-4"
      />
      <Button onClick={handleCreateRoom} className="mr-2">방 만들기</Button>
      <Button onClick={() => navigate("/")}>취소</Button>
    </div>
  );
}
