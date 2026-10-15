/** The only values allowed across the public website's data boundary. */
export function publicOverview(input) {
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const value = (number, max=Infinity) => {
    if (number === null) return null;
    if (typeof number !== 'number' || !Number.isFinite(number) || number < 0 || number > max) throw new Error('Invalid public metric');
    return number;
  };
  if (!input || !date(input.selectedDate) || !Number.isFinite(Date.parse(input.updatedAt))) throw new Error('Invalid aggregate metadata');
  if (!Array.isArray(input.availableDates) || !input.availableDates.every(date)) throw new Error('Invalid aggregate dates');
  const metric = key => ({value:value(input.totals?.[key]?.value)});
  const trend = rows => {
    if (!Array.isArray(rows) || rows.length > 5000) throw new Error('Invalid aggregate trend');
    return rows.map(row => {
      if (!date(row.date)) throw new Error('Invalid trend date');
      return {date:row.date,durationSeconds:value(row.durationSeconds),usableSeconds:value(row.usableSeconds)};
    });
  };
  return {
    selectedDate:input.selectedDate,
    updatedAt:new Date(input.updatedAt).toISOString(),
    availableDates:[...new Set(input.availableDates)].sort(),
    totals:{
      cumulativeDuration:metric('cumulativeDuration'),cumulativeUsable:metric('cumulativeUsable'),
      todayDuration:metric('todayDuration'),todayUsable:metric('todayUsable'),
      passRate:value(input.totals?.passRate,100),
    },
    trend:trend(input.trend),cumulativeTrend:trend(input.cumulativeTrend),
    sourceRefreshFailed:input.sourceRefreshFailed === true,
  };
}

/** Coalesce concurrent refreshes and preserve the actual timestamp on outages. */
export function createAggregateReader(load, {ttlMs=30000,clock=Date.now,onSuccess=async()=>{}}={}) {
  let cached=null,pending=null,expires=0,failed=false;
  return async () => {
    if (cached && clock()<expires) return {...cached,sourceRefreshFailed:failed};
    if (!pending) pending=(async()=>{
      try {
        const next=publicOverview(await load());
        cached=next;failed=false;expires=clock()+ttlMs;
        await onSuccess(next);
      } catch {
        failed=true;expires=clock()+5000;
        if (!cached) throw new Error('Live aggregate unavailable');
      }
      return {...cached,sourceRefreshFailed:failed};
    })().finally(()=>{pending=null;});
    return pending;
  };
}
