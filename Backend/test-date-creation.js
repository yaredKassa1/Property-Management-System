/**
 * Test Date Creation Methods
 */

console.log('🧪 Testing Date Creation Methods\n');

// Method 1: Using setMinutes (current implementation)
const method1 = () => {
  const expiry = new Date();
  console.log('Method 1 (setMinutes):');
  console.log('  Before:', expiry.toISOString(), '|', expiry.toString());
  expiry.setMinutes(expiry.getMinutes() + 10);
  console.log('  After: ', expiry.toISOString(), '|', expiry.toString());
  return expiry;
};

// Method 2: Using getTime + milliseconds
const method2 = () => {
  const now = new Date();
  console.log('\nMethod 2 (getTime + ms):');
  console.log('  Before:', now.toISOString(), '|', now.toString());
  const expiry = new Date(now.getTime() + (10 * 60 * 1000));
  console.log('  After: ', expiry.toISOString(), '|', expiry.toString());
  return expiry;
};

// Method 3: Using UTC methods
const method3 = () => {
  const now = new Date();
  console.log('\nMethod 3 (UTC):');
  console.log('  Before:', now.toISOString(), '|', now.toString());
  const expiry = new Date(Date.now() + (10 * 60 * 1000));
  console.log('  After: ', expiry.toISOString(), '|', expiry.toString());
  return expiry;
};

const expiry1 = method1();
const expiry2 = method2();
const expiry3 = method3();

console.log('\n📊 Comparison:');
console.log('  Method 1 valueOf:', expiry1.valueOf());
console.log('  Method 2 valueOf:', expiry2.valueOf());
console.log('  Method 3 valueOf:', expiry3.valueOf());

console.log('\n⏱️  Time differences from now:');
const now = Date.now();
console.log('  Method 1:', Math.floor((expiry1.valueOf() - now) / 1000), 'seconds');
console.log('  Method 2:', Math.floor((expiry2.valueOf() - now) / 1000), 'seconds');
console.log('  Method 3:', Math.floor((expiry3.valueOf() - now) / 1000), 'seconds');
