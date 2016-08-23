(function(){

	// First case from Chris P.

	const ring = new RingBuffer(4);
	
	ring.write(5)
	ring.write(4)
	ring.write(3)
	
	expect(ring.read()).toBe(5)
	expect(ring.read()).toBe(4)
	expect(ring.read()).toBe(3)

	console.log('Test passed.')

}());

(function(){

	// Second case from Chris P.

	const ring = new RingBuffer(4);

	ring.write(5)
	ring.write(4)
	ring.write(3)
	ring.write(2)
	ring.write(1)

	expect(ring.read()).toBe(4)
	expect(ring.read()).toBe(3)
	expect(ring.read()).toBe(2)
	expect(ring.read()).toBe(1)
	expect(ring.read()).toBe(null)

	console.log('Test passed.')

}());

(function(){

	// Test the count(), with a random capacity between 1-1000
	const	min = 1,
			max = 1000,
			random_capacity = Math.floor(Math.random() * (max - min + 1)) + min;

	const ring = new RingBuffer(random_capacity)

	// Fill must fill the random capacity
	for ( x = 0; x < random_capacity; x ++){
		ring.write(x)
	}

	expect(ring.count()).toBe(random_capacity)

	console.log('Test passed.')

}());

(function(){

	// Load test, read in order, with a random capacity between 9mm-10mm
	const	min = 9000000,
			max = 10000000,
			random_capacity = Math.floor(Math.random() * (max - min + 1)) + min;

	const ring = new RingBuffer(random_capacity)

	const start = new Date().getTime()

	// Fill must fill the random capacity
	for ( x = 0; x < random_capacity; x ++){
		ring.write(x)
	}

	// Read the random capacity, in order
	for ( y = 0; y < random_capacity; y ++){
		expect(ring.read()).toBe(y)
	}

	const end = new Date().getTime();
	
	console.log('Test passed, ' + random_capacity + ' executions in ' + (end - start) + 'ms' )

}());
