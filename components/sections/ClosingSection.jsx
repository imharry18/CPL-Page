export default function ClosingSection({ dates, registerUrl, paymentUrl, fee }) {
  return (
    <section id="closing" className="section closing">
      <p className="eyebrow reveal">Season 04</p>

      <h2 className="display display-xl closing-title">
        <span className="line-mask">
          <span>Get your</span>
        </span>
        <span className="line-mask" style={{ "--delay": "0.1s" }}>
          <span className="lit">name in.</span>
        </span>
      </h2>

      <p className="lede reveal" style={{ "--delay": "0.2s" }}>
        Fill the entry form, pay the {fee} fee, then confirm the payment on the
        second form. Entries close the day before the auction on {dates[0].day}{" "}
        {dates[0].month}.
      </p>

      <div className="register-actions reveal" style={{ "--delay": "0.3s" }}>
        <a
          className="btn btn-primary btn-lg"
          href={registerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Entry form
        </a>
        {/* Only rendered once PAYMENT_URL is set, so there is never a button
            that goes nowhere. */}
        {paymentUrl && (
          <a
            className="btn btn-lg"
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Payment form
          </a>
        )}
      </div>

      <footer className="foot">
        <span>Campus Premier League © 2026</span>
        <span>Est. 2025 · Every semester since</span>
      </footer>
    </section>
  );
}
