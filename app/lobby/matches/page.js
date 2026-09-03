import LobbySub from "@/components/lobby/LobbySub";
import { REVEAL, SEASON_4 } from "@/lib/cplData";

export const metadata = {
  title: "Matches — Season 4, Campus Premier League",
  description:
    "Twelve matches in a single day on 20 September. The draw is made at the Live Auction on 12 September.",
};

export default function LobbyMatchesPage() {
  return (
    <LobbySub
      eyebrow={`${SEASON_4[1].day} ${SEASON_4[1].month} · Football Ground`}
      title="Matches"
      reveal={REVEAL}
      lock={false}
    >
      <p className="soon display">
        Will be shown on <span className="lit">{REVEAL.date}</span>
      </p>
      <p className="soon-sub num">
        {REVEAL.time} · {REVEAL.note}
      </p>
    </LobbySub>
  );
}
