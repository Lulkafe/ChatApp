
export const initState = {
    messages: []
}

export const ACTION = {
    UPDATE: {
        MESSAGE: 'Received a new message', 
        NEW_ROOM: 'Added a new accesible room'
    }
}

export const Reducer = (state, action) => {
    console.log(`New event dispatched: ${action}`);

    switch(action.type) {
        case ACTION.UPDATE.MESSAGE:
            console.log('Hello')
            return {
                messages: [...state.messages, action.value]
            }
        
        default:
            console.log('default')
            return state;
    }
}