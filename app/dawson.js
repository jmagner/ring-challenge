function RingReader(ringBuffer, currentPosition) {
  this.buffer = ringBuffer;
  // The reader must keep track of its own position.
  // It starts at the current length of the buffer
  this.position = currentPosition;
 
  // Add 1 to the current position.
  this.addPosition = function() {
    // Only add to the position if it would not go over the max size.
    if (this.position < this.buffer.getSize() - 1) {
      this.position++;
    }
  };
 
  // Read the oldest item still in the buffer.
  this.read = function() {
    // Only read if position is positive.
    if (this.position >= 0) {
      // Read the current position and decrement it.
      return this.buffer.readPosition(this.position--);
    }
    else {
      // No valid position.
      return null;
    }
  };
 
  // Get the number of unread items.
  this.count = function() {
    return this.position + 1;
  };
}
 
function RingBuffer(size) {
  // Set the size so we know when to stop filling the array.
  this.size = size;
  // Initialize the array.
  this.buffer = [];
  // Subscribers are allowed to read from the buffer independently.
  // Initialize the subscribers.
  this.subscribers = [];
 
  // Get the max size of the buffer.
  this.getSize = function() {
    return this.size;
  };
 
  // Add data to the buffer.
  this.write = function(data) {
    // Add new data to the front of the array.
    this.buffer.unshift(data);
    // Check if the array is now bigger than the max size.
    if (this.buffer.length > this.size) {
      // The array is too big, so remove the oldest item.
      this.buffer.pop();
    }
 
    // Increment all subscribers.
    this.addPosition();
  };
 
  // Add 1 to the position of all subscribers.
  this.addPosition = function() {
    // Loop through all subscribers.
    for(index in this.subscribers) {
      // Add 1 to the subscriber.
      this.subscribers[index].addPosition();
    }
  };
 
  // Read the oldest item still in the buffer.
  this.read = function() {
    // Subscriber 0 is the buffer's self reader.
    return this.subscribers[0].read();
  };
 
  // Read from a specific position in the buffer.
  this.readPosition = function(position) {
    // Make sure it is a legal position.
    if (position >= 0 && position < this.size) {
      return this.buffer[position];
    }
    else {
      // Not a legal position.
      return null;
    }
  };
 
  // Get the count of unread items.
  this.count = function() {
    // Subscriber 0 is the buffer's self reader.
    return this.subscribers[0].count();
  };
 
  // Subscribe to the buffer with an independent reader.
  this.subscribe = function() {
    var reader = new RingReader(this, this.buffer.length -1);
    this.subscribers.push(reader);
    return reader;
  };
 
  // Add subscriber 0 so the reader can read from itself.
  // This must be done after the subscribe function is added to the class.
  this.subscribe();
}
 
// console.log('scenario 1')
// var rb = new RingBuffer(4)
// rb.write('a')
// rb.write('b')
// rb.write('c')
// rb.write('d')
// rb.write('e')
// console.log(rb.read())
// console.log(rb.read())
// console.log(rb.read())
// console.log(rb.read())
// console.log(rb.read())
// console.log(rb.read())
 
// console.log('scenario 2')
// rb = new RingBuffer(2)
// rb.write('a')
// var readerA = rb.subscribe()
// var readerB = rb.subscribe()
// console.log('A:' + readerA.read())
// console.log('B:' + readerB.read())
// rb.write('b')
// console.log('A:' + readerA.read())
// console.log('B:' + readerB.read())
 
 
// console.log('scenario 3')
// rb = new RingBuffer(2)
// rb.write('a')
// rb.write('b')
// var readerA = rb.subscribe()
// console.log('A:' + readerA.read())
// console.log('A:' + readerA.read())
// rb.write('c')
// var readerB = rb.subscribe()
// console.log('B:' + readerB.read())
// console.log('B:' + readerB.read())
// console.log('A:' + readerA.read())
 
// console.log('scenario 4')
// var ring = new RingBuffer(10);
 
//     ring.write(1)
//     ring.write(2)
//     ring.write(3)
//     ring.write(4)
//     ring.write(5)
//     ring.write(6)
//     ring.write(7)
//     ring.write(8)
//     ring.write(9)
//     ring.write(10)
 
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
 
//     ring.write('x')
//     ring.write('y')
//     ring.write('z')
 
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
//     console.log(ring.read())
 