require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

const DEADLINE = '2026-05-31';
const PASS     = 'Demo@1234';

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 5,
});

async function createUser(db, { name, email, bio, initials }) {
    const hash = await bcrypt.hash(PASS, 10);
    const [r] = await db.query(
        'INSERT INTO users (name, email, password, bio, avatar_initials) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [name, email, hash, bio, initials]
    );
    return r.insertId;
}

async function createTeam(db, { name, joinCode, createdBy }) {
    const [r] = await db.query(
        'INSERT INTO teams (name, join_code, created_by) VALUES (?,?,?) ON DUPLICATE KEY UPDATE team_id=LAST_INSERT_ID(team_id)',
        [name, joinCode, createdBy]
    );
    return r.insertId;
}

async function addMember(db, teamId, userId, role = 'member') {
    await db.query('INSERT IGNORE INTO team_members (team_id, user_id, role) VALUES (?,?,?)', [teamId, userId, role]);
}

async function createTask(db, { title, description, priority, assignedBy, assignedTo, parentId }) {
    const [r] = await db.query(
        'INSERT INTO tasks (title, description, priority, status, assigned_by, assigned_to, parent_task_id, due_date) VALUES (?,?,?,?,?,?,?,?)',
        [title, description, priority, 'pending', assignedBy, assignedTo, parentId || null, DEADLINE]
    );
    return r.insertId;
}

async function notify(db, userId, message, refId) {
    await db.query(
        'INSERT INTO notifications (user_id, type, message, ref_id) VALUES (?,?,?,?)',
        [userId, 'task_assigned', message, refId]
    );
}

// ─── CASE 1: Corporate — NexaCorp Q2 Product Launch ───────────────────────────
// Delegation: CEO → VP Eng → Tech Lead → Developer
//             CEO → VP Mktg → Copywriter → Social Exec
async function seedCorporate(db) {
    console.log('\n[1/3] Seeding NexaCorp (Corporate Product Launch)...');

    const priya  = await createUser(db, { name: 'Priya Sharma',  email: 'priya.sharma@nexacorp.com',  bio: 'CEO @ NexaCorp. Driving the Q2 product launch.',        initials: 'PS' });
    const arjun  = await createUser(db, { name: 'Arjun Mehta',   email: 'arjun.mehta@nexacorp.com',   bio: 'VP Engineering. Owns all technical deliverables.',      initials: 'AM' });
    const ananya = await createUser(db, { name: 'Ananya Gupta',  email: 'ananya.gupta@nexacorp.com',  bio: 'VP Marketing. Responsible for launch campaign.',       initials: 'AG' });
    const meera  = await createUser(db, { name: 'Meera Iyer',    email: 'meera.iyer@nexacorp.com',    bio: 'Tech Lead — Backend Platform Team.',                   initials: 'MI' });
    const rohan  = await createUser(db, { name: 'Rohan Das',     email: 'rohan.das@nexacorp.com',     bio: 'Senior Backend Developer.',                            initials: 'RD' });
    const devK   = await createUser(db, { name: 'Dev Kapoor',    email: 'dev.kapoor@nexacorp.com',    bio: 'Senior Copywriter and Content Strategist.',            initials: 'DK' });
    const ishaan = await createUser(db, { name: 'Ishaan Verma',  email: 'ishaan.verma@nexacorp.com',  bio: 'Social Media Executive.',                             initials: 'IV' });

    const tid = await createTeam(db, { name: 'NexaCorp — Q2 Launch', joinCode: 'NEXA2026', createdBy: priya });
    for (const [uid, role] of [[priya,'admin'],[arjun,'member'],[ananya,'member'],[meera,'member'],[rohan,'member'],[devK,'member'],[ishaan,'member']]) {
        await addMember(db, tid, uid, role);
    }

    // L1: CEO owns top-level task (self-assigned as orchestrator)
    const t1 = await createTask(db, { title: 'Ship Q2 Product v2.0', description: 'Full product launch by end of May. Coordinate all engineering and marketing workstreams.', priority: 'high', assignedBy: priya, assignedTo: priya });

    // L2: CEO delegates to VP Engineering
    const t2 = await createTask(db, { title: 'Deliver scalable API layer for v2.0', description: 'Redesign REST endpoints, add pagination, rate limiting, and OpenAPI docs.', priority: 'high', assignedBy: priya, assignedTo: arjun, parentId: t1 });
    await notify(db, arjun, 'Priya Sharma assigned: "Deliver scalable API layer for v2.0"', t2);

    // L3: VP Engineering delegates to Tech Lead
    const t3 = await createTask(db, { title: 'Implement /tasks and /notes endpoints', description: 'Build paginated GET, POST, PATCH, DELETE. Write unit tests. 100% coverage target.', priority: 'high', assignedBy: arjun, assignedTo: meera, parentId: t2 });
    await notify(db, meera, 'Arjun Mehta assigned: "Implement /tasks and /notes endpoints"', t3);

    // L4: Tech Lead delegates to Developer
    const t4 = await createTask(db, { title: 'Build notes CRUD + write integration tests', description: 'Notes API: create, read, update, delete with auth. Jest integration tests required.', priority: 'high', assignedBy: meera, assignedTo: rohan, parentId: t3 });
    await notify(db, rohan, 'Meera Iyer assigned: "Build notes CRUD + write integration tests"', t4);

    // L2: CEO delegates to VP Marketing
    const t5 = await createTask(db, { title: 'Execute Q2 Launch Campaign', description: 'Multi-channel campaign. Budget: 5L. Target 500K impressions by May 31.', priority: 'high', assignedBy: priya, assignedTo: ananya, parentId: t1 });
    await notify(db, ananya, 'Priya Sharma assigned: "Execute Q2 Launch Campaign"', t5);

    // L3: VP Marketing delegates to Copywriter
    const t6 = await createTask(db, { title: 'Write launch copy and press kit', description: 'Landing page copy, press release, email sequence, and social media captions for launch week.', priority: 'high', assignedBy: ananya, assignedTo: devK, parentId: t5 });
    await notify(db, devK, 'Ananya Gupta assigned: "Write launch copy and press kit"', t6);

    // L4: Copywriter delegates to Social Exec
    const t7 = await createTask(db, { title: 'Schedule 30 social posts for launch week', description: 'Use approved copy. Schedule on LinkedIn, Twitter/X, Instagram. Confirm with Ananya before publishing.', priority: 'medium', assignedBy: devK, assignedTo: ishaan, parentId: t6 });
    await notify(db, ishaan, 'Dev Kapoor assigned: "Schedule 30 social posts for launch week"', t7);

    console.log('    Done: 7 users, 7 tasks — 4-level delegation chain (CEO -> VP -> Lead -> Exec).');
}

// ─── CASE 2: Creative Agency — Lumen Studio Brand X Rebrand ──────────────────
// Delegation: Creative Director → Art Director → Visual Designer
//             Creative Director → Copywriting Lead → Junior Copywriter
async function seedAgency(db) {
    console.log('\n[2/3] Seeding Lumen Studio (Creative Agency Campaign)...');

    const zara  = await createUser(db, { name: 'Zara Khan',       email: 'zara.khan@lumenstudio.in',      bio: 'Creative Director @ Lumen Studio. Leading Brand X rebrand pitch.',   initials: 'ZK' });
    const kabir = await createUser(db, { name: 'Kabir Rathore',   email: 'kabir.rathore@lumenstudio.in',  bio: 'Art Director. Visual identity and UI/UX lead.',                      initials: 'KR' });
    const preet = await createUser(db, { name: 'Preet Kaur',      email: 'preet.kaur@lumenstudio.in',     bio: 'Senior Visual Designer. Illustration and brand assets specialist.',  initials: 'PK' });
    const naina = await createUser(db, { name: 'Naina Bose',      email: 'naina.bose@lumenstudio.in',     bio: 'Copywriting Lead. Brand voice, tone-of-voice, and messaging.',       initials: 'NB' });
    const sidhu = await createUser(db, { name: 'Siddharth Roy',   email: 'siddharth.roy@lumenstudio.in',  bio: 'Junior Copywriter. Creative content, scripts, and social copy.',     initials: 'SR' });

    const tid = await createTeam(db, { name: 'Lumen Studio — Brand X Rebrand', joinCode: 'LUMEN26', createdBy: zara });
    for (const [uid, role] of [[zara,'admin'],[kabir,'member'],[preet,'member'],[naina,'member'],[sidhu,'member']]) {
        await addMember(db, tid, uid, role);
    }

    // L1: Creative Director owns the master deliverable
    const t1 = await createTask(db, { title: 'Brand X Full Rebrand — Final Delivery', description: 'Complete visual identity system + messaging guide. Client presentation May 30.', priority: 'high', assignedBy: zara, assignedTo: zara });

    // L2: CD → Art Director (visual stream)
    const t2 = await createTask(db, { title: 'Design visual identity system', description: 'Logo suite, typography, colour palette, iconography, and brand usage guidelines booklet.', priority: 'high', assignedBy: zara, assignedTo: kabir, parentId: t1 });
    await notify(db, kabir, 'Zara Khan assigned: "Design visual identity system"', t2);

    // L3: Art Director → Visual Designer
    const t3 = await createTask(db, { title: 'Create logo variants and brand asset kit', description: 'Primary, secondary, monochrome logos. 24-icon set. Export SVG + PNG at 1x/2x/3x.', priority: 'high', assignedBy: kabir, assignedTo: preet, parentId: t2 });
    await notify(db, preet, 'Kabir Rathore assigned: "Create logo variants and brand asset kit"', t3);

    // L2: CD → Copywriting Lead (messaging stream)
    const t4 = await createTask(db, { title: 'Develop Brand X messaging guide', description: 'Brand voice, tone-of-voice document, tagline options, and 5 core messaging pillars.', priority: 'high', assignedBy: zara, assignedTo: naina, parentId: t1 });
    await notify(db, naina, 'Zara Khan assigned: "Develop Brand X messaging guide"', t4);

    // L3: Copy Lead → Junior Copywriter
    const t5 = await createTask(db, { title: 'Draft 5 tagline options with rationale', description: 'Research competitor positioning. Write 5 taglines with 100-word rationale each. Submit for Naina review.', priority: 'medium', assignedBy: naina, assignedTo: sidhu, parentId: t4 });
    await notify(db, sidhu, 'Naina Bose assigned: "Draft 5 tagline options with rationale"', t5);

    console.log('    Done: 5 users, 5 tasks — 3-level delegation chain (CD -> Lead -> Specialist).');
}

// ─── CASE 3: University — IIT ML Research Lab DST Grant ──────────────────────
// Delegation: Principal Investigator → PhD Supervisors → Research Assistants
async function seedResearch(db) {
    console.log('\n[3/3] Seeding IIT ML Research Lab (University Research Team)...');

    const rao    = await createUser(db, { name: 'Prof. R.K. Rao',    email: 'rk.rao@iitresearch.edu',        bio: 'Principal Investigator. ML and NLP lab funded by DST Grant 2025.',    initials: 'RR' });
    const leena  = await createUser(db, { name: 'Dr. Leena Pillai',  email: 'leena.pillai@iitresearch.edu',  bio: 'PhD Supervisor — NLP stream. Published 3 papers this year.',           initials: 'LP' });
    const farhan = await createUser(db, { name: 'Dr. Farhan Sheikh', email: 'farhan.sheikh@iitresearch.edu', bio: 'PhD Supervisor — Computer Vision. COCO benchmark expert.',            initials: 'FS' });
    const aditya = await createUser(db, { name: 'Aditya Nair',       email: 'aditya.nair@iitresearch.edu',   bio: 'Research Assistant (NLP). Building sentiment analysis models.',        initials: 'AN' });
    const simran = await createUser(db, { name: 'Simran Batra',      email: 'simran.batra@iitresearch.edu',  bio: 'Research Assistant (CV). Object detection and dataset curation.',     initials: 'SB' });

    const tid = await createTeam(db, { name: 'IIT ML Lab — DST Grant 2025', joinCode: 'IITLAB26', createdBy: rao });
    for (const [uid, role] of [[rao,'admin'],[leena,'member'],[farhan,'member'],[aditya,'member'],[simran,'member']]) {
        await addMember(db, tid, uid, role);
    }

    // L1: PI owns the grant report
    const t1 = await createTask(db, { title: 'Submit DST Mid-Term Research Report', description: 'Compile NLP + CV results. 40-page report submitted to DST portal by May 31.', priority: 'high', assignedBy: rao, assignedTo: rao });

    // L2: PI → NLP Supervisor
    const t2 = await createTask(db, { title: 'Finalise NLP stream results and analysis', description: 'Benchmark sentiment model on IMDB, SemEval, SST-2. Write 15-page results section.', priority: 'high', assignedBy: rao, assignedTo: leena, parentId: t1 });
    await notify(db, leena, 'Prof. R.K. Rao assigned: "Finalise NLP stream results and analysis"', t2);

    // L3: NLP Supervisor → Research Assistant
    const t3 = await createTask(db, { title: 'Run BERT benchmarks on 3 NLP datasets', description: 'Fine-tune BERT-base on IMDB, SemEval, SST-2. Log F1, Precision, Recall per epoch. Upload CSV results.', priority: 'high', assignedBy: leena, assignedTo: aditya, parentId: t2 });
    await notify(db, aditya, 'Dr. Leena Pillai assigned: "Run BERT benchmarks on 3 NLP datasets"', t3);

    // L2: PI → CV Supervisor
    const t4 = await createTask(db, { title: 'Finalise CV stream results and analysis', description: 'Object detection mAP benchmarks on COCO val2017. Write 15-page results section.', priority: 'high', assignedBy: rao, assignedTo: farhan, parentId: t1 });
    await notify(db, farhan, 'Prof. R.K. Rao assigned: "Finalise CV stream results and analysis"', t4);

    // L3: CV Supervisor → Research Assistant
    const t5 = await createTask(db, { title: 'Curate and annotate 2000-image validation set', description: 'Use CVAT annotation tool. Export YOLO format labels. Validate with Dr. Farhan before upload to Drive.', priority: 'high', assignedBy: farhan, assignedTo: simran, parentId: t4 });
    await notify(db, simran, 'Dr. Farhan Sheikh assigned: "Curate and annotate 2000-image validation set"', t5);

    console.log('    Done: 5 users, 5 tasks — 3-level delegation chain (PI -> Supervisor -> Research Assistant).');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('TaskFlow Demo Seeder');
    console.log('DB:', process.env.DB_NAME, '@', process.env.DB_HOST + ':' + process.env.DB_PORT);

    let db;
    try {
        db = await pool.getConnection();
        await seedCorporate(db);
        await seedAgency(db);
        await seedResearch(db);

        console.log('\n===== ALL 3 CASE STUDIES SEEDED =====');
        console.log('Password for ALL demo accounts: Demo@1234\n');
        console.log('--- Case 1: NexaCorp (Corporate) ---');
        console.log('priya.sharma@nexacorp.com   | CEO');
        console.log('arjun.mehta@nexacorp.com    | VP Engineering');
        console.log('ananya.gupta@nexacorp.com   | VP Marketing');
        console.log('meera.iyer@nexacorp.com     | Tech Lead');
        console.log('rohan.das@nexacorp.com      | Backend Developer');
        console.log('dev.kapoor@nexacorp.com     | Senior Copywriter');
        console.log('ishaan.verma@nexacorp.com   | Social Media Exec');
        console.log('\n--- Case 2: Lumen Studio (Creative Agency) ---');
        console.log('zara.khan@lumenstudio.in         | Creative Director');
        console.log('kabir.rathore@lumenstudio.in     | Art Director');
        console.log('preet.kaur@lumenstudio.in        | Visual Designer');
        console.log('naina.bose@lumenstudio.in        | Copywriting Lead');
        console.log('siddharth.roy@lumenstudio.in     | Junior Copywriter');
        console.log('\n--- Case 3: IIT Research Lab ---');
        console.log('rk.rao@iitresearch.edu           | Principal Investigator');
        console.log('leena.pillai@iitresearch.edu     | PhD Supervisor (NLP)');
        console.log('farhan.sheikh@iitresearch.edu    | PhD Supervisor (CV)');
        console.log('aditya.nair@iitresearch.edu      | Research Assistant (NLP)');
        console.log('simran.batra@iitresearch.edu     | Research Assistant (CV)');

    } catch (err) {
        console.error('\nSeeder failed:', err.message);
        console.error(err);
        process.exit(1);
    } finally {
        if (db) db.release();
        await pool.end();
    }
}

main();
