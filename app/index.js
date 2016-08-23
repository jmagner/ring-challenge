const React = react;
const { createStore, combineReducers, applyMiddleware } = redux;
const { connect, Provider } = reactRedux;


// actions
// these are simulated requests to a machine or socket, async, even though they technically aren't here

// fake server instance of ring buffers
window.SIMULATED_SERVER = [];

// creates a new ring buffer, and then fires the action to replicate the buffer in redux
const addRingBuffer = (buffer_capacity) => {
	return function (dispatch, store){

		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_buffer = new RingBuffer(buffer_capacity)

		// we're storing a simuated reference to the real buffer classes,
		// other methods will reference this by index, replicating an API request
		SIMULATED_SERVER.push(ring_buffer)

		// we can dispatch this in async if we were waiting on a machine to do something,
		// but for now just fire the ADD_RING_BUFFER reducer
		dispatch({
			type: 'ADD_RING_BUFFER',
			buffer_response: {...ring_buffer}
		})

		// create a place holder in the stream response so our array indexs in our store match up
		dispatch({
			type: 'ADD_STREAM_RESPONSE'
		})

	}
}

const writeRingBuffer = (buffer_index, write_input) => {
	return function (dispatch, store){

		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_buffer = SIMULATED_SERVER[buffer_index]

		ring_buffer.write(write_input);

		// we can dispatch this in async if we were waiting on a machine to do something,
		// but for now just fire the UPDATE_RING_BUFFER reducer
		dispatch({
			type: 'UPDATE_RING_BUFFER',
			buffer_index,
			buffer_response: {...ring_buffer}
		})

	}
}

const readRingBuffer = (buffer_index) => {
	return function (dispatch, store){

		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_buffer = SIMULATED_SERVER[buffer_index]

		let read_response = ring_buffer.read();

		// we can dispatch this in async if we were waiting on a machine to do something,
		// but for now just fire the UPDATE_RING_BUFFER reducer
		dispatch({
			type: 'UPDATE_RING_BUFFER',
			buffer_index,
			buffer_response: {...ring_buffer},
		})

		// we store our read response stream separetly because it's not buffer data, its read request data
		dispatch({
			type: 'UPDATE_READ_RESPONSE',
			buffer_index,
			read_response: read_response
		})
	}
}

const countRingBuffer = (buffer_index) => {
	return function (dispatch, store){

		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_buffer = SIMULATED_SERVER[buffer_index]

		let count_response = ring_buffer.count();

		// we can dispatch this in async if we were waiting on a machine to do something,
		// but for now just fire the UPDATE_RING_BUFFER reducer
		dispatch({
			type: 'COUNT_RING_BUFFER',
			buffer_index,
			count: count_response
		})
	}
}

// components and containers

const RingView__component = ({ ringBuffers, readResponseStream, onAddBuffer, onWriteBuffer, onReadBuffer, onCountBuffer })=>{
	
	let trs = [],
		table = [];

	ringBuffers.map((ring_buffer, buffer_index)=>{

		let td = [];

		// we're going to show the buffer based on what's actually on it
		for( var x = 0; x < ring_buffer.buffer.length; x ++ ){

			let style = ring_buffer.position === x ? {backgroundColor: 'red'} : null;
			
			td.push(
				<td key={'buffer-' + buffer_index + "-" + x} style={style}>
					{ring_buffer.buffer[x] === undefined ? '' : ring_buffer.buffer[x]}
				</td>
			)
		}

		// ref for the input
		let write_input

		// push the controle element to the td
		td.push(
			
		);

		let response_string = '';
		if(readResponseStream.length > 0){
			readResponseStream[buffer_index].map((response)=>{
				response_string += response + ' '
			})
		}
		

		table.push(

			<table key={'table-buffer-' + buffer_index }>
				<tbody>
					<tr key={'buffer-' + buffer_index }>{td}</tr>
					<tr key={'read-output-' + buffer_index }>
					<td colSpan="100">

						<form onSubmit={e => {
							e.preventDefault()
							onWriteBuffer(buffer_index,write_input.value)
							write_input.value = ''
						}}>

						Input: 
						
						<input ref={node => {
		          			write_input = node
		        		}}></input>

		        		<button type='submit'>Write</button>

		        		<button onClick={(e)=>{
		        			e.preventDefault();
							onReadBuffer(buffer_index)
						}}>Read</button>

						<button onClick={(e)=>{
							e.preventDefault();
							onCountBuffer(buffer_index)
						}}>Count</button>

						</form>

						<p>Size: {ring_buffer.size}</p>
						<p>Overwriting: {ring_buffer.isOverwriting ? 'True' : 'False'}</p>
						<p>Read Stream: {response_string}</p>
					</td>
					</tr>
				</tbody>
			</table>
		);
		
	})

	let capacity_input

	return (
		
		<section>
			
			{table}
			<div className="add-buffer">
				Buffer Capacity: 
				<input placeholder={10} ref={node => {
					capacity_input = node
	    		}}></input>
	    		<button onClick={()=>{
					onAddBuffer(+capacity_input.value)
					capacity_input.value = ''
				}}>Add new buffer</button>
			</div>
		</section>
	)
}

const RingView__container = connect(
	(state)=>({
		ringBuffers: state.ringBuffers,
		readResponseStream: state.readResponseStream
	}),
	(dispatch)=>({
		onAddBuffer: (buffer_capacity)=>{

			// dirty numberic check
			function isNumeric(n) {
				return !isNaN(parseFloat(n)) && isFinite(n);
			}

			// defaults to 10 if we don't get a number
			dispatch(addRingBuffer(isNumeric(buffer_capacity) && buffer_capacity > 0 ? buffer_capacity : 10))

		},
		onWriteBuffer: (buffer_index, write_input)=>{

			dispatch(writeRingBuffer(buffer_index,write_input))

		},
		onReadBuffer: (buffer_index)=>{

			dispatch(readRingBuffer(buffer_index))

		},
		onCountBuffer: (buffer_index)=>{

			dispatch(countRingBuffer(buffer_index))

		}
	})
)(RingView__component)



// reducers

const reducers = combineReducers({
	readResponseStream: (state = [], action) => {
		switch (action.type) {
			
			case 'ADD_STREAM_RESPONSE':
				// we store a blank placeholder so are arrays match up
				return [
					...state,
					[]
				]
			case 'UPDATE_READ_RESPONSE':
				return [
					...state.slice(0, action.buffer_index),
					[...state[action.buffer_index],action.read_response],
					...state.slice(action.buffer_index + 1)
				]
			default:
				return state
		}
	},
	ringBuffers: (state = [], action) => {
		switch (action.type) {

			case 'ADD_RING_BUFFER':

				return [
					...state,
					{...action.buffer_response}
				]

			case 'UPDATE_RING_BUFFER':

				return [
					...state.slice(0, action.buffer_index),
					{...action.buffer_response},
					...state.slice(action.buffer_index + 1)
				]

			case 'COUNT_RING_BUFFER':

				alert(action.count)

			default:
				return state
		}
	}
})


// global view of the store

window.store = createStore(reducers, applyMiddleware(reduxThunk.default));

reactDom.render(
	<Provider store={store}>
		<RingView__container />
	</Provider>,
document.getElementById('react-root'))