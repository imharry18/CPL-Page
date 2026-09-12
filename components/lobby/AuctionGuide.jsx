"use client";

import { useEffect, useRef } from "react";

import { ROUNDS } from "@/lib/auctionQueue";

/**
 * Everything the board can do, on one card, behind one button.
 *
 * The controls used to sit along the foot of the screen as a row of buttons.
 * That screen is shared to a call and projected in a hall: it should read as a
 * broadcast, not as an application, and a control that is pressed twice a night
 * does not deserve permanent space on it. So the night's rare actions live here
 * and the frequent ones are keys.
 */
export default function AuctionGuide({ onClose }) {
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      // Escape only. Everything else still belongs to the auction underneath —
      // a bid must not be swallowed because the guide happens to be open.
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="guide-scrim"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="guide"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <header className="guide-head">
          <p className="guide-tag num">Running the auction</p>
          <h2 className="display" id="guide-title">
            The board is the console
          </h2>
          <button
            type="button"
            className="guide-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="guide-cols">
          <section>
            <h3 className="guide-sub num">Bidding</h3>
            <dl className="guide-keys">
              <div>
                <dt>
                  <kbd>1</kbd>–<kbd>8</kbd>
                </dt>
                <dd>
                  That side bids. The number is printed on its panel down the
                  right, and the price steps up on its own.
                </dd>
              </div>
              <div>
                <dt>
                  <kbd>Click</kbd>
                </dt>
                <dd>Clicking a side&rsquo;s panel bids for it too.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="guide-sub num">Closing a lot</h3>
            <dl className="guide-keys">
              <div>
                <dt>
                  <kbd>↵</kbd>
                </dt>
                <dd>
                  Sold, to whoever holds the bid. Press it again to take the
                  announcement down and call the next name.
                </dd>
              </div>
              <div>
                <dt>
                  <kbd>⌘</kbd>
                  <kbd>↵</kbd>
                </dt>
                <dd>
                  Unsold — in the Opening only. He comes back in the Recall,
                  where every player left has to be sold.
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="guide-sub num">Going back</h3>
            <dl className="guide-keys">
              <div>
                <dt>
                  <kbd>⌘</kbd>
                  <kbd>Z</kbd>
                  <span className="guide-or num">or</span>
                  <kbd>⌫</kbd>
                </dt>
                <dd>
                  One step back. The raise just called — or, if none has been,
                  the result before it. Undoing a sale reopens the lot exactly
                  as it stood, with the winning side still holding the bid.
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="guide-sub num">Moving through the order</h3>
            <dl className="guide-keys">
              <div>
                <dt>
                  <kbd>→</kbd>
                </dt>
                <dd>
                  Skip ahead to the next name without calling this one. Nothing
                  is recorded; he comes round again.
                </dd>
              </div>
              <div>
                <dt>
                  <kbd>←</kbd>
                </dt>
                <dd>Back to the name before him.</dd>
              </div>
            </dl>
            <p className="guide-note">
              The arrows walk the round you are in, not the whole night — in
              the Recall that is the players who went unsold, so they step
              between the names still to be bid for rather than over every lot
              already finished.
            </p>
          </section>

          <section>
            <h3 className="guide-sub num">The sides</h3>
            <dl className="guide-keys">
              <div>
                <dt>
                  <kbd>Right-click</kbd>
                </dt>
                <dd>
                  Opens that side&rsquo;s squad — who they hold, what they paid,
                  and what is left in the purse.
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="guide-sub num">The night</h3>
            <p className="guide-note">
              Nobody chooses who is next: the running order does, and it calls
              itself. When the Opening is exhausted the board offers the
              players who went unsold in it — the Recall, and the last time of
              asking. Nobody can be passed over there, so the {ROUNDS} rounds
              end with every player sold and the board says the auction is
              complete.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
