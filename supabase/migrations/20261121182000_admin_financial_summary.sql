create or replace function public.admin_financial_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_start timestamptz := (date_trunc('month', now() at time zone 'Asia/Dhaka')) at time zone 'Asia/Dhaka';
  v_sales numeric := 0;
  v_expenses numeric := 0;
begin
  if v_uid is null or not exists (
    select 1 from public.user_roles ur
    where ur.user_id = v_uid and ur.role = 'owner_admin'
  ) then
    raise exception 'Owner Admin permission required' using errcode = '42501';
  end if;

  select coalesce(sum(o.amount),0)::numeric into v_sales
  from public.orders o
  where o.created_at >= v_start
    and lower(coalesce(o.status,'')) in ('delivered','completed');

  select coalesce(sum(e.amount),0)::numeric into v_expenses
  from public.admin_expenses e
  where e.expense_date >= (now() at time zone 'Asia/Dhaka')::date - extract(day from now() at time zone 'Asia/Dhaka')::int + 1;

  return jsonb_build_object(
    'month_sales', v_sales,
    'month_expenses', v_expenses,
    'month_net_before_other_costs', v_sales - v_expenses
  );
end;
$function$;
revoke all on function public.admin_financial_summary() from public, anon;
grant execute on function public.admin_financial_summary() to authenticated;
comment on function public.admin_financial_summary() is 'Owner Admin only: current-month delivered sales minus entered expense ledger; excludes other unrecorded costs.';
