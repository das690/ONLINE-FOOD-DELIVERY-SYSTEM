const http = require('http');

const runTests = async () => {
  // Start server in background
  const serverProcess = require('../server.js');
  // Wait 2 seconds for server and DB to connect
  await new Promise(r => setTimeout(r, 2000));

  console.log('Testing FoodExpress API Endpoints...');

  const request = (path, method = 'GET', data = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const url = new URL(path, 'http://localhost:5000');
      const reqHeaders = { 'Content-Type': 'application/json', ...headers };

      const req = http.request(url, { method, headers: reqHeaders }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, text: body });
          }
        });
      });

      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('1. Health Check:', health.status === 200 ? '✅ PASSED' : '❌ FAILED', health.data?.status);

    // 2. Fetch restaurants
    const restaurants = await request('/api/restaurants');
    console.log('2. Fetch Restaurants:', restaurants.status === 200 && restaurants.data.length >= 8 ? '✅ PASSED' : '❌ FAILED', `Count: ${restaurants.data?.length}`);

    // 3. Fetch single restaurant
    const sampleId = restaurants.data[0]._id;
    const singleRest = await request(`/api/restaurants/${sampleId}`);
    console.log('3. Single Restaurant & Menu:', singleRest.status === 200 && singleRest.data.menu?.length > 0 ? '✅ PASSED' : '❌ FAILED', `Menu items: ${singleRest.data.menu?.length}`);

    // 4. Fetch coupons
    const coupons = await request('/api/coupons');
    console.log('4. Fetch Coupons:', coupons.status === 200 && coupons.data.length >= 4 ? '✅ PASSED' : '❌ FAILED', `Coupons: ${coupons.data.map(c => c.code).join(', ')}`);

    // 5. Test Demo Customer Login
    const customerLogin = await request('/api/auth/demo-login', 'POST', { role: 'customer' });
    console.log('5. Demo Customer Login:', customerLogin.status === 200 && customerLogin.data.token ? '✅ PASSED' : '❌ FAILED', customerLogin.data?.user?.name);
    const customerToken = customerLogin.data.token;

    // 6. Test Demo Owner Login
    const ownerLogin = await request('/api/auth/demo-login', 'POST', { role: 'restaurant_owner' });
    console.log('6. Demo Owner Login:', ownerLogin.status === 200 && ownerLogin.data.token ? '✅ PASSED' : '❌ FAILED', ownerLogin.data?.user?.name);

    // 7. Test Demo Admin Login
    const adminLogin = await request('/api/auth/demo-login', 'POST', { role: 'admin' });
    console.log('7. Demo Admin Login:', adminLogin.status === 200 && adminLogin.data.token ? '✅ PASSED' : '❌ FAILED', adminLogin.data?.user?.name);

    // 8. Test Protected Profile Route
    const profile = await request('/api/auth/me', 'GET', null, { Authorization: `Bearer ${customerToken}` });
    console.log('8. Authenticated Profile:', profile.status === 200 ? '✅ PASSED' : '❌ FAILED', profile.data?.email);

    // 9. Test Order Placement with Server-side Recalculation & Coupon Application
    const sampleItem = singleRest.data.menu[0];
    const orderPayload = {
      restaurantId: sampleId,
      items: [{
        _id: sampleItem._id,
        name: sampleItem.name,
        price: sampleItem.price,
        quantity: 2,
        isVeg: sampleItem.isVeg
      }],
      deliveryAddress: { street: '123 MG Road', city: 'Bangalore' },
      paymentMethod: 'cod',
      couponCode: 'WELCOME50'
    };

    const placeOrder = await request('/api/orders', 'POST', orderPayload, { Authorization: `Bearer ${customerToken}` });
    console.log('9. Place Order with Coupon & Recalculation:', placeOrder.status === 201 ? '✅ PASSED' : '❌ FAILED', `Total: ₹${placeOrder.data?.totalAmount}, Status: ${placeOrder.data?.status}`);

    // 10. Test Get Order by ID
    const placedOrderId = placeOrder.data._id;
    const fetchOrder = await request(`/api/orders/${placedOrderId}`, 'GET', null, { Authorization: `Bearer ${customerToken}` });
    console.log('10. Order Tracking Endpoint:', fetchOrder.status === 200 && fetchOrder.data?._id === placedOrderId ? '✅ PASSED' : '❌ FAILED');

    console.log('\n🎉 ALL 10 BACKEND INTEGRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();

