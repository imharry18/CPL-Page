import LobbySub from "@/components/lobby/LobbySub";
import { REVEAL } from "@/lib/cplData";

export const metadata = {
  title: "Rules — Season 4, Campus Premier League",
  description:
    "The Season 4 playing conditions, read out at the Live Auction on 12 September.",
};

export default function LobbyRulesPage() {
  return (
    <LobbySub
      eyebrow="Before you play"
      title="Rules"
      reveal={REVEAL}
      lock={false}
    >
      <p className="soon display">
        Will be shown on <span className="lit">{REVEAL.date}</span>
      </p>
      <p className="soon-sub num">
        {REVEAL.time} · {REVEAL.note}
      </p>

      {/* The one rule that is not being held back. */}
      <div className="rule-one">
        <p className="rule-one-no num">Rule No. 1</p>
        <p className="rule-one-text">
          Have patience. There is something big coming.
        </p>
      </div>
    </LobbySub>
  );
}
