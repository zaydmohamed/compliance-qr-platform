import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { Organization } from '../models/Organization.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { QRCode } from '../models/QRCode.js';
import { Notification } from '../models/Notification.js';
import { CustomerSubmission } from '../models/CustomerSubmission.js';
import { createCompleteOrganization } from '../services/organization.service.js';
import { createPublicSubmission } from '../services/submission.service.js';
import { SUBMISSION_TYPE, NOTIFICATION_TYPE } from '../constants/statuses.js';

const runTests = async () => {
  try {
    console.log('\n======================================================');
    console.log('🧪 RUNNING END-TO-END NOTIFICATION & MESSAGING TESTS');
    console.log('======================================================\n');

    await mongoose.connect(ENV.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB');

    const testTimestamp = Date.now();
    const adminUserStub = {
      _id: new mongoose.Types.ObjectId(),
      fullName: 'Test Platform Admin',
      role: 'PLATFORM_ADMIN',
    };

    // ==========================================================
    // TEST FLOW A: Organization Account Creation SMS
    // ==========================================================
    const testPhone = '0619254366';

    // Pre-test cleanup
    await OrganizationUser.deleteMany({ phone: testPhone });
    await Organization.deleteMany({ phone: testPhone });

    console.log('\n--- [FLOW A]: Testing Organization Account Creation SMS ---');
    const testOrgData = {
      name: `Test Org ${testTimestamp}`,
      displayTitle: `Test Clinic ${testTimestamp}`,
      email: `testorg_${testTimestamp}@example.com`,
      phone: testPhone,
      whatsapp: testPhone,
      organizationType: 'Hospital',
      branch: 'Main Branch',
    };

    const testUserData = {
      fullName: 'Hassan Test Rep',
      username: `testrep_${testTimestamp}`,
      phone: testPhone,
    };

    const created = await createCompleteOrganization(
      { orgData: testOrgData, userData: testUserData, logoPath: 'https://res.cloudinary.com/test/image/upload/sample.jpg' },
      adminUserStub
    );

    console.log(`✅ Organization created: ${created.organization.name} (ID: ${created.organization._id})`);
    console.log(`✅ Org User created: ${created.user.username}`);

    // Wait 1.5s for async notifications to insert
    await new Promise((r) => setTimeout(r, 1500));

    const creationNotification = await Notification.findOne({
      organizationId: created.organization._id,
      type: NOTIFICATION_TYPE.ACCOUNT_CREATION,
    });

    if (creationNotification) {
      console.log(`✅ [FLOW A PASSED] Account Creation SMS record found:`);
      console.log(`   - Recipient: ${creationNotification.recipient}`);
      console.log(`   - Type: ${creationNotification.type}`);
      console.log(`   - Status: ${creationNotification.status}`);
      console.log(`   - Message Preview: ${creationNotification.message.slice(0, 90)}...`);
    } else {
      throw new Error('❌ [FLOW A FAILED]: Account Creation Notification record not found in DB!');
    }

    // ==========================================================
    // TEST FLOW B: Complaint Submission Flow
    // ==========================================================
    console.log('\n--- [FLOW B]: Testing Complaint Submission & Customer Thank-You SMS ---');
    const complaintResult = await createPublicSubmission({
      qrToken: created.qrCode.publicToken,
      type: SUBMISSION_TYPE.COMPLAINT,
      customerName: 'Amina Customer',
      customerPhone: '0618887766',
      category: 'Service',
      message: 'The waiting time in the reception was over 50 minutes.',
    });

    console.log(`✅ Complaint submitted successfully: Ref #${complaintResult.referenceNumber}`);

    // Wait 1.5s for async notifications to insert
    await new Promise((r) => setTimeout(r, 1500));

    const complaintOrgNotification = await Notification.findOne({
      organizationId: created.organization._id,
      type: NOTIFICATION_TYPE.COMPLAINT,
      recipientType: 'ORGANIZATION',
    }).sort({ createdAt: -1 });

    const complaintCustomerNotification = await Notification.findOne({
      organizationId: created.organization._id,
      type: NOTIFICATION_TYPE.CUSTOMER_THANK_YOU,
      recipientType: 'CUSTOMER',
    }).sort({ createdAt: -1 });

    if (complaintOrgNotification) {
      console.log(`✅ [FLOW B - Org Notification PASSED]:`);
      console.log(`   - Org Recipient: ${complaintOrgNotification.recipient}`);
      console.log(`   - Label: ${complaintOrgNotification.type}`);
      console.log(`   - Message Preview:\n${complaintOrgNotification.message}`);
    } else {
      throw new Error('❌ [FLOW B FAILED]: Organization COMPLAINT notification not found!');
    }

    if (complaintCustomerNotification) {
      console.log(`✅ [FLOW B - Customer Thank-You SMS PASSED]:`);
      console.log(`   - Customer Recipient: ${complaintCustomerNotification.recipient}`);
      console.log(`   - Message: "${complaintCustomerNotification.message}"`);
      if (complaintCustomerNotification.message.includes('Thank you for sharing your feedback.')) {
        console.log(`   - Exact English Thank-You text verified ✅`);
      }
    } else {
      throw new Error('❌ [FLOW B FAILED]: Customer Thank-You SMS record not found!');
    }

    // ==========================================================
    // TEST FLOW C: Suggestion Submission Flow
    // ==========================================================
    console.log('\n--- [FLOW C]: Testing Suggestion Submission Flow ---');
    const suggestionResult = await createPublicSubmission({
      qrToken: created.qrCode.publicToken,
      type: SUBMISSION_TYPE.FEEDBACK,
      customerName: 'Farhan Suggester',
      customerPhone: '0615554433',
      category: 'Facilities',
      message: 'It would be great to add a water dispenser in the waiting lounge.',
      suggestedSolution: 'Install a bottled water cooler near room 3.',
    });

    console.log(`✅ Suggestion submitted successfully: Ref #${suggestionResult.referenceNumber}`);

    // Wait 1.5s for async notifications to insert
    await new Promise((r) => setTimeout(r, 1500));

    const suggestionOrgNotification = await Notification.findOne({
      organizationId: created.organization._id,
      type: NOTIFICATION_TYPE.SUGGESTION,
      recipientType: 'ORGANIZATION',
    }).sort({ createdAt: -1 });

    const suggestionCustomerNotification = await Notification.findOne({
      organizationId: created.organization._id,
      type: NOTIFICATION_TYPE.CUSTOMER_THANK_YOU,
      recipientType: 'CUSTOMER',
    }).sort({ createdAt: -1 });

    if (suggestionOrgNotification) {
      console.log(`✅ [FLOW C - Org Notification PASSED]:`);
      console.log(`   - Org Recipient: ${suggestionOrgNotification.recipient}`);
      console.log(`   - Label: ${suggestionOrgNotification.type} (distinct from COMPLAINT)`);
      console.log(`   - Message Preview:\n${suggestionOrgNotification.message}`);
    } else {
      throw new Error('❌ [FLOW C FAILED]: Organization SUGGESTION notification not found!');
    }

    if (suggestionCustomerNotification) {
      console.log(`✅ [FLOW C - Customer Thank-You SMS PASSED]:`);
      console.log(`   - Customer Recipient: ${suggestionCustomerNotification.recipient}`);
      console.log(`   - Message: "${suggestionCustomerNotification.message}"`);
    } else {
      throw new Error('❌ [FLOW C FAILED]: Customer Thank-You SMS record for suggestion not found!');
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test records from database...');
    await Organization.findByIdAndDelete(created.organization._id);
    await QRCode.deleteMany({ organizationId: created.organization._id });
    await CustomerSubmission.deleteMany({ organizationId: created.organization._id });
    await Notification.deleteMany({ organizationId: created.organization._id });
    console.log('✅ Cleanup completed.');

    console.log('\n======================================================');
    console.log('🎉 ALL 3 NOTIFICATION & MESSAGING FLOWS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    process.exit(1);
  }
};

runTests();
