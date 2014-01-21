if (process.env && process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
  console.log('*** INFO disabling console.log');
  console.log('*** INFO other methods should still work');
  console._orig_log = console.log.bind(console);
  console.log = function() {};
}
