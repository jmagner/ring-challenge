class RingBuffer{
  constructor(capacity){
    this.buffer = new Array(capacity);
    this.size = 0;
    this.position = 0;
    this.subscribers = [];
  }
  write(input){
    // increment the size up to the buffer capacity
    if(this.size < this.buffer.length){
      this.size++;
    }
    // write to the buffer
    this.buffer[this.position++] = input;
    // if position is at the end, start overwriting
    if (this.position === this.buffer.length){
      this.position = 0;
    }
    // if we have subscribers, they need to be updated as well
    if(this.subscribers){
      // loop through and write the input to subscribers
      for(var subscriber_index = 0; subscriber_index < this.subscribers.length; subscriber_index++){
        var subscriber = this.subscribers[subscriber_index];
        subscriber.write(input)
      }
    }
  }
  read(){
    // if there's nothing, reset the position and return null
    if(!this.size) {
      this.position = 0;
      return null;
    }
    // position - the size... if its negative then subtract that from the total length, otherwise subtract size from position,
    // then finally, decrement the size
    return this.buffer[this.position - this.size < 0 ? this.buffer.length + (this.position - this.size--) : this.position - this.size--]
  }
  count(){
    return this.size;
  }
}

class RingReader extends RingBuffer{
  constructor(ring_buffer){
    super(ring_buffer.buffer.length);
    // you can't subscribe to a reader
    delete this.subscribers;
    // subscribe to the buffer
    ring_buffer.subscribers.push(this);
    // set the defaults to where we extended the buffer
    var {buffer, size, position, isOverwriting} = ring_buffer;
    this.buffer = buffer;
    this.size = size;
    this.position = position;
  }
}