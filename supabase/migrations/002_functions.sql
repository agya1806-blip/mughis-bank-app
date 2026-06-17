-- Function to update wallet balance (used by transactions)
CREATE OR REPLACE FUNCTION update_wallet_balance(wallet_id UUID, diff DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE wallets SET balance = balance + diff WHERE id = wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly summary
CREATE OR REPLACE FUNCTION get_monthly_summary(p_user_id UUID, p_year INT, p_month INT)
RETURNS TABLE(
  total_income DECIMAL,
  total_expense DECIMAL,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
    COUNT(*) AS transaction_count
  FROM transactions
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM date) = p_year
    AND EXTRACT(MONTH FROM date) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT,
  p_old_data JSONB DEFAULT '{}',
  p_new_data JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (p_user_id, p_action, p_table_name, p_record_id, p_old_data, p_new_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
