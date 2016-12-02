class RingBuffer{
  constructor(capacity){
    this.buffer = new Array(capacity);
    this.size = 0;
    this.position = 0;
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