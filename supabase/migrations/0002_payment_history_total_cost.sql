-- Records what the payment actually cost, in the company's own currency.
--
-- Why this column matters: asking a non-financial user for "the FX rate used"
-- is asking for a number they usually don't have. The total amount debited
-- from their account is on every bank statement. Combined with the ECB
-- mid-market rate for that date (which we already fetch), it lets us measure
-- the provider's real all-in margin instead of guessing it.
alter table payment_history
  add column if not exists total_cost_base_currency numeric(14, 2);

comment on column payment_history.total_cost_base_currency is
  'Total amount debited from the company account, in its base currency (e.g. CAD), fees included.';
