import { createSlice } from "@reduxjs/toolkit";

const countSlice = createSlice({
    name: 'counter',
    initialState : {
        count : 0
    },
    reducers : {
        incrementCount : (state, action)=> {
            state.count = state.count +1
        },
        decrementCount : (state, action)=> {
            state.count = state.count -1
        }
    }
})

export const {decrementCount, incrementCount} = countSlice.actions

export default countSlice.reducer;