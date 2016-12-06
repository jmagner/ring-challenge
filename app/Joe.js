class RingBuffer{
  constructor(capacity){
    // buffer is a fixed array set to the capacity, so we can test against this.buffer.length later
    this.buffer = new Array(capacity);
    // this.size will track the count of unread items in the array
    this.size = 0;
    // this.position will track the current index to write to
    this.position = 0;
    // an array of pointers to reader instances
    this.subscribers = [];
  }
  write(input){
    
    // increment the size, up to the buffer capacity
    if(this.size < this.buffer.length){
      this.size++;
    }
    
    // write to the buffer, and then increment the position
    this.buffer[this.position++] = input;
    
    // if position reached the buffer capacity after the write, begin overwriting by setting position to 0
    if (this.position === this.buffer.length){
      this.position = 0;
    }
    
    // loop through any subscribers we may have and call their write functions too
    this.subscribers.forEach((subscriber)=>{
      subscriber.write(input);
    })
  }
  read(){
    
    // if there's nothing to read, reset the write position and return null
    if(this.size === 0) {
      this.position = 0;
      return null;
    }

    // We determine the read position by first testing whether "position - size is >= 0"
    // if position - size >= 0, then the buffer is not full.. consider:
    // in a partially filled buffer, with no reads, position and size will be equal
    // after some reads, size will subtract but position will not,  position - size will still be positive
    // if the buffer is full and writes occur, position will go back to a low number, and size will be buffer capacity, so
    // position - size will be a negative number.  In this case, we subtract that negative number from buffer capacity
    // to get the read correct position
    
    return this.buffer[
      this.position - this.size >= 0 ?
      this.position - this.size -- :
      (this.position - this.size --) + this.buffer.length
    ];

  }
  count(){
    return this.size;
  }
}

class RingReader extends RingBuffer{
  constructor(ring_buffer){
    super();
    // subscribe to the reader by pushing an instance of ourself to their subscription list
    ring_buffer.subscribers.push(this);
    // sync a reference to this.buffer, size, and position
    this.buffer = ring_buffer.buffer;
    this.size = ring_buffer.size;
    this.position = ring_buffer.position;
  }
}