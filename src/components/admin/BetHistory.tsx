import { useEffect, useState } from "react";
import { betHistory } from "src/utils/api";
import { authFetch } from "src/utils/authFetch";

export default function BetHistory({ lotId, users }) {
  const [data, setData] = useState<any>(null);
  const currentLot = data?.filter(({ lot_id }) => lot_id === lotId);

  useEffect(() => {
    (async () => {
      const res: any = await authFetch({ url: betHistory, method: "GET" });
      setData(res);
    })();
  }, []);

  return currentLot ? (
    <table>
      <thead>
        <tr>
          <td>Дата</td>
          <td>Сумма</td>
          <td>Выкуп</td>
          <td>Пользователь</td>
        </tr>
      </thead>
      <tbody>
        {currentLot.map(({ bet_timestamp, is_buy_now, money, user_id }) => (
          <tr>
            <td>{bet_timestamp}</td>
            <td>{money}</td>
            <td>{is_buy_now ? "Да" : "Нет"}</td>
            <td>{users.find(({ id }) => id === user_id).email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : null;
}
