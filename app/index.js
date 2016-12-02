const React = react;
const { createStore, combineReducers, applyMiddleware } = redux;
const { connect, Provider } = reactRedux;


// ACTIONS
// these are simulated requests to a machine or socket, which can be async or not. The dispatch's can happen in a callback when ready

// Simulated machine is used as a storage to represent endpoints on a machine where the ring buffer may live
window.SIMULATED_RING_BUFFER_STORAGE = [];
window.SIMULATED_RING_READER_STORAGE = {};

// creates a new ring buffer, and then fires the action to replicate the buffer in redux
const addRingBuffer = (buffer_capacity) => {
	return function (dispatch, store){

		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_buffer = new RingBuffer(buffer_capacity)

		// we're storing a simuated reference to the real buffer classes,
		// other methods will reference this by index, replicating an API request
		SIMULATED_RING_BUFFER_STORAGE.push(ring_buffer)

		// we can dispatch this in async if we were waiting on a machine to do something,
		// but for now just fire the ADD_RING_BUFFER reducer
		dispatch({
			type: 'ADD_RING_BUFFER',
			buffer_response: {...ring_buffer}
		})

		// create a place holder in the stream response so our array indexs in our store match up
		dispatch({
			type: 'ADD_BUFFER_READ_RESPONSE'
		})

	}
}

const writeRingBuffer = (buffer_index, write_input) => {
	return function (dispatch, store){

		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_buffer = SIMULATED_RING_BUFFER_STORAGE[buffer_index]

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
		var ring_buffer = SIMULATED_RING_BUFFER_STORAGE[buffer_index]

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
			type: 'UPDATE_BUFFER_READ_RESPONSE',
			buffer_index,
			read_response: read_response
		})
	}
}

const countRingBuffer = (buffer_index) => {
	return function (dispatch, store){

		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_buffer = SIMULATED_RING_BUFFER_STORAGE[buffer_index]

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

// creates a new ring reader, which requires a buffer index to associate with the new reader
const addRingReader = (buffer_index) => {
	return function (dispatch, store){

		var ring_buffer = SIMULATED_RING_BUFFER_STORAGE[buffer_index];

		// instantiate a new ring_ring when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_reader = new RingReader(ring_buffer)

		// store the ring reader based on the ring buffer index
		if(!SIMULATED_RING_READER_STORAGE[buffer_index]){
			SIMULATED_RING_READER_STORAGE[buffer_index] = [ring_reader];
		} else {
			SIMULATED_RING_READER_STORAGE[buffer_index].push(ring_reader)
		}

		// we can dispatch this in async if we were waiting on a machine to do something,
		// but for now just fire the ADD_RING_BUFFER reducer
		dispatch({
			type: 'ADD_RING_READER',
			buffer_index,
			reader_response: {...ring_reader}
		})

		// create a place holder in the stream response so our array indexs in our store match up
		dispatch({
			type: 'ADD_READER_READ_RESPONSE',
			buffer_index
		})

	}
}

const readRingReader = (buffer_index, reader_index) => {
	return function (dispatch, store){


		// instantiate a new ring_buffer when we want to add one.
		// this simulates a request to the machine or server to create a new buffer
		var ring_reader = SIMULATED_RING_READER_STORAGE[buffer_index][reader_index];

		let read_response = ring_reader.read();

		// we can dispatch this in async if we were waiting on a machine to do something,
		// but for now just fire the UPDATE_RING_BUFFER reducer
		dispatch({
			type: 'UPDATE_RING_READER',
			buffer_index,
			reader_index,
			reader_response: {...ring_reader},
		})

		// we store our read response stream separetly because it's not buffer data, its read request data
		dispatch({
			type: 'UPDATE_READER_READ_RESPONSE',
			buffer_index,
			reader_index,
			read_response: read_response
		})
	}
}

// components and containers

const RingView__component = ({
	
	ringBuffers,
	bufferReadResponseStream,
	
	onAddBuffer,
	onWriteBuffer,
	onReadBuffer,
	onCountBuffer,
	
	onAddRingReader,
	ringReaders,
	onReadRing,
	readerReadResponseStream
})=>{
	
	let trs = [],
		table = [];

	ringBuffers.map((ring_buffer, buffer_index)=>{

		let td = [];

		// we're going to show the buffer based on what's actually on it
		for( var x = 0; x < ring_buffer.buffer.length; x ++ ){

			let style = {};

			if(ring_buffer.position === x){
				style.backgroundColor = '#E0EEEE';
			}
			
			td.push(
				<td key={'buffer-' + buffer_index + "-" + x} style={style}>
					{ring_buffer.buffer[x] === undefined ? '' : ring_buffer.buffer[x]}
				</td>
			)
		}

		// ref for the input
		let write_input

		let response_string = '';
		if(bufferReadResponseStream.length > 0){
			bufferReadResponseStream[buffer_index].map((response)=>{
				response_string += response == '' ? '[empty] ' : response  + ' '
			})
		}

		let ring_reader_markup = [];
		// check to see if we have any readers associated with this buffer
		if(ringReaders[buffer_index]){
			// set up ring readers
			
			ringReaders[buffer_index].map((reader,index)=>{

				let reader_response_markup = '';
				readerReadResponseStream[buffer_index][index].map((response)=>{
					reader_response_markup += response == '' ? '[empty] ' : response  + ' '
				})

				ring_reader_markup.push(
				
					<p key={'reader-'+index}>
						<button onClick={(e)=>{
			        			e.preventDefault();
								onReadRing(buffer_index, index)
							}}>Ring Read {index + 1}</button> : {reader_response_markup}
					</p>
				)

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

						</form>

						<p><button onClick={(e)=>{
							e.preventDefault();
							onCountBuffer(buffer_index)
						}}>Count</button> : {ring_buffer.size}</p>
						<p>Position: {ring_buffer.position}</p>

						<p>Overwriting: {ring_buffer.full ? 'True' : 'False'}</p>
						<p><button onClick={(e)=>{
		        			e.preventDefault();
							onReadBuffer(buffer_index)
						}}>Buffer Read</button> : {response_string}</p>
						
						{ring_reader_markup}
						<p><button onClick={(e)=>{
		        			e.preventDefault();
							onAddRingReader(buffer_index)
						}}>Add Ring Reader</button></p>
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
				<form onSubmit={e => {
					e.preventDefault()
					onAddBuffer(+capacity_input.value)
					capacity_input.value = ''
				}}>
					Buffer Capacity: 
					<input placeholder={10} ref={node => {
						capacity_input = node
		    		}}></input>
		    		<button type="submit">Add new buffer</button>
				</form>
			</div>
		</section>
	)
}

const RingView__container = connect(
	(state)=>({
		ringBuffers: state.ringBuffers,
		ringReaders: state.ringReaders,
		bufferReadResponseStream: state.bufferReadResponseStream,
		readerReadResponseStream: state.readerReadResponseStream
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
		},

		onAddRingReader: (buffer_index)=>{
			dispatch(addRingReader(buffer_index))
		},
		onReadRing: (buffer_index, reader_index)=>{
			dispatch(readRingReader(buffer_index, reader_index))
		}
	})
)(RingView__component)



// reducers

const reducers = combineReducers({
	bufferReadResponseStream: (state = [], action) => {
		switch (action.type) {
			
			case 'ADD_BUFFER_READ_RESPONSE':
				// we store a blank placeholder so our arrays match up
				return [
					...state,
					[]
				]
			case 'UPDATE_BUFFER_READ_RESPONSE':
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
	},
	ringReaders: (state = {}, action) => {
		switch (action.type) {
			
			case 'ADD_RING_READER':

				let add_RingReader = {};
				
				// incase we don't have anything yet
				if(!state[action.buffer_index]){
					state[action.buffer_index] = []
				}

				// add the new reader
				add_RingReader[action.buffer_index] = [
					...state[action.buffer_index],
					{...action.reader_response}
				]

				let add_stateObject = Object.assign({}, state, add_RingReader)
				
				return add_stateObject

			case 'UPDATE_RING_READER':

				let update_RingReader = [];

				// add the new reader
				update_RingReader[action.buffer_index] = [
					...state[action.buffer_index].slice(0, action.reader_index),
					[...state[action.buffer_index],action.ring_reader],
					...state[action.buffer_index].slice(action.reader_index + 1)
				]

				let update_stateObject = Object.assign({}, state, update_RingReader)
				
				return update_stateObject

			default:
				return state
		}
	},
	readerReadResponseStream: (state = [], action) => {
		switch (action.type) {
			
			case 'ADD_READER_READ_RESPONSE':

				let add_RingReaderReadResponse = {};
				
				// incase we don't have anything yet
				if(!state[action.buffer_index]){
					state[action.buffer_index] = []
				}

				// add the new reader
				add_RingReaderReadResponse[action.buffer_index] = [
					...state[action.buffer_index],
					[]
				]

				let add_stateObject = Object.assign({}, state, add_RingReaderReadResponse)
				
				return add_stateObject

			case 'UPDATE_READER_READ_RESPONSE':

				let update_RingReaderReadResonse = {};

				update_RingReaderReadResonse[action.buffer_index] = [
					...state[action.buffer_index].slice(0, action.reader_index),
					[...state[action.buffer_index][action.reader_index],action.read_response],
					...state[action.buffer_index].slice(action.reader_index + 1)
				]

				let update_stateObject = Object.assign({}, state, update_RingReaderReadResonse)
				
				return update_stateObject

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