class RingBuffer{
  constructor(capacity){
    this.buffer = new Array(capacity);
    this.size = 0;
    this.position = 0;
    this.subscribers = [];
  }
  write(input){
    if(this.size < this.buffer.length){ this.size++; }
    this.buffer[this.position++] = input;
    if (this.position === this.buffer.length){ this.position = 0; }
    this.subscribers.forEach((subscriber)=>{ subscriber.write(input); })
  }
  read(){
    if(this.size === 0) { this.position = 0; return null; }
    return this.buffer[this.position - this.size >= 0 ? this.position - this.size -- : (this.position - this.size --) + this.buffer.length];
  }
  count(){
    return this.size;
  }
}
class RingReader extends RingBuffer{
  constructor(ring_buffer){
    super();
    ring_buffer.subscribers.push(this);
    this.buffer = ring_buffer.buffer;
    this.size = ring_buffer.size;
    this.position = ring_buffer.position;
  }
}