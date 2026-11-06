// Old addresses and where they went: the router forwards them, and the
// build writes a forwarding page for each (scripts/prerender.mjs), so old
// links and search results keep working
export const MOVED = {
  '/setup': '/get-started', // before 1.0.27
  // Learn the IMU's chapters, folded into the pages in 1.3.x
  '/learn/imu': '/learn/motion',
  '/learn/imu/raw-numbers': '/mpu6050#raw',
  '/learn/imu/tilt': '/physics/acceleration',
  '/learn/imu/gyro-angle': '/physics/rotation',
  '/learn/imu/fusion': '/algorithms/attitude',
  '/learn/imu/attitude': '/algorithms/attitude',
  '/learn/imu/calibration': '/mpu6050#calibration',
  '/learn/imu/faq': '/learn/motion#questions',
};
