import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';

export const formatNaira      = (kobo) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(kobo / 100);
export const formatNairaShort = (kobo) => { const n = kobo / 100; if (n >= 1_000_000) return `\u20a6${(n/1_000_000).toFixed(1)}M`; if (n >= 1_000) return `\u20a6${(n/1_000).toFixed(1)}K`; return `\u20a6${n.toLocaleString('en-NG')}`; };
export const nairaToKobo = (naira) => Math.round(naira * 100);
export const koboToNaira = (kobo)  => kobo / 100;

export const calculateSplit = (totalKobo, commissionDecimal) => {
  const platform  = Math.round(totalKobo * commissionDecimal);
  const organizer = totalKobo - platform;
  return { platform, organizer, total: totalKobo };
};

export const formatEventDate = (iso) => format(new Date(iso), 'EEE, MMM d yyyy \u00b7 h:mm a');
export const formatShortDate = (iso) => format(new Date(iso), 'MMM d, yyyy');
export const timeFromNow     = (iso) => formatDistanceToNow(new Date(iso), { addSuffix: true });

export const getEventStatus = (startDate, endDate, isManuallyOpen) => {
  const now = new Date(), start = new Date(startDate), end = new Date(endDate);
  if (isManuallyOpen === false) return 'closed';
  if (isFuture(start))          return 'upcoming';
  if (isPast(end))              return 'closed';
  return 'open';
};

export const isVotingOpen = (event) =>
  getEventStatus(event.startDate, event.endDate, event.isOpen) === 'open';

export const formatNumber  = (n) => new Intl.NumberFormat('en-NG').format(n);
export const formatPercent = (value, total) => !total ? '0.0%' : `${((value/total)*100).toFixed(1)}%`;
export const calcPercent   = (value, total) => !total ? 0 : parseFloat(((value/total)*100).toFixed(2));

export const generateReference = (prefix = 'FASA') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,9).toUpperCase()}`;
export const rankCandidates    = (candidates) => [...candidates].sort((a,b) => b.totalVotes - a.totalVotes);
export const getTotalVotes     = (candidates) => candidates.reduce((sum,c) => sum + (c.totalVotes||0), 0);
export const getRankSuffix     = (rank) => rank===1?'st':rank===2?'nd':rank===3?'rd':'th';
