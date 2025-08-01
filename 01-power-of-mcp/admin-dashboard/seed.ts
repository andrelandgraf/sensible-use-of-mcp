import { db } from './lib/db';
import { applications, logs, traces } from './lib/schema';

const generateCorrelationId = () => crypto.randomUUID();

async function seed() {
  console.log('🧘 Starting mindful database seeding...');

  try {
    // Seed Applications
    console.log('🌱 Planting application seeds...');
    
    const seedApps = await db.insert(applications).values([
      { name: 'yoga-frontend' },
      { name: 'yoga-backend' },
      { name: 'meditation-api' },
      { name: 'chakra-scheduler' },
      { name: 'mindfulness-tracker' },
      { name: 'zen-garden-cms' }
    ]).returning();

    console.log(`🌿 Grew ${seedApps.length} peaceful applications`);

    // Generate correlation IDs for different "sessions"
    const correlationIds = Array.from({ length: 17 }, () => generateCorrelationId());

    // Seed Logs
    console.log('📝 Writing mindful log entries...');
    
    const sampleLogs = [
      // Yoga Frontend logs
      { message: 'User successfully achieved tree pose 🌳', type: 'info', applicationId: seedApps[0].id, correlationId: correlationIds[0] },
      { message: 'Downward dog component rendered without wobbling', type: 'debug', applicationId: seedApps[0].id, correlationId: correlationIds[1] },
      { message: 'Warning: User attempting crow pose without proper warm-up', type: 'warn', applicationId: seedApps[0].id, correlationId: correlationIds[2] },
      { message: 'Error: Warrior III pose caused frontend to lose balance', type: 'error', applicationId: seedApps[0].id, correlationId: correlationIds[2] },
      { message: 'Yoga mat component successfully unrolled', type: 'info', applicationId: seedApps[0].id, correlationId: correlationIds[3] },
      
      // Yoga Backend logs  
      { message: 'Namaste authentication successful', type: 'info', applicationId: seedApps[1].id, correlationId: correlationIds[0] },
      { message: 'Database connection as stable as mountain pose', type: 'info', applicationId: seedApps[1].id, correlationId: correlationIds[4] },
      { message: 'Warning: Lotus position timeout after 30 minutes', type: 'warn', applicationId: seedApps[1].id, correlationId: correlationIds[5] },
      { message: 'Error: Failed to find inner peace in connection pool', type: 'error', applicationId: seedApps[1].id, correlationId: correlationIds[6] },
      { message: 'Breathing technique API call completed mindfully', type: 'debug', applicationId: seedApps[1].id, correlationId: correlationIds[4] },
      
      // Meditation API logs
      { message: 'Om frequency calibrated to 432Hz', type: 'info', applicationId: seedApps[2].id, correlationId: correlationIds[7] },
      { message: 'Meditation timer started with gentle bell sound', type: 'debug', applicationId: seedApps[2].id, correlationId: correlationIds[8] },
      { message: 'Warning: Monkey mind detected, initiating focus protocol', type: 'warn', applicationId: seedApps[2].id, correlationId: correlationIds[9] },
      { message: 'Error: Enlightenment service temporarily unavailable', type: 'error', applicationId: seedApps[2].id, correlationId: correlationIds[9] },
      { message: 'Chakra alignment check completed successfully', type: 'info', applicationId: seedApps[2].id, correlationId: correlationIds[7] },
      
      // Chakra Scheduler logs
      { message: 'Root chakra scheduled for grounding at 6am', type: 'info', applicationId: seedApps[3].id, correlationId: correlationIds[10] },
      { message: 'Heart chakra appointment synchronized with cosmic energy', type: 'debug', applicationId: seedApps[3].id, correlationId: correlationIds[11] },
      { message: 'Warning: Crown chakra overbooked, experiencing spiritual traffic', type: 'warn', applicationId: seedApps[3].id, correlationId: correlationIds[12] },
      { message: 'Error: Third eye chakra crashed while viewing future appointments', type: 'error', applicationId: seedApps[3].id, correlationId: correlationIds[12] },
      
      // Mindfulness Tracker logs
      { message: 'Mindful moment detected: User stopped to smell roses', type: 'info', applicationId: seedApps[4].id, correlationId: correlationIds[13] },
      { message: 'Gratitude counter incremented by 3 blessings', type: 'debug', applicationId: seedApps[4].id, correlationId: correlationIds[14] },
      { message: 'Warning: Stress levels rising faster than hot air balloon', type: 'warn', applicationId: seedApps[4].id, correlationId: correlationIds[14] },
      { message: 'Present moment awareness restored successfully', type: 'info', applicationId: seedApps[4].id, correlationId: correlationIds[13] },
      
      // Zen Garden CMS logs
      { message: 'Rock placement algorithm achieved perfect balance', type: 'info', applicationId: seedApps[5].id, correlationId: correlationIds[15] },
      { message: 'Sand patterns raked with digital precision', type: 'debug', applicationId: seedApps[5].id, correlationId: correlationIds[15] },
      { message: 'Error: Zen disrupted by aggressive content pushing', type: 'error', applicationId: seedApps[5].id, correlationId: correlationIds[16] }
    ];

    await db.insert(logs).values(sampleLogs.map(log => ({
      ...log,
      type: log.type as 'info' | 'warn' | 'error' | 'debug',
      context: { 
        environment: 'zen-garden', 
        mood: 'peaceful',
        breathingRate: Math.floor(Math.random() * 10) + 8
      }
    })));

    console.log(`🕯️ Inscribed ${sampleLogs.length} mindful log entries`);

    // Seed Traces
    console.log('🔍 Tracing the path to enlightenment...');
    
    const sampleTraces = [
      // Successful meditation flow
      { trace: 'user.login -> breathing.start -> meditation.begin -> enlightenment.achieved', applicationId: seedApps[2].id, correlationId: correlationIds[7] },
      { trace: 'pose.attempt -> balance.lost -> graceful.fall -> lesson.learned', applicationId: seedApps[0].id, correlationId: correlationIds[2] },
      { trace: 'chakra.root -> chakra.sacral -> chakra.solar -> chakra.heart -> overflow.detected', applicationId: seedApps[3].id, correlationId: correlationIds[10] },
      { trace: 'mindfulness.start -> present.moment -> awareness.expanded -> wisdom.gained', applicationId: seedApps[4].id, correlationId: correlationIds[13] },
      { trace: 'api.namaste -> auth.peaceful -> session.established -> karma.balanced', applicationId: seedApps[1].id, correlationId: correlationIds[0] },
      { trace: 'content.create -> zen.check -> publish.gently -> harmony.maintained', applicationId: seedApps[5].id, correlationId: correlationIds[15] },
      
      // Error traces
      { trace: 'warrior3.attempt -> balance.wobble -> crash.gracefully -> debug.mindfully', applicationId: seedApps[0].id, correlationId: correlationIds[2] },
      { trace: 'enlightenment.seek -> service.unavailable -> patience.practice -> retry.peacefully', applicationId: seedApps[2].id, correlationId: correlationIds[9] },
      { trace: 'third_eye.open -> future.overload -> crash.cosmic -> reboot.spiritually', applicationId: seedApps[3].id, correlationId: correlationIds[12] },
      { trace: 'stress.monitor -> levels.spike -> breathing.activate -> calm.restore', applicationId: seedApps[4].id, correlationId: correlationIds[14] },
      { trace: 'content.aggressive -> zen.disrupted -> balance.lost -> meditation.required', applicationId: seedApps[5].id, correlationId: correlationIds[16] },
      
      // Debug traces
      { trace: 'downward_dog.render -> component.stable -> pose.maintained -> tail.wag', applicationId: seedApps[0].id, correlationId: correlationIds[1] },
      { trace: 'breathing.api -> rhythm.steady -> oxygen.optimized -> clarity.enhanced', applicationId: seedApps[1].id, correlationId: correlationIds[4] },
      { trace: 'meditation.timer -> bell.gentle -> focus.deepened -> serenity.achieved', applicationId: seedApps[2].id, correlationId: correlationIds[8] },
      { trace: 'gratitude.count -> blessings.received -> joy.incremented -> heart.opened', applicationId: seedApps[4].id, correlationId: correlationIds[14] },
      { trace: 'sand.rake -> patterns.create -> beauty.manifest -> peace.radiated', applicationId: seedApps[5].id, correlationId: correlationIds[15] }
    ];

    await db.insert(traces).values(sampleTraces.map(trace => ({
      ...trace,
      context: { 
        session: 'mindful-debugging',
        technique: 'loving-kindness',
        breathwork: 'box-breathing'
      }
    })));

    console.log(`🎋 Traced ${sampleTraces.length} peaceful code journeys`);

    console.log('✨ Database seeding completed with mindful intentions');
    console.log('🙏 May your logs be ever peaceful and your traces lead to wisdom');
    
  } catch (error) {
    console.error('💥 Error occurred during seeding (even Buddha had bad days):', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('🧘‍♀️ Seeding meditation complete. Namaste.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('🌪️ Seeding disrupted the cosmic balance:', error);
    process.exit(1);
  }); 