const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Seeding FoodExpress database...');

    // Clear existing collections for a clean, sparkling state
    await User.deleteMany({ email: /.*@foodexpress\.com/ });
    await Restaurant.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});

    // 1. Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash('Demo@1234', salt);

    const customerUser = await User.create({
      name: 'Sayan Demo Customer',
      email: 'customer.demo@foodexpress.com',
      password: demoPassword,
      role: 'customer',
      phone: '+91 98765 11111',
      address: '102, Palm Grove Heights, Indiranagar, Bangalore',
      savedAddresses: [
        {
          label: 'Home',
          street: '102, Palm Grove Heights, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560038',
          phone: '+91 98765 11111',
          isDefault: true
        },
        {
          label: 'Work',
          street: 'Building 4B, RMZ Infinity, Old Madras Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560016',
          phone: '+91 98765 11111',
          isDefault: false
        }
      ]
    });

    const ownerUser = await User.create({
      name: 'Chef Rajesh Sharma',
      email: 'owner.demo@foodexpress.com',
      password: demoPassword,
      role: 'restaurant_owner',
      phone: '+91 98765 22222',
      address: 'Koramangala 4th Block, Bangalore'
    });

    const adminUser = await User.create({
      name: 'Platform Super Admin',
      email: 'admin.demo@foodexpress.com',
      password: demoPassword,
      role: 'admin',
      phone: '+91 98765 33333',
      address: 'MG Road Headquarters, Bangalore'
    });

    console.log('Demo users created.');

    // 2. Create Restaurants with comprehensive menus
    const restaurantData = [
      {
        owner: ownerUser._id,
        name: 'Royal Biryani & Kebabs',
        description: 'Authentic Hyderabadi Dum Biryani, Galouti Kebabs, and Mughlai curries slow-cooked to royal perfection.',
        location: 'Bangalore',
        address: { street: '12th Main Road, HAL 2nd Stage, Indiranagar', city: 'Bangalore', state: 'Karnataka', zipCode: '560038' },
        cuisine: ['Biryani', 'Mughlai', 'North Indian', 'Kebabs'],
        rating: 4.8,
        numRatings: 1420,
        deliveryTime: '25-35 mins',
        minimumOrder: 150,
        priceForTwo: 500,
        isOpen: true,
        isFeatured: true,
        discountText: '50% OFF up to ₹120',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
        menu: [
          {
            name: 'Hyderabadi Chicken Dum Biryani',
            description: 'Fragrant long-grain basmati rice cooked on dum with succulent bone-in chicken pieces and royal spices. Served with Mirchi ka Salan & Raita.',
            price: 349,
            category: 'Biryani',
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
            isVeg: false,
            isBestseller: true,
            rating: 4.9,
            nutritionalInfo: '680 kcal, High Protein'
          },
          {
            name: 'Royal Shahi Paneer Biryani',
            description: 'Tender marinated paneer cubes layered with caramelized onions, saffron milk, and aromatic basmati rice.',
            price: 299,
            category: 'Biryani',
            image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.7,
            nutritionalInfo: '540 kcal, Vegetarian'
          },
          {
            name: 'Murgh Malai Tikka (6 Pcs)',
            description: 'Boneless chicken cubes marinated in rich cashew paste, cheese, and cream, roasted in tandoor.',
            price: 319,
            category: 'Starters',
            image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80',
            isVeg: false,
            isBestseller: false,
            rating: 4.6
          },
          {
            name: 'Hara Bhara Kebab (6 Pcs)',
            description: 'Crispy pan-fried spinach and green pea patties blended with spices and mashed potatoes.',
            price: 229,
            category: 'Starters',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.5
          },
          {
            name: 'Butter Chicken Masala',
            description: 'Classic Delhi-style tandoori chicken simmered in rich creamy tomato and butter gravy.',
            price: 369,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
            isVeg: false,
            isBestseller: true,
            rating: 4.8
          },
          {
            name: 'Garlic Butter Naan',
            description: 'Crisp and fluffy tandoori naan brushed with melted garlic butter.',
            price: 65,
            category: 'Breads',
            image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.8
          },
          {
            name: 'Shahi Gulab Jamun (2 Pcs)',
            description: 'Warm soft milk dumplings soaked in saffron and cardamom sugar syrup.',
            price: 99,
            category: 'Desserts',
            image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.9
          }
        ]
      },
      {
        owner: ownerUser._id,
        name: 'Pizza Italia Artisanal',
        description: 'Wood-fired Neapolitan sourdough pizzas made with San Marzano tomatoes and imported mozzarella.',
        location: 'Bangalore',
        address: { street: '100 Feet Road, Koramangala 5th Block', city: 'Bangalore', state: 'Karnataka', zipCode: '560095' },
        cuisine: ['Pizza', 'Italian', 'Pasta', 'Fast Food'],
        rating: 4.7,
        numRatings: 980,
        deliveryTime: '20-30 mins',
        minimumOrder: 200,
        priceForTwo: 600,
        isOpen: true,
        isFeatured: true,
        discountText: '40% OFF up to ₹100',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
        menu: [
          {
            name: 'Margherita Burrata Sourdough Pizza',
            description: 'San Marzano tomato base, fresh burrata cheese, extra virgin olive oil, and fresh basil leaves.',
            price: 449,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.9
          },
          {
            name: 'Smoked Chicken & Jalapeño Pizza',
            description: 'Spicy tomato sauce, smoked paprika chicken chunks, roasted jalapeños, and melted mozzarella.',
            price: 529,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
            isVeg: false,
            isBestseller: true,
            rating: 4.8
          },
          {
            name: 'Creamy Truffle Mushroom Fettuccine',
            description: 'Al dente pasta tossed in creamy parmesan sauce with sautéed wild mushrooms and truffle oil.',
            price: 399,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.6
          },
          {
            name: 'Cheesy Garlic Pull-Apart Bread',
            description: 'Freshly baked sourdough bread stuffed with garlic herb butter and strings of mozzarella.',
            price: 199,
            category: 'Starters',
            image: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.8
          },
          {
            name: 'Classic Italian Tiramisu',
            description: 'Espresso-soaked ladyfinger biscuits layered with velvety mascarpone cheese and cocoa powder.',
            price: 249,
            category: 'Desserts',
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.9
          }
        ]
      },
      {
        owner: ownerUser._id,
        name: 'Punjab Grill & Dhaba',
        description: 'Authentic Grand Trunk Road Punjabi recipes: Dal Makhani, Paneer Tikka, Amritsari Kulchas and creamy Lassi.',
        location: 'Delhi',
        address: { street: 'Connaught Place, Block C', city: 'Delhi', state: 'Delhi', zipCode: '110001' },
        cuisine: ['North Indian', 'Punjabi', 'Tandoori'],
        rating: 4.6,
        numRatings: 850,
        deliveryTime: '30-40 mins',
        minimumOrder: 150,
        priceForTwo: 450,
        isOpen: true,
        isFeatured: true,
        discountText: '30% OFF using FOODIE30',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
        menu: [
          {
            name: 'Dal Makhani Bukhara',
            description: 'Slow-simmered black lentils cooked overnight with butter, fresh tomato puree, and cream.',
            price: 279,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.9
          },
          {
            name: 'Paneer Butter Masala',
            description: 'Rich cottage cheese cubes cooked in aromatic tomato onion gravy with fenugreek leaves.',
            price: 299,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.7
          },
          {
            name: 'Amritsari Stuffed Aloo Kulcha',
            description: 'Flaky clay oven baked bread stuffed with spiced potato and onion, served with Chole.',
            price: 149,
            category: 'Breads',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.6
          },
          {
            name: 'Patiala Thick Sweet Lassi',
            description: 'Traditional churned yoghurt drink served chilled with a thick layer of malai and dry fruits.',
            price: 99,
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.8
          }
        ]
      },
      {
        owner: ownerUser._id,
        name: 'Dragon Wok Asian Kitchen',
        description: 'Sizzling wok delicacies: Dimsums, Hakka Noodles, Crispy Chilli Baby Corn, and Manchurian Bowls.',
        location: 'Kolkata',
        address: { street: 'Park Street, Near Chowringhee', city: 'Kolkata', state: 'West Bengal', zipCode: '700016' },
        cuisine: ['Chinese', 'Asian', 'Thai', 'Noodles'],
        rating: 4.5,
        numRatings: 670,
        deliveryTime: '20-30 mins',
        minimumOrder: 150,
        priceForTwo: 400,
        isOpen: true,
        isFeatured: false,
        discountText: 'FLAT ₹50 OFF',
        imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80',
        menu: [
          {
            name: 'Steamed Chicken Momos (6 Pcs)',
            description: 'Delicate Himalayan dumplings filled with seasoned minced chicken, served with fiery red chutney.',
            price: 189,
            category: 'Starters',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&q=80',
            isVeg: false,
            isBestseller: true,
            rating: 4.8
          },
          {
            name: 'Chilli Chicken Dry',
            description: 'Kolkata Tangra-style boneless chicken tossed with green bell peppers, onions, and soya sauce.',
            price: 289,
            category: 'Starters',
            image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80',
            isVeg: false,
            isBestseller: true,
            rating: 4.7
          },
          {
            name: 'Veg Hakka Noodles',
            description: 'Wok-tossed noodles with julienned vegetables, spring onions, and light seasoning.',
            price: 199,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.5
          },
          {
            name: 'Schezwan Fried Rice',
            description: 'Spicy wok-fried rice with crushed red chillies, garlic, and fresh vegetables.',
            price: 219,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.6
          }
        ]
      },
      {
        owner: ownerUser._id,
        name: 'Dakshin South Spice Cafe',
        description: 'Crispy Ghee Podi Dosa, Fluffy Thatte Idli, Medu Vada, and authentic filter coffee from Madurai.',
        location: 'Chennai',
        address: { street: 'T. Nagar, North Boag Road', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600017' },
        cuisine: ['South Indian', 'Pure Veg', 'Breakfast'],
        rating: 4.9,
        numRatings: 1890,
        deliveryTime: '15-25 mins',
        minimumOrder: 100,
        priceForTwo: 250,
        isOpen: true,
        isFeatured: true,
        discountText: 'FREE Delivery over ₹199',
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80',
        menu: [
          {
            name: 'Ghee Podi Masala Dosa',
            description: 'Golden crispy crepe roasted in pure country ghee, dusted with gunpowder spice, and stuffed with spiced potatoes.',
            price: 169,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.9
          },
          {
            name: 'Button Ghee Sambar Idli (14 Pcs)',
            description: 'Bite-sized mini idlis immersed in hot aromatic Madras sambar, finished with pure ghee.',
            price: 139,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.8
          },
          {
            name: 'Crispy Medu Vada (2 Pcs)',
            description: 'Deep-fried golden lentil fritters served with coconut chutney and tangy sambar.',
            price: 89,
            category: 'Starters',
            image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.7
          },
          {
            name: 'Authentic Kumbakonam Degree Coffee',
            description: 'Hot frothy chicory-blend filter coffee served in brass davarah style.',
            price: 60,
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 5.0
          }
        ]
      },
      {
        owner: ownerUser._id,
        name: 'The Burger Barn & Shakes',
        description: 'Smash burgers, crispy fried chicken burgers, seasoned waffle fries, and decadent thick shakes.',
        location: 'Mumbai',
        address: { street: 'Bandra West, Linking Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
        cuisine: ['Burgers', 'American', 'Fast Food', 'Shakes'],
        rating: 4.6,
        numRatings: 730,
        deliveryTime: '20-30 mins',
        minimumOrder: 150,
        priceForTwo: 450,
        isOpen: true,
        isFeatured: false,
        discountText: '30% OFF with WELCOME50',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
        menu: [
          {
            name: 'Crispy Korean Fried Chicken Burger',
            description: 'Crunchy chicken thigh dipped in sweet spicy Gochujang glaze, topped with kimchi slaw on brioche.',
            price: 299,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
            isVeg: false,
            isBestseller: true,
            rating: 4.8
          },
          {
            name: 'Smoked Truffle Veggie Smash Burger',
            description: 'House-made quinoa and black bean patty with cheddar cheese, caramelized onions, and truffle mayo.',
            price: 259,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.5
          },
          {
            name: 'Peri Peri Crinkle Cut Fries',
            description: 'Crispy hot crinkle fries dusted with African bird eye peri-peri seasoning.',
            price: 139,
            category: 'Starters',
            image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.7
          },
          {
            name: 'Belgian Chocolate Thick Shake',
            description: 'Rich dark chocolate gelato blended with milk and topped with whipped cream and chocolate curls.',
            price: 189,
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.9
          }
        ]
      },
      {
        owner: ownerUser._id,
        name: 'Sweet Tooth Dessert Bar',
        description: 'Artisan pastries, gourmet waffles, Belgian chocolate brownies, and handcrafted ice cream sundaes.',
        location: 'Hyderabad',
        address: { street: 'Jubilee Hills, Road No. 36', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' },
        cuisine: ['Desserts', 'Bakery', 'Ice Cream'],
        rating: 4.8,
        numRatings: 1120,
        deliveryTime: '15-25 mins',
        minimumOrder: 120,
        priceForTwo: 350,
        isOpen: true,
        isFeatured: false,
        discountText: 'Flat 20% OFF',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
        menu: [
          {
            name: 'Sizzling Hot Chocolate Fudge Brownie',
            description: 'Warm walnut brownie smothered with hot Dutch fudge sauce and a scoop of vanilla ice cream.',
            price: 199,
            category: 'Desserts',
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.9
          },
          {
            name: 'Nutella Belgian Waffle',
            description: 'Freshly baked golden waffle slathered with genuine Nutella and roasted hazelnut flakes.',
            price: 229,
            category: 'Desserts',
            image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.8
          },
          {
            name: 'Red Velvet Cheesecake Slice',
            description: 'Smooth New York-style cheesecake layered with rich red velvet sponge and cream cheese frosting.',
            price: 249,
            category: 'Desserts',
            image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.7
          }
        ]
      },
      {
        owner: ownerUser._id,
        name: 'The Green Bowl & Salads',
        description: 'Nutritious superfood bowls, cold-pressed fruit juices, avocado toasts, and protein smoothies.',
        location: 'Bangalore',
        address: { street: 'Koramangala 6th Block, 80 Feet Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560095' },
        cuisine: ['Healthy Food', 'Salads', 'Juices', 'Continental'],
        rating: 4.6,
        numRatings: 540,
        deliveryTime: '20-30 mins',
        minimumOrder: 150,
        priceForTwo: 500,
        isOpen: true,
        isFeatured: false,
        discountText: '25% OFF Healthy Deals',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        menu: [
          {
            name: 'Mediterranean Falafel Quinoa Bowl',
            description: 'Organic quinoa, crispy herbed falafel, hummus, cucumber salad, kalamata olives, and tahini drizzle.',
            price: 329,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80',
            isVeg: true,
            isBestseller: true,
            rating: 4.8,
            nutritionalInfo: '450 kcal, High Fiber'
          },
          {
            name: 'Grilled Herb Chicken Protein Salad',
            description: 'Tender chicken breast, baby spinach, cherry tomatoes, avocado, pumpkin seeds with honey mustard vinaigrette.',
            price: 369,
            category: 'Main Course',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
            isVeg: false,
            isBestseller: true,
            rating: 4.9,
            nutritionalInfo: '520 kcal, 42g Protein'
          },
          {
            name: 'Berry Blast Antioxidant Smoothie',
            description: 'Blueberries, strawberries, Greek yogurt, chia seeds, and raw honey blend.',
            price: 189,
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80',
            isVeg: true,
            isBestseller: false,
            rating: 4.7
          }
        ]
      }
    ];

    const insertedRestaurants = await Restaurant.insertMany(restaurantData);
    console.log(`Created ${insertedRestaurants.length} restaurants with menus.`);

    // 3. Create Coupons
    const coupons = [
      {
        code: 'WELCOME50',
        description: '50% off on your first order up to ₹150',
        discountPercent: 50,
        maxDiscount: 150,
        minOrderAmount: 199,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'FOODIE30',
        description: 'Flat 30% off on all restaurants up to ₹100',
        discountPercent: 30,
        maxDiscount: 100,
        minOrderAmount: 149,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'FREESHIP',
        description: 'Free delivery on orders above ₹199',
        discountPercent: 100,
        maxDiscount: 40,
        minOrderAmount: 199,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'FESTIVE20',
        description: '20% off up to ₹200 for celebrations',
        discountPercent: 20,
        maxDiscount: 200,
        minOrderAmount: 299,
        isActive: true,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
      }
    ];

    await Coupon.insertMany(coupons);
    console.log('Created coupons.');

    // 4. Create Initial Reviews
    const sampleReviews = [
      {
        user: customerUser._id,
        userName: 'Sayan Demo Customer',
        restaurant: insertedRestaurants[0]._id,
        rating: 5,
        comment: 'Hands down the best Hyderabadi Biryani in town! The spices were spot on and chicken was super tender.'
      },
      {
        user: customerUser._id,
        userName: 'Priya Sharma',
        restaurant: insertedRestaurants[0]._id,
        rating: 4,
        comment: 'Loved the Dum Biryani and Murgh Malai Tikka. Packaging was very neat and warm.'
      },
      {
        user: customerUser._id,
        userName: 'Amitav Sen',
        restaurant: insertedRestaurants[1]._id,
        rating: 5,
        comment: 'The burrata margherita pizza is phenomenal. Crust has that authentic wood-fired char!'
      },
      {
        user: customerUser._id,
        userName: 'Kavita Iyer',
        restaurant: insertedRestaurants[4]._id,
        rating: 5,
        comment: 'Filter coffee is legendary! Dosa was super crispy and sambar was piping hot.'
      }
    ];

    await Review.insertMany(sampleReviews);
    console.log('Created initial reviews.');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

