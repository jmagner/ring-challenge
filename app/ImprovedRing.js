class RingBuffer{
  constructor(capacity){
    this.buffer = new Array(capacity);
    this.size = 0;
    this.write_position = 0;
    this.read_position = 0;
  }
  write(input){

    // increment the size up to the buffer capacity
    if(this.size < this.buffer.length){
      this.size++;
    }

    // write to the buffer
    this.buffer[this.write_position++] = input;

    // if position is at the end, start overwriting
    if (this.write_position === this.buffer.length){
      this.write_position = 0;
    }

    // if buffer is full, align the read position to the write position, which is the beginning
    if(this.size === this.buffer.length){
      this.read_position = this.write_position;
    }

  }
  read(){
    
    // if there's nothing, reset the cursor
    if(this.size === 0) {
      this.write_position = 0;
      this.read_position = 0;
      return null;
    }

    // reduce the size because read
    this.size --;

    // if we read to the length of the buffer, read over the edge
    if(this.read_position === this.buffer.length){
      this.read_position = 0;
    }

    // return the current read position and increment
    return this.buffer[this.read_position++]
  }
  count(){
    return this.size;
  }
}