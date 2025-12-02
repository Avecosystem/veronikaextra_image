
// services/backendApi.ts
import { User, ApiResponse, PaymentRequest, CryptoPaymentTransaction, UpiPaymentTransaction, CreditPlan, ContactDetail, CreditHistory } from '../types';
import { INITIAL_CREDITS, IMAGE_COST, ADMIN_CREDENTIALS, DEFAULT_COUNTRY, CREDIT_PLANS, FIXED_USD_TO_INR_RATE, OXPAY_MERCHANT_ID } from '../constants';
import { generateImages } from './imageGenerationService';
import { buildApiUrl } from '../utils/apiUtils';

interface MockUser extends User {
  passwordHash?: string;
}

interface StoredData {
  users: MockUser[];
  sessions: { [token: string]: number }; // token -> userId
  paymentRequests: PaymentRequest[]; // UPI payment requests
  cryptoPaymentTransactions: CryptoPaymentTransaction[]; // OXPAY crypto payment transactions
  upiPaymentTransactions: UpiPaymentTransaction[]; // Auto UPI transactions (gateway initiated)
  creditHistory: CreditHistory[]; // Credit history entries
  nextUserId: number;
  nextPaymentRequestId: number; // For UPI payment request IDs
  nextCryptoTransactionId: number; // For Crypto transaction IDs
  nextUpiTransactionId: number; // For UPI auto transaction IDs
  nextCreditHistoryId: number; // For Credit history entries
  globalNotice: string;
  creditsPageNotice: string; // New: Notice specifically for the credits page
  creditPlans: CreditPlan[]; // New: Dynamic credit plans managed by admin
  contactDetails: ContactDetail[]; // New: Contact details managed by admin
  termsOfService: string; // New: Terms of Service content
  privacyPolicy: string; // New: Privacy Policy content
  socialMediaLinks: {
    instagram: string;
    twitter: string;
    globe: string;
    chain: string;
  }; // New: Social media links
  deviceCredits: {  // New: Track device credits usage
    [deviceId: string]: {
      timestamp: number;
      userId: number;
    }
  };
}

const STORAGE_KEY = 'veronikaextra_mock_db';

// Helper to simulate network latency for DB operations - Reduced for speed
const simulateLatency = (ms: number = 100): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getStoredData = (): StoredData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsedData: StoredData = JSON.parse(data);
    // Ensure new fields are initialized if old data format exists
    if (!parsedData.paymentRequests) parsedData.paymentRequests = [];
    if (!parsedData.nextPaymentRequestId) parsedData.nextPaymentRequestId = 1;
    if (!parsedData.cryptoPaymentTransactions) parsedData.cryptoPaymentTransactions = [];
    if (!parsedData.upiPaymentTransactions) parsedData.upiPaymentTransactions = [];
    if (!parsedData.nextCryptoTransactionId) parsedData.nextCryptoTransactionId = 1;
    if (!parsedData.nextUpiTransactionId) parsedData.nextUpiTransactionId = 1;
    if (!parsedData.creditHistory) parsedData.creditHistory = []; // Initialize creditHistory
    if (!parsedData.nextCreditHistoryId) parsedData.nextCreditHistoryId = 1; // Initialize nextCreditHistoryId
    if (!parsedData.globalNotice) parsedData.globalNotice = ''; // Initialize globalNotice
    if (!parsedData.creditsPageNotice) parsedData.creditsPageNotice = ''; // Initialize creditsPageNotice
    if (!parsedData.creditPlans) parsedData.creditPlans = CREDIT_PLANS; // Initialize with constant plans
    if (!parsedData.contactDetails) parsedData.contactDetails = []; // Initialize contactDetails
    if (!parsedData.termsOfService) parsedData.termsOfService = ''; // Initialize termsOfService
    if (!parsedData.privacyPolicy) parsedData.privacyPolicy = ''; // Initialize privacyPolicy
    if (!parsedData.socialMediaLinks) parsedData.socialMediaLinks = {
      instagram: '',
      twitter: '',
      globe: '',
      chain: ''
    }; // Initialize socialMediaLinks
    if (!parsedData.deviceCredits) parsedData.deviceCredits = {}; // Initialize deviceCredits
    parsedData.users = parsedData.users.map(user => ({ // Ensure all users have a country and isAdmin
      ...user,
      country: user.country || DEFAULT_COUNTRY, // Default existing users to 'India' or your chosen default
      isAdmin: user.isAdmin ?? false, // Default isAdmin to false if not present
    }));
    return parsedData;
  }
  return {
    users: [],
    sessions: {},
    paymentRequests: [],
    cryptoPaymentTransactions: [],
    upiPaymentTransactions: [],
    creditHistory: [], // Initialize creditHistory
    nextUserId: 1,
    nextPaymentRequestId: 1,
    nextCryptoTransactionId: 1,
    nextUpiTransactionId: 1,
    nextCreditHistoryId: 1, // Initialize nextCreditHistoryId
    globalNotice: '',
    creditsPageNotice: '', // Default empty
    creditPlans: CREDIT_PLANS, // Initialize with constant values
    contactDetails: [], // Initialize with empty array
    termsOfService: '', // Default empty
    privacyPolicy: '', // Default empty
    socialMediaLinks: {
      instagram: '',
      twitter: '',
      globe: '',
      chain: ''
    }, // Default empty links
    deviceCredits: {} // Default empty device credits tracking
  };
};

const saveStoredData = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

const generateToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Initialize admin user if not present, or update if credentials changed
const initializeAdminUser = () => {
  const data = getStoredData();
  // Check for an admin with the exact configured email
  let adminUser = data.users.find(user => user.email === ADMIN_CREDENTIALS.email);

  if (!adminUser) {
    // Admin doesn't exist, create new
    const newAdminUser: MockUser = {
      id: data.nextUserId++,
      name: 'Admin',
      email: ADMIN_CREDENTIALS.email,
      passwordHash: ADMIN_CREDENTIALS.password, // In a real app, this would be hashed
      credits: 999999, // Admin has unlimited credits
      createdAt: new Date().toISOString(),
      isAdmin: true,
      country: DEFAULT_COUNTRY, // Default country for admin
    };
    data.users.push(newAdminUser);
    saveStoredData(data);
  } else {
    // Admin exists, ensure password and admin status are up to date
    let updated = false;
    if (adminUser.passwordHash !== ADMIN_CREDENTIALS.password) {
      adminUser.passwordHash = ADMIN_CREDENTIALS.password;
      updated = true;
    }
    if (!adminUser.isAdmin) {
      adminUser.isAdmin = true;
      updated = true;
    }
    if (updated) {
      saveStoredData(data);
    }
  }
};
initializeAdminUser(); // Run on service load

// Helper to check if a user is admin
const isAdminUser = (userId: number): boolean => {
  const data = getStoredData();
  const user = data.users.find(u => u.id === userId);
  return user ? user.isAdmin === true : false;
};

// Helper to add credit history entry
const addCreditHistoryEntry = (data: StoredData, userId: number, amount: number, type: 'added' | 'deducted', description?: string) => {
  const newEntry: CreditHistory = {
    id: data.nextCreditHistoryId++,
    userId: userId,
    amount: amount,
    type: type,
    createdAt: new Date().toISOString(),
    description: description
  };
  data.creditHistory.push(newEntry);
};

export const backendApi = {
  async register(name: string, email: string, passwordHash: string, country: string, deviceId?: string): Promise<ApiResponse<User>> {
    await simulateLatency();
    const data = getStoredData();

    if (data.users.some((user) => user.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }

    // Check if device has already received free credits
    let initialCredits = INITIAL_CREDITS;
    if (deviceId && data.deviceCredits[deviceId]) {
      // Device has been used before, no free credits
      console.log(`Device ${deviceId} has already received free credits, granting 0 credits`);
      initialCredits = 0;
    } else if (deviceId) {
      // Mark device as used
      console.log(`Granting free credits to device ${deviceId}`);
      data.deviceCredits[deviceId] = {
        timestamp: Date.now(),
        userId: data.nextUserId
      };
    }

    const newUser: MockUser = {
      id: data.nextUserId++,
      name,
      email,
      passwordHash,
      credits: initialCredits,
      createdAt: new Date().toISOString(),
      isAdmin: false,
      country: country, // Use the provided country
    };
    data.users.push(newUser);
    saveStoredData(data);

    // Auto-login after registration
    const token = generateToken();
    data.sessions[token] = newUser.id;
    saveStoredData(data);

    const userProfile: User = { ...newUser };
    delete (userProfile as MockUser).passwordHash; // Explicitly cast to MockUser for deletion

    return { success: true, data: userProfile, token };
  },

  async login(email: string, passwordHash: string): Promise<ApiResponse<User>> {
    await simulateLatency();
    const data = getStoredData();
    const user = data.users.find(
      (u) => u.email === email && u.passwordHash === passwordHash,
    );

    if (!user) {
      return { success: false, message: 'Invalid credentials.' };
    }

    const token = generateToken();
    data.sessions[token] = user.id;
    saveStoredData(data);

    const userProfile: User = { ...user };
    delete (userProfile as MockUser).passwordHash; // Explicitly cast to MockUser for deletion

    return { success: true, data: userProfile, token };
  },

  async getProfile(token: string): Promise<ApiResponse<User>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const user = data.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const userProfile: User = { ...user };
    delete (userProfile as MockUser).passwordHash; // Explicitly cast to MockUser for deletion
    return { success: true, data: userProfile };
  },

  async generateImage(token: string, prompt: string, numberOfImages: number = 1): Promise<ApiResponse<{ images: string[], newCredits: number }>> {
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const userIndex = data.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const user = data.users[userIndex];
    // Validate number of images (1-6)
    const validImageCount = Math.max(1, Math.min(6, numberOfImages));

    // We check if they have enough credits for the REQUESTED amount
    const requiredCredits = IMAGE_COST * validImageCount;

    if (user.credits < requiredCredits) {
      return { success: false, message: 'Insufficient credits.' };
    }

    try {
      // Client-side parallelization: Make multiple requests to the backend
      // This avoids the Netlify Function 10s timeout limit
      const requests = Array.from({ length: validImageCount }, () =>
        generateImages(prompt, 1) // Request 1 image at a time
      );

      const results = await Promise.allSettled(requests);

      const imageObjects: any[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          const imgs = result.value;
          if (Array.isArray(imgs)) {
            imgs.forEach((img: any) => {
              if (img && (typeof img.url === "string" || typeof img.b64_json === "string")) {
                imageObjects.push(img);
              }
            });
          }
        }
      });

      // FAIR BILLING: Only charge for images that were successfully generated
      const generatedCount = imageObjects.length;

      if (generatedCount === 0) {
        // If ALL failed, return the first error message we found
        const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
        if (firstError) {
          return { success: false, message: firstError.reason.message || 'Failed to generate images.' };
        }

        // If no rejected promises but still no images (e.g. all returned null/undefined but resolved), try to find a reason
        return { success: false, message: 'Failed to generate images. No valid data returned from server.' };
      }

      const actualCost = IMAGE_COST * generatedCount;

      // Deduct credits based on actual generated images
      data.users[userIndex].credits -= actualCost;
      const newCredits = data.users[userIndex].credits;

      // Add to credit history
      const historyEntry: CreditHistory = {
        id: data.nextCreditHistoryId++,
        userId: userId,
        type: 'deducted',
        amount: actualCost,
        createdAt: new Date().toISOString(),
        description: `Generated ${generatedCount} image(s)`
      };
      data.creditHistory.push(historyEntry);

      saveStoredData(data);

      // Extract URLs from image objects
      const imageUrls = imageObjects.map(img => img.url || img.b64_json);

      return {
        success: true,
        data: {
          images: imageUrls,
          newCredits: newCredits
        }
      };
    } catch (error: any) {
      console.error("Image Generation Error:", error);
      return { success: false, message: error.message || 'Failed to generate images. Please try again.' };
    }
  },

  async addCredits(token: string, userIdToAdd: number, amount: number): Promise<ApiResponse<User>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const userIndex = data.users.findIndex((u) => u.id === userIdToAdd);
    if (userIndex === -1) {
      return { success: false, message: 'Target user not found.' };
    }

    data.users[userIndex].credits += amount;
    addCreditHistoryEntry(data, userIdToAdd, amount, 'added', 'Admin added credits');
    saveStoredData(data);

    const updatedUser: User = { ...data.users[userIndex] };
    delete (updatedUser as MockUser).passwordHash; // Explicitly cast to MockUser for deletion
    return { success: true, data: updatedUser };
  },

  async submitPaymentRequest(token: string, plan: string, credits: number, amount: number, utrCode: string, date: string, note?: string): Promise<ApiResponse<{ message: string }>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const newPaymentRequest: PaymentRequest = {
      id: data.nextPaymentRequestId++,
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      plan: plan,
      credits: credits, // Store explicit credits for robust processing
      amount: amount,
      utrCode: utrCode,
      date: date,
      note: note,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    data.paymentRequests.push(newPaymentRequest);
    saveStoredData(data);

    return { success: true, data: { message: 'Payment request submitted. Awaiting admin approval.' } };
  },

  async submitCryptoPaymentIntent(token: string, orderId: string, credits: number, amount: number, returnUrl: string): Promise<ApiResponse<{ message: string; paymentUrl?: string }>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const newCryptoTransaction: CryptoPaymentTransaction = {
      id: data.nextCryptoTransactionId++,
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      orderId: orderId,
      credits: credits,
      amount: amount,
      currency: 'USD',
      gateway: 'OXPAY',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    data.cryptoPaymentTransactions.push(newCryptoTransaction);
    saveStoredData(data);

    try {
      const apiResponse = await fetch(buildApiUrl('/oxapay-intent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          credits,
          amount,
          returnUrl,
          email: user.email,
          name: user.name
        })
      });

      const result = await apiResponse.json();

      if (apiResponse.ok && result.payLink) {
        return {
          success: true,
          data: { message: 'Crypto payment intent recorded. Redirecting...', paymentUrl: result.payLink }
        };
      }
      return { success: false, message: result.message || 'Payment Gateway Error' };

    } catch (error) {
      console.error('Oxapay Intent Error:', error);
      return { success: false, message: 'Failed to connect to payment gateway. Please try again later.' };
    }
  },

  async submitUpiPaymentIntent(token: string, orderId: string, credits: number, amountInInr: number, returnUrl: string): Promise<ApiResponse<{ message: string; paymentUrl?: string }>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const newUpiTx: UpiPaymentTransaction = {
      id: data.nextUpiTransactionId++,
      userId,
      userName: user.name,
      userEmail: user.email,
      orderId,
      credits,
      amount: amountInInr,
      currency: 'INR',
      gateway: 'UPI',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    data.upiPaymentTransactions.push(newUpiTx);
    saveStoredData(data);

    try {
      const apiResponse = await fetch(buildApiUrl('/upi-intent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: amountInInr,
          returnUrl,
          email: user.email,
          name: user.name
        })
      });

      const result = await apiResponse.json();
      if (apiResponse.ok && result.payLink) {
        return { success: true, data: { message: 'UPI payment intent created. Redirecting...', paymentUrl: result.payLink } };
      }
      return { success: false, message: result.message || 'Payment Gateway Error' };
    } catch (error) {
      console.error('UPI Intent Error:', error);
      return { success: false, message: 'Failed to connect to UPI gateway. Please try again later.' };
    }
  },

  async verifyUpiPayment(token: string, orderId: string, status: 'success' | 'PAID' | 'SUCCESS' | 'failed' | 'cancelled'): Promise<ApiResponse<{ newCredits: number }>> {
    await simulateLatency(300);
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const txIndex = data.upiPaymentTransactions.findIndex(t => t.orderId === orderId && t.userId === userId);
    if (txIndex === -1) {
      return { success: false, message: 'UPI payment transaction not found or not initiated by this user.' };
    }

    const tx = data.upiPaymentTransactions[txIndex];
    if (tx.status === 'completed') {
      const user = data.users.find(u => u.id === tx.userId);
      return { success: true, data: { newCredits: user?.credits || 0 }, message: 'Payment already processed.' };
    }

    const isSuccess = status === 'success' || status === 'PAID' || status === 'SUCCESS';
    if (isSuccess) {
      const userIndex = data.users.findIndex(u => u.id === tx.userId);
      if (userIndex === -1) {
        return { success: false, message: 'User associated with transaction not found.' };
      }
      data.users[userIndex].credits += tx.credits;
      addCreditHistoryEntry(data, tx.userId, tx.credits, 'added', `UPI payment completed: ${tx.credits} credits`);
      tx.status = 'completed';
      tx.completedAt = new Date().toISOString();
      saveStoredData(data);
      return { success: true, data: { newCredits: data.users[userIndex].credits }, message: 'Credits added successfully!' };
    } else {
      if (status === 'failed' || status === 'cancelled') {
        tx.status = status;
        tx.completedAt = new Date().toISOString();
        saveStoredData(data);
      }
      return { success: false, message: `UPI payment status: ${status}.` };
    }
  },

  async verifyOxapayPayment(token: string, orderId: string, oxapayStatus: 'success' | 'failed' | 'cancelled' | 'paid' | 'confirming'): Promise<ApiResponse<{ newCredits: number }>> {
    await simulateLatency(500); // Slightly reduced
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const transactionIndex = data.cryptoPaymentTransactions.findIndex(t => t.orderId === orderId && t.userId === userId);

    if (transactionIndex === -1) {
      return { success: false, message: 'Crypto payment transaction not found or not initiated by this user.' };
    }

    const transaction = data.cryptoPaymentTransactions[transactionIndex];

    if (transaction.status === 'completed') {
      const user = data.users.find(u => u.id === transaction.userId);
      return { success: true, data: { newCredits: user?.credits || 0 }, message: 'Payment already processed.' };
    }

    if (oxapayStatus === 'success' || oxapayStatus === 'paid' || oxapayStatus === 'confirming') {
      const userIndex = data.users.findIndex(u => u.id === transaction.userId);
      if (userIndex === -1) {
        return { success: false, message: 'User associated with transaction not found.' };
      }

      data.users[userIndex].credits += transaction.credits;
      // Add credit history entry
      addCreditHistoryEntry(data, transaction.userId, transaction.credits, 'added', `Crypto payment completed: ${transaction.credits} credits`);
      transaction.status = 'completed';
      transaction.completedAt = new Date().toISOString();
      saveStoredData(data);
      return { success: true, data: { newCredits: data.users[userIndex].credits }, message: 'Credits added successfully!' };
    } else {
      if (oxapayStatus === 'failed' || oxapayStatus === 'cancelled') {
        transaction.status = oxapayStatus;
        transaction.completedAt = new Date().toISOString();
        saveStoredData(data);
      }
      return { success: false, message: `Crypto payment status: ${oxapayStatus}.` };
    }
  },

  async getAllUsers(token: string): Promise<ApiResponse<User[]>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const users = data.users.map(u => {
      const userProfile: User = { ...u };
      delete (userProfile as MockUser).passwordHash;
      return userProfile;
    });
    return { success: true, data: users };
  },

  async updateUserCreditsAdmin(token: string, targetUserId: number, newCredits: number): Promise<ApiResponse<User>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const userIndex = data.users.findIndex(u => u.id === targetUserId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const oldCredits = data.users[userIndex].credits;
    const creditDifference = newCredits - oldCredits;

    data.users[userIndex].credits = newCredits;

    // Add credit history entry
    if (creditDifference !== 0) {
      const type = creditDifference > 0 ? 'added' : 'deducted';
      const amount = Math.abs(creditDifference);
      addCreditHistoryEntry(data, targetUserId, amount, type, `Admin manually updated credits`);
    }

    saveStoredData(data);

    const updatedUser: User = { ...data.users[userIndex] };
    delete (updatedUser as MockUser).passwordHash;
    return { success: true, data: updatedUser, message: 'Credits updated successfully.' };
  },

  async deleteUser(token: string, userIdToDelete: number): Promise<ApiResponse<{ message: string }>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    if (userIdToDelete === adminId) {
      return { success: false, message: 'Cannot delete your own admin account.' };
    }

    const userExists = data.users.some(u => u.id === userIdToDelete);
    if (!userExists) {
      return { success: false, message: 'User not found.' };
    }

    data.users = data.users.filter(u => u.id !== userIdToDelete);
    Object.keys(data.sessions).forEach(key => {
      if (data.sessions[key] === userIdToDelete) {
        delete data.sessions[key];
      }
    });
    saveStoredData(data);
    return { success: true, data: { message: 'User deleted successfully.' } };
  },

  async getAllPaymentRequests(token: string): Promise<ApiResponse<PaymentRequest[]>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }
    return { success: true, data: data.paymentRequests };
  },

  async getAllCryptoPaymentTransactions(token: string): Promise<ApiResponse<CryptoPaymentTransaction[]>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }
    return { success: true, data: data.cryptoPaymentTransactions };
  },

  async getAllUpiPaymentTransactions(token: string): Promise<ApiResponse<UpiPaymentTransaction[]>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];
    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }
    return { success: true, data: data.upiPaymentTransactions };
  },

  async approvePaymentRequest(token: string, requestId: number): Promise<ApiResponse<{ message: string }>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const requestIndex = data.paymentRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Payment request not found.' };
    }

    const request = data.paymentRequests[requestIndex];
    if (request.status !== 'pending') {
      return { success: false, message: 'Payment request already processed.' };
    }

    const userIndex = data.users.findIndex(u => u.id === request.userId);
    if (userIndex === -1) {
      return { success: false, message: 'User associated with request not found.' };
    }

    let creditsToAdd = Number(request.credits);
    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      const creditsMatch = request.plan.match(/(\d+)\s*Credits/i);
      creditsToAdd = creditsMatch ? parseInt(creditsMatch[1], 10) : 0;
    }

    if (creditsToAdd > 0) {
      data.users[userIndex].credits = (data.users[userIndex].credits || 0) + creditsToAdd;
      // Add credit history entry
      addCreditHistoryEntry(data, request.userId, creditsToAdd, 'added', `Payment approved: ${request.plan}`);
    }

    data.paymentRequests[requestIndex].status = 'approved';
    saveStoredData(data);

    const message = creditsToAdd > 0
      ? `Payment request approved. ${creditsToAdd} credits added to user.`
      : 'Payment request approved (No specific credits found to add).';

    return { success: true, data: { message } };
  },

  async rejectPaymentRequest(token: string, requestId: number): Promise<ApiResponse<{ message: string }>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const requestIndex = data.paymentRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      return { success: false, message: 'Payment request not found.' };
    }

    const request = data.paymentRequests[requestIndex];
    if (request.status !== 'pending') {
      return { success: false, message: 'Payment request already processed.' };
    }

    data.paymentRequests[requestIndex].status = 'rejected';
    saveStoredData(data);
    return { success: true, data: { message: 'Payment request rejected.' } };
  },

  async getGlobalNotice(): Promise<ApiResponse<string>> {
    await simulateLatency(50);
    const data = getStoredData();
    return { success: true, data: data.globalNotice };
  },

  async setGlobalNotice(token: string, message: string): Promise<ApiResponse<string>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.globalNotice = message;
    saveStoredData(data);
    return { success: true, data: message, message: 'Global notice updated successfully.' };
  },

  async getCreditsPageNotice(): Promise<ApiResponse<string>> {
    await simulateLatency(50);
    const data = getStoredData();
    return { success: true, data: data.creditsPageNotice };
  },

  async setCreditsPageNotice(token: string, message: string): Promise<ApiResponse<string>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.creditsPageNotice = message;
    saveStoredData(data);
    return { success: true, data: message, message: 'Credits page notice updated successfully.' };
  },

  async getAvailableCreditPlans(): Promise<ApiResponse<CreditPlan[]>> {
    await simulateLatency(50);
    const data = getStoredData();
    return { success: true, data: data.creditPlans };
  },

  async getAdminCreditPlans(token: string): Promise<ApiResponse<CreditPlan[]>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }
    return { success: true, data: data.creditPlans };
  },

  async updateAdminCreditPlan(token: string, planId: number, updatedCredits: number, updatedInrPrice: number, updatedUsdPrice: number): Promise<ApiResponse<CreditPlan>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    const planIndex = data.creditPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) {
      return { success: false, message: 'Credit plan not found.' };
    }

    data.creditPlans[planIndex] = {
      ...data.creditPlans[planIndex],
      credits: updatedCredits,
      inrPrice: updatedInrPrice,
      usdPrice: updatedUsdPrice,
    };
    saveStoredData(data);

    return { success: true, data: data.creditPlans[planIndex], message: 'Credit plan updated successfully.' };
  },

  async getUserPaymentRequests(token: string): Promise<ApiResponse<PaymentRequest[]>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const userRequests = data.paymentRequests.filter(req => req.userId === userId);
    return { success: true, data: userRequests };
  },

  async getUserCryptoTransactions(token: string): Promise<ApiResponse<CryptoPaymentTransaction[]>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const userTransactions = data.cryptoPaymentTransactions.filter(tx => tx.userId === userId);
    return { success: true, data: userTransactions };
  },

  async getUserUpiTransactions(token: string): Promise<ApiResponse<UpiPaymentTransaction[]>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];
    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }
    const userTx = data.upiPaymentTransactions.filter(tx => tx.userId === userId);
    return { success: true, data: userTx };
  },

  async getUserCreditHistory(token: string): Promise<ApiResponse<CreditHistory[]>> {
    await simulateLatency();
    const data = getStoredData();
    const userId = data.sessions[token];

    if (!userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    const userCreditHistory = data.creditHistory.filter(entry => entry.userId === userId);
    // Sort by createdAt descending (newest first)
    userCreditHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, data: userCreditHistory };
  },

  async getAllCreditHistory(token: string): Promise<ApiResponse<CreditHistory[]>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    // Sort by createdAt descending (newest first)
    const sortedHistory = [...data.creditHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, data: sortedHistory };
  },

  logout(token: string): void {
    const data = getStoredData();
    delete data.sessions[token];
    saveStoredData(data);
  },

  // New methods for contact details management
  async getContactDetails(): Promise<ApiResponse<ContactDetail[]>> {
    await simulateLatency(50);
    const data = getStoredData();
    return { success: true, data: data.contactDetails };
  },

  async saveContactDetails(token: string, contacts: ContactDetail[]): Promise<ApiResponse<ContactDetail[]>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.contactDetails = contacts;
    saveStoredData(data);
    return { success: true, data: contacts, message: 'Contact details updated successfully.' };
  },

  // New methods for Terms of Service management
  async getTermsOfService(): Promise<ApiResponse<string>> {
    await simulateLatency(50);
    const data = getStoredData();
    return { success: true, data: data.termsOfService };
  },

  async setTermsOfService(token: string, content: string): Promise<ApiResponse<string>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.termsOfService = content;
    saveStoredData(data);
    return { success: true, data: content, message: 'Terms of Service updated successfully.' };
  },

  // New methods for Privacy Policy management
  async getPrivacyPolicy(): Promise<ApiResponse<string>> {
    await simulateLatency(50);
    const data = getStoredData();
    return { success: true, data: data.privacyPolicy };
  },

  async setPrivacyPolicy(token: string, content: string): Promise<ApiResponse<string>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.privacyPolicy = content;
    saveStoredData(data);
    return { success: true, data: content, message: 'Privacy Policy updated successfully.' };
  },

  // New methods for Social Media Links management
  async getSocialMediaLinks(): Promise<ApiResponse<{ instagram: string; twitter: string; globe: string; chain: string }>> {
    await simulateLatency(50);
    const data = getStoredData();
    return { success: true, data: data.socialMediaLinks };
  },

  async setSocialMediaLinks(token: string, links: { instagram: string; twitter: string; globe: string; chain: string }): Promise<ApiResponse<{ instagram: string; twitter: string; globe: string; chain: string }>> {
    await simulateLatency();
    const data = getStoredData();
    const adminId = data.sessions[token];

    if (!adminId || !isAdminUser(adminId)) {
      return { success: false, message: 'Forbidden: Admin access required.' };
    }

    data.socialMediaLinks = links;
    saveStoredData(data);
    return { success: true, data: links, message: 'Social media links updated successfully.' };
  },
};
