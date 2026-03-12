-- get_equity_summary(): returns per-stock metrics (latest price, multi-period returns,
-- turnover rate, and a 50-day close sparkline) by pivoting neolog_equity_daily.
CREATE OR REPLACE FUNCTION get_equity_summary()
RETURNS TABLE (
  code          TEXT,
  name          TEXT,
  market        TEXT,
  close         DOUBLE PRECISION,
  change_pct_1d DOUBLE PRECISION,
  change_pct_5d DOUBLE PRECISION,
  change_pct_10d DOUBLE PRECISION,
  change_pct_20d DOUBLE PRECISION,
  change_pct_50d DOUBLE PRECISION,
  change_pct_250d DOUBLE PRECISION,
  turnover_rate DOUBLE PRECISION,
  sparkline     DOUBLE PRECISION[]
)
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  WITH recent AS (
    SELECT
      d.code,
      d.close,
      d.change_pct,
      d.turnover_rate,
      ROW_NUMBER() OVER (PARTITION BY d.code ORDER BY d.trade_date DESC) AS rn
    FROM neolog_equity_daily d
  ),
  agg AS (
    SELECT
      code,
      MAX(CASE WHEN rn = 1   THEN close END)         AS c1,
      MAX(CASE WHEN rn = 6   THEN close END)         AS c6,
      MAX(CASE WHEN rn = 11  THEN close END)         AS c11,
      MAX(CASE WHEN rn = 21  THEN close END)         AS c21,
      MAX(CASE WHEN rn = 51  THEN close END)         AS c51,
      MAX(CASE WHEN rn = 251 THEN close END)         AS c251,
      MAX(CASE WHEN rn = 1   THEN change_pct END)    AS chg1,
      MAX(CASE WHEN rn = 1   THEN turnover_rate END) AS tr,
      -- sparkline: oldest→newest (rn DESC = oldest first)
      ARRAY_AGG(close ORDER BY rn DESC)
        FILTER (WHERE rn <= 50)                      AS sparkline
    FROM recent
    WHERE rn <= 251
    GROUP BY code
  )
  SELECT
    l.code,
    l.name,
    l.market,
    a.c1                                                              AS close,
    a.chg1                                                            AS change_pct_1d,
    CASE WHEN a.c6   > 0 THEN (a.c1 - a.c6)   / a.c6   * 100 END   AS change_pct_5d,
    CASE WHEN a.c11  > 0 THEN (a.c1 - a.c11)  / a.c11  * 100 END   AS change_pct_10d,
    CASE WHEN a.c21  > 0 THEN (a.c1 - a.c21)  / a.c21  * 100 END   AS change_pct_20d,
    CASE WHEN a.c51  > 0 THEN (a.c1 - a.c51)  / a.c51  * 100 END   AS change_pct_50d,
    CASE WHEN a.c251 > 0 THEN (a.c1 - a.c251) / a.c251 * 100 END   AS change_pct_250d,
    a.tr                                                              AS turnover_rate,
    a.sparkline
  FROM neolog_equity_list l
  JOIN agg a ON a.code = l.code
$$;

GRANT EXECUTE ON FUNCTION get_equity_summary() TO authenticated;
