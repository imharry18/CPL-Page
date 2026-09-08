import LobbySub from "@/components/lobby/LobbySub";
import RevealOnScroll from "@/components/RevealOnScroll";
import {
  SEASON_4_AUCTION_RULES,
  SEASON_4_RULES,
  SEASON_4_RULES_CLOSING,
} from "@/data/season4Rules";
import { REVEAL } from "@/lib/cplData";

export const metadata = {
  title: "Rules — Season 4, Campus Premier League",
  description:
    "The Season 4 playing conditions: umpiring, penalties, conduct, sledging and safety.",
};

export default function LobbyRulesPage() {
  return (
    <LobbySub
      eyebrow="Before you play"
      title="Rules"
      reveal={REVEAL}
      lock={false}
    >
      {/* Each rule arrives as it is scrolled to, rather than the whole page
          being there at once — a rulebook read one rule at a time. */}
      <RevealOnScroll />

      <div className="rules-page">
        <p className="rules-lede">
          Read these before you take the field. Penalties are awarded on the
          day, and one player&rsquo;s fight can cost a side the tournament.
        </p>

        <ol className="rulebook">
          {SEASON_4_RULES.map((rule, i) => (
            <li
              className="ruling reveal"
              key={rule.title}
              style={{ "--i": i }}
            >
              <p className="ruling-no">{String(i + 1).padStart(2, "0")}</p>

              <div className="ruling-body">
                <h2 className="ruling-title">{rule.title}</h2>
                <p className="ruling-text">{rule.body}</p>

                {rule.points && (
                  <ul className="ruling-points">
                    {rule.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}

                {/* The line of the rule that has to land, set apart so it is
                    read even when the paragraph above it is not. */}
                {rule.emphasis && (
                  <p className="ruling-emphasis">{rule.emphasis}</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* The auction's own conditions, under their own heading. Numbering
            restarts: these are a different set of rules for a different night,
            not rules eleven onward. */}
        <h2 className="rules-section display">Auction</h2>
        <p className="rules-section-sub">
          For the Live Auction. Every figure below is what the console
          actually enforces on the night.
        </p>

        <ol className="rulebook">
          {SEASON_4_AUCTION_RULES.map((rule, i) => (
            <li
              className="ruling reveal"
              key={rule.title}
              style={{ "--i": i }}
            >
              <p className="ruling-no">{String(i + 1).padStart(2, "0")}</p>

              <div className="ruling-body">
                <h3 className="ruling-title">{rule.title}</h3>
                <p className="ruling-text">{rule.body}</p>

                {rule.points && (
                  <ul className="ruling-points">
                    {rule.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}

                {rule.emphasis && (
                  <p className="ruling-emphasis">{rule.emphasis}</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* The last word, and the largest thing on the page after the title:
            everything above is a starting point. */}
        <section className="rules-close reveal">
          <p className="rules-close-lead display">
            {SEASON_4_RULES_CLOSING.lead}
          </p>
          <p className="rules-close-body">{SEASON_4_RULES_CLOSING.body}</p>
        </section>
      </div>
    </LobbySub>
  );
}
