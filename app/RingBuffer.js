class RingBuffer{
	constructor(size){
		
		this.buffer = new Array(size);

		this.size = 0;
		this.position = 0;
		this.isOverwriting = false;

		this.subscribers = [];

	}
	write(input){

		// if the position is >= to the buffer capacity,
		// start overwriting and loop around
		if(this.position >= this.buffer.length) {
			this.isOverwriting = true;
			this.position = 0;
		};

		// increment the size up to the buffer capacity
		if(this.size < this.buffer.length) {
			this.size ++;
		};

		// write to the buffer
		this.buffer[this.position++] = input;

		// if our size matches our position, stop overwriting
		if(this.size == this.position){
			this.isOverwriting = false;
		}

		// if we have subscribers, they need to be updated as well
		if(this.subscribers){

			// loop through and write the input to subscribers
			for(var subscriber_index = 0; subscriber_index < this.subscribers.length; subscriber_index++){

				let subscriber = this.subscribers[subscriber_index];

				subscriber.write(input)
			}
		}

		
	}
	read(){

		// nothing to read, return null
		// reset the write position
		if(!this.size) { this.position = 0; return null; }
		
		// when overwriting, we're reading from the cursor position
		if(this.isOverwriting){

			// if we read over the edge, reset the cursor position to 0
			if(this.position >= this.buffer.length){
				this.position = 0;
			}

			// decrement the size
			this.size --;
			
			// read the buffer
			return this.buffer[this.position++]

		} else {

			// set the position to 0 if we read around the end of the ring
			// loop around to the end of the array.
			// notice that we're not checking >= here, just >.
			if(this.position > this.buffer.length){
				this.position = 0;
			}

			// read from the cursor position - the size of the set, and decrement afterwards
			return this.buffer[this.position - this.size--]
		}
		
	}
	count(){
		return this.size;
	}
}

class RingReader extends RingBuffer {
	constructor(ring_buffer){

		super(ring_buffer.buffer.length)

		// you can't subscribe to a reader
		delete this.subscribers

		// subscribe to the buffer
		ring_buffer.subscribers.push(this)

		// set the defaults to where we extended the buffer
		let {buffer, size, position, isOverwriting} = ring_buffer

		this.buffer = buffer
		this.size = size
		this.position = position
		this.isOverwriting = isOverwriting

	}
}