import LobbySub from "@/components/lobby/LobbySub";
import SeasonShow from "@/components/lobby/SeasonShow";
import {
  SEASON_4_RULES,
  SEASON_4_RULES_CLOSING,
} from "@/data/season4Rules";
import { REVEAL } from "@/lib/cplData";
import { tintFor } from "@/lib/matchTints";

export const metadata = {
  title: "Rules — Season 4, Campus Premier League",
  description:
    "The Season 4 playing conditions: umpiring, penalties, conduct, sledging and safety.",
};

export default function LobbyRulesPage() {
  /* Each rule is a slide: the number stands where a crest would on the Season
     4 screen, and the rule itself is set against it. The closing word is the
     last slide, set apart by its size rather than by a different layout. */
  const slides = [
    ...SEASON_4_RULES.map((rule, i) => ({
      key: rule.title,
      tag: `Rule ${String(i + 1).padStart(2, "0")}`,
      title: rule.title,
      note: rule.body,
      stat: String(i + 1).padStart(2, "0"),
      statUnit: "of " + String(SEASON_4_RULES.length).padStart(2, "0"),
      tint: tintFor(i + 1),
    })),
    {
      key: "closing",
      tag: "The last word",
      title: SEASON_4_RULES_CLOSING.lead,
      note: SEASON_4_RULES_CLOSING.body,
      stat: "∞",
      statUnit: "open to change",
      tint: { "--tie": "#c8102e", "--tie-lit": "#ff5a6e" },
    },
  ];

  return (
    <LobbySub
      eyebrow="Before you play"
      title="Rules"
      reveal={REVEAL}
      lock={false}
      fill
      head={false}
      bare
    >
      <SeasonShow slides={slides} label="Rules" />
    </LobbySub>
  );
}
