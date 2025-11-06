import { PrismaClient, Role, BikeType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create pricing rule
  const pricing = await prisma.pricingRule.create({
    data: {
      perMinute: 2.0,
      perKm: 5.0,
      unlockFee: 10.0,
      minBalanceRequired: 50.0,
      latePenaltyPerMin: 5.0,
      offDockPenalty: 100.0
    }
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'sreekarchimbili@gmail.com',
      name: 'Chimbili Sreekar',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      kycStatus: 'APPROVED',
      phone: '8888656557',
      location: 'Chandigarh University',
      wallet: { create: { balance: 1000 } }
    }
    
  });

  // Create 5 sample users
  const users = [];
  const userNames = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown'];
  const studentPassword = await bcrypt.hash('student123', 12);
  
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `student${i + 1}@college.edu`,
        name: userNames[i],
        passwordHash: studentPassword,
        role: Role.STUDENT,
        kycStatus: 'APPROVED',
        studentId: `STU00${i + 1}`,
        wallet: { create: { balance: 150 + (i * 50) } }
      }
    });
    users.push(user);
  }

  // Create technician
  const techPassword = await bcrypt.hash('tech123', 12);
  const technician = await prisma.user.create({
    data: {
      email: 'tech@college.edu',
      name: 'Tech Support',
      passwordHash: techPassword,
      role: Role.TECHNICIAN,
      kycStatus: 'APPROVED',
      studentId: 'TECH001',
      wallet: { create: { balance: 0 } }
    }
  });

  // Create docks at Chandigarh University
  const docks = await Promise.all([
    prisma.dock.create({
      data: { name: 'Main Library', lat: 30.7687902, lng: 76.5753719, capacity: 20 }
    }),
    prisma.dock.create({
      data: { name: 'Engineering Block', lat: 30.7697902, lng: 76.5763719, capacity: 25 }
    }),
    prisma.dock.create({
      data: { name: 'Student Center', lat: 30.7677902, lng: 76.5743719, capacity: 15 }
    }),
    prisma.dock.create({
      data: { name: 'Sports Complex', lat: 30.7707902, lng: 76.5773719, capacity: 18 }
    }),
    prisma.dock.create({
      data: { name: 'Hostel Area', lat: 30.7667902, lng: 76.5733719, capacity: 22 }
    })
  ]);

  // Create 50 bikes
  const bikes = [];
  for (let i = 0; i < 50; i++) {
    const dock = docks[i % docks.length];
    const bike = await prisma.bike.create({
      data: {
        type: i % 5 === 0 ? BikeType.E_BIKE : BikeType.STANDARD,
        dockId: dock.id,
        batteryPct: i % 5 === 0 ? Math.floor(Math.random() * 100) + 1 : null,
        lat: dock.lat + (Math.random() - 0.5) * 0.001,
        lng: dock.lng + (Math.random() - 0.5) * 0.001
      }
    });
    bikes.push(bike);
  }

  // Create sample transactions for users
  for (const user of users) {
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (wallet) {
      // Top-up transactions
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOPUP',
          amount: 200,
          status: 'COMPLETED'
        }
      });
      
      // Some ride charges
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'CHARGE',
          amount: 25.50,
          status: 'COMPLETED'
        }
      });
      
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'CHARGE',
          amount: 18.00,
          status: 'COMPLETED'
        }
      });
    }
  }

  // Create sample rides
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const bike = bikes[i];
    const startDock = docks[i % docks.length];
    const endDock = docks[(i + 1) % docks.length];
    
    await prisma.ride.create({
      data: {
        userId: user.id,
        bikeId: bike.id,
        startDockId: startDock.id,
        endDockId: endDock.id,
        startedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        duration: 30,
        distance: 2.5,
        cost: 25.50
      }
    });
  }

  // Create sample maintenance ticket
  await prisma.maintenanceTicket.create({
    data: {
      bikeId: bikes[0].id,
      createdBy: admin.id,
      assignedTo: technician.id,
      title: 'Brake adjustment needed',
      notes: 'Front brake is loose and needs adjustment'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@college.edu / admin123');
  console.log('🎓 Students: student1@college.edu to student5@college.edu / student123');
  console.log('🔧 Technician: tech@college.edu / tech123');
  console.log(`📊 Created: 1 admin, 5 students, 1 technician, 50 bikes, ${docks.length} docks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });