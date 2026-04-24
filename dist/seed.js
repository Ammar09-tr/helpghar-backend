"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpghar';
async function seed() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    await db.collection('users').deleteMany({});
    await db.collection('technicians').deleteMany({});
    await db.collection('bookings').deleteMany({});
    await db.collection('offers').deleteMany({});
    await db.collection('messages').deleteMany({});
    await db.collection('commissions').deleteMany({});
    console.log('🗑️  Collections cleared');
    const hash = async (pw) => bcrypt.hash(pw, 12);
    const now = new Date();
    const admin = await db.collection('users').insertOne({
        fullName: 'HelpGhar Admin', email: 'admin@helpghar.com',
        phone: '+923000000001', password: await hash('Password@123'),
        role: 'admin', isActive: true, totalBookings: 0, averageRating: 0, totalRatings: 0, createdAt: now, updatedAt: now,
    });
    console.log('✅ Admin created: admin@helpghar.com / Password@123');
    const customer = await db.collection('users').insertOne({
        fullName: 'Ali Hassan', email: 'ali@example.com',
        phone: '+923001111111', password: await hash('Password@123'),
        role: 'customer', isActive: true, totalBookings: 0, averageRating: 0, totalRatings: 0, createdAt: now, updatedAt: now,
    });
    console.log('✅ Customer created: ali@example.com / Password@123');
    const techUser = await db.collection('users').insertOne({
        fullName: 'Imran Khan (Electrician)', email: 'imran@example.com',
        phone: '+923002222222', password: await hash('Password@123'),
        role: 'technician', isActive: true, totalBookings: 0, averageRating: 4.5, totalRatings: 12, createdAt: now, updatedAt: now,
    });
    await db.collection('technicians').insertOne({
        user: techUser.insertedId, skill: 'electrician',
        cnic: '36302-1234567-1', status: 'approved',
        availability: 'offline', isCommissionLocked: false,
        pendingCommission: 0, totalEarnings: 45000, totalJobs: 12,
        averageRating: 4.5, totalRatings: 12,
        yearsOfExperience: 5, bio: 'Expert in 3-phase wiring, solar panel installation, and electrical fault finding.',
        activeBooking: null, createdAt: now, updatedAt: now,
    });
    console.log('✅ Technician created: imran@example.com / Password@123 (approved)');
    const pendingUser = await db.collection('users').insertOne({
        fullName: 'Kamran Plumber', email: 'kamran@example.com',
        phone: '+923003333333', password: await hash('Password@123'),
        role: 'technician', isActive: true, totalBookings: 0, averageRating: 0, totalRatings: 0, createdAt: now, updatedAt: now,
    });
    await db.collection('technicians').insertOne({
        user: pendingUser.insertedId, skill: 'plumber',
        cnic: '36302-7654321-2', status: 'pending',
        availability: 'offline', isCommissionLocked: false,
        pendingCommission: 0, totalEarnings: 0, totalJobs: 0,
        averageRating: 0, totalRatings: 0, yearsOfExperience: 3,
        bio: 'Experienced plumber — pipe fitting, bathroom installation, leak repair.',
        activeBooking: null, createdAt: now, updatedAt: now,
    });
    console.log('✅ Pending technician: kamran@example.com / Password@123 (pending admin approval)');
    await mongoose.disconnect();
    console.log('\n🎉 Seed complete! All accounts use password: Password@123');
}
seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
//# sourceMappingURL=seed.js.map