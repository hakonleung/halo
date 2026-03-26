-- Remove Beijing Stock Exchange (北交所) stocks — codes starting with 8 or 9.
-- baostock does not support BJ exchange.

DELETE FROM neolog_equity_daily WHERE code LIKE '8%' OR code LIKE '9%';
DELETE FROM neolog_equity_list  WHERE code LIKE '8%' OR code LIKE '9%';

-- Recreate summary function with BJ filter
CREATE OR REPLACE FUNCTION get_equity_summary(p_limit INT, p_offset INT)
RETURNS TABLE (
  code       TEXT,
  name       TEXT,
  market     TEXT,
  close      NUMERIC,
  change_pct_1d  NUMERIC,
  change_pct_5d  NUMERIC,
  change_pct_10d NUMERIC,
  change_pct_20d NUMERIC,
  change_pct_50d NUMERIC,
  change_pct_120d NUMERIC,
  turnover_rate  NUMERIC,
  sparkline      NUMERIC[]
)
LANGUAGE sql STABLE
AS $$
  WITH recent AS (
    SELECT
      d.code,
      d.close,
      d.change_pct,
      d.turnover_rate,
      ROW_NUMBER() OVER (PARTITION BY d.code ORDER BY d.trade_date DESC) AS rn
    FROM neolog_equity_daily d
    JOIN neolog_equity_list  l ON l.code = d.code
    WHERE l.code NOT LIKE '8%' AND l.code NOT LIKE '9%'
  ),
  agg AS (
    SELECT
        code,
        MAX(close)         FILTER (WHERE rn = 1)   AS c1,
        MAX(change_pct)    FILTER (WHERE rn = 1)   AS chg1,
        MAX(turnover_rate) FILTER (WHERE rn = 1)   AS tr,
        MAX(close)         FILTER (WHERE rn = 6)   AS c6,
        MAX(close)         FILTER (WHERE rn = 11)  AS c11,
        MAX(close)         FILTER (WHERE rn = 21)  AS c21,
        MAX(close)         FILTER (WHERE rn = 51)  AS c51,
        MAX(close)         FILTER (WHERE rn = 121) AS c121,
        ARRAY_AGG(close ORDER BY rn ASC)
        FILTER (WHERE rn <= 50)                      AS sparkline
    FROM recent
    WHERE rn <= 121
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
    CASE WHEN a.c121 > 0 THEN (a.c1 - a.c121) / a.c121 * 100 END   AS change_pct_120d,
    a.tr                                                              AS turnover_rate,
    a.sparkline
  FROM neolog_equity_list l
  JOIN agg a ON a.code = l.code
  WHERE l.code NOT LIKE '8%' AND l.code NOT LIKE '9%'
  LIMIT p_limit OFFSET p_offset
$$;
