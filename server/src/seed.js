import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from './config/env.js';
import { AdminUser } from './models/AdminUser.js';
import { Organization } from './models/Organization.js';
import { OrganizationUser } from './models/OrganizationUser.js';
import { QRCode } from './models/QRCode.js';
import { Subscription } from './models/Subscription.js';
import { CustomerSubmission } from './models/CustomerSubmission.js';
import { PlatformSettings } from './models/PlatformSettings.js';
import { generateSecureToken } from './utils/tokenGenerator.js';
import { generateReferenceNumber } from './utils/referenceNumber.js';
import { ROLES } from './constants/roles.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Seed Platform Settings
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({
        platformName: 'Compliance QR Code Platform',
        defaultServiceDurationDays: 30,
        defaultGracePeriodDays: 3,
        expiringWarningDays: 3,
        defaultComplaintCategories: [
          'Service',
          'Staff',
          'Cleanliness',
          'Food',
          'Security',
          'Facilities',
          'Payment',
          'Other',
        ],
      });
      console.log('[Seed] Default platform settings created.');
    }

    // 2. Seed Platform Admin
    const adminUsername = (ENV.ADMIN_USERNAME || 'admin').toLowerCase();
    let admin = await AdminUser.findOne({ username: adminUsername });

    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD || 'Admin@123456', salt);

      admin = await AdminUser.create({
        fullName: ENV.ADMIN_FULLNAME || 'Platform Admin',
        username: adminUsername,
        email: 'admin@complianceqr.com',
        phone: '+252 61 500 0000',
        passwordHash,
        role: ROLES.PLATFORM_ADMIN,
        isActive: true,
      });
      console.log(`[Seed] Platform Admin created: ${admin.username} / ${ENV.ADMIN_PASSWORD || 'Admin@123456'}`);
    } else {
      console.log(`[Seed] Platform Admin already exists: ${admin.username}`);
    }

    // 3. Seed Sample Hospital Organization if none exists
    const orgCount = await Organization.countDocuments();
    if (orgCount === 0) {
      console.log('[Seed] Seeding sample organization: ABC General Hospital...');

      const org = await Organization.create({
        name: 'ABC General Hospital',
        displayTitle: 'Isbitaalka Guud ee ABC Hospital',
        email: 'info@abchospital.so',
        phone: '+252 61 700 1122',
        whatsapp: '+252 61 700 1122',
        organizationType: 'Hospital',
        address: 'KM4 Maka Al-Mukarama Street, Mogadishu',
        branch: 'Main Hospital Center',
        description: 'Leading healthcare provider in Mogadishu offering 24/7 emergency and specialist care.',
        status: 'ACTIVE',
        complaintCategories: ['Doctors & Nurses', 'Pharmacy', 'Emergency Wait Time', 'Cleanliness & Hygiene', 'Billing & Reception', 'Facilities', 'Other'],
      });

      // Sample Org User
      const userSalt = await bcrypt.genSalt(10);
      const userHash = await bcrypt.hash('Hospital@123', userSalt);
      const orgUser = await OrganizationUser.create({
        organizationId: org._id,
        fullName: 'Dr. Ali Hassan',
        username: 'abchospital',
        phone: '+252 61 700 1122',
        passwordHash: userHash,
        mustChangePassword: false,
        status: 'ACTIVE',
      });

      // Sample Secure QR Code
      const qrToken = generateSecureToken(16);
      const qr = await QRCode.create({
        organizationId: org._id,
        publicToken: qrToken,
        status: 'ACTIVE',
        scanCount: 12,
        generatedAt: new Date(),
      });

      // Sample 30-Day Subscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const subscription = await Subscription.create({
        organizationId: org._id,
        startDate,
        endDate,
        gracePeriodDays: 3,
        gracePeriodEndDate: new Date(endDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      });

      org.activeQrId = qr._id;
      org.activeSubscriptionId = subscription._id;
      await org.save();

      // Sample Complaints (CABASHO)
      await CustomerSubmission.create([
        {
          organizationId: org._id,
          qrCodeId: qr._id,
          referenceNumber: generateReferenceNumber('COMPLAINT'),
          type: 'COMPLAINT',
          customerName: 'Khadar Ahmed',
          customerPhone: '+252 61 888 9900',
          category: 'Emergency Wait Time',
          message: 'Qaybta gurmadka degdegga ah safka wuu aad u dheeraa, dhakhtarkuna wuu daahay 45 daqiiqo.',
          priority: 'HIGH',
          status: 'NEW',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          organizationId: org._id,
          qrCodeId: qr._id,
          referenceNumber: generateReferenceNumber('COMPLAINT'),
          type: 'COMPLAINT',
          customerName: 'Fatima Omar',
          customerPhone: '+252 61 444 3322',
          category: 'Pharmacy',
          message: 'Daawooyinkii loo qoray bukaanka qayb kamid ah lama helin farmashiyaha.',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          organizationId: org._id,
          qrCodeId: qr._id,
          referenceNumber: generateReferenceNumber('FEEDBACK'),
          type: 'FEEDBACK',
          customerName: 'Yusuf Nur',
          customerPhone: '+252 61 222 1100',
          category: 'Facilities',
          message: 'Shaqaalaha soo dhaweynta aad ayay u edeb badnaayeen, adeeg hufan.',
          suggestedSolution: 'Fadlan ku dara kuraas dheeraad ah qolka sugitaanka.',
          priority: 'LOW',
          status: 'RESOLVED',
          submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      ]);

      console.log('[Seed] Sample ABC General Hospital seeded successfully!');
      console.log(`[Seed] Org User: abchospital / Hospital@123`);
      console.log(`[Seed] Public QR URL: ${ENV.FRONTEND_URL}/c/${qrToken}`);
    }

    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
