import { createSlice } from '@reduxjs/toolkit';

const voteSlice = createSlice({
  name: 'vote',
  initialState: {
    selectedCandidate: null,
    voteQuantity: 1,
    paymentReference: null,
    step: 'browse',
  },
  reducers: {
    selectCandidate(state, { payload }) { state.selectedCandidate = payload; state.step = 'confirm'; },
    setVoteQuantity(state, { payload }) { state.voteQuantity = Math.max(1, Math.min(100, payload)); },
    setPaymentReference(state, { payload }) { state.paymentReference = payload; state.step = 'processing'; },
    setVoteStep(state, { payload }) { state.step = payload; },
    resetVote(state) { state.selectedCandidate = null; state.voteQuantity = 1; state.paymentReference = null; state.step = 'browse'; },
  },
});

export const { selectCandidate, setVoteQuantity, setPaymentReference, setVoteStep, resetVote } = voteSlice.actions;
export default voteSlice.reducer;
export const selectVoteState     = (s) => s.vote;
export const selectVoteCandidate = (s) => s.vote.selectedCandidate;
export const selectVoteQuantity  = (s) => s.vote.voteQuantity;
