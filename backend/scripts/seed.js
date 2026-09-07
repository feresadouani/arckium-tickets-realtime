/**
 * Seed MongoDB — données de test Arckium Tickets
 *
 * Usage (depuis backend/) :
 *   node scripts/seed.js
 *
 * Mot de passe commun pour tous les comptes : Test@1234
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'tickets';
const PASSWORD = 'Test@1234';

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`Connecté à ${MONGO_URI}/${DB_NAME}`);

  // Nettoyage des collections de démo (optionnel : commentez pour garder l'existant)
  await db.collection('users').deleteMany({});
  await db.collection('equipments').deleteMany({});
  await db.collection('ticket').deleteMany({});
  // TypeORM MongoDB peut nommer la collection "ticket" ou "tickets"
  await db.collection('tickets').deleteMany({});

  const hash = await bcrypt.hash(PASSWORD, 10);

  // ─── Utilisateurs ───────────────────────────────────────────
  const adminId = new ObjectId();
  const managerId = new ObjectId();
  const tech1Id = new ObjectId();
  const tech2Id = new ObjectId();
  const tech3Id = new ObjectId();
  const inactiveId = new ObjectId();

  const users = [
    {
      _id: adminId,
      firstname: 'Alice',
      lastname: 'Admin',
      email: 'admin@arckium.com',
      password: hash,
      role: 'admin',
      active: true,
    },
    {
      _id: managerId,
      firstname: 'Marc',
      lastname: 'Responsable',
      email: 'responsable@arckium.com',
      password: hash,
      role: 'responsable',
      active: true,
    },
    {
      _id: tech1Id,
      firstname: 'Samir',
      lastname: 'Technicien',
      email: 'technicien1@arckium.com',
      password: hash,
      role: 'technicien',
      active: true,
    },
    {
      _id: tech2Id,
      firstname: 'Leila',
      lastname: 'Benali',
      email: 'technicien2@arckium.com',
      password: hash,
      role: 'technicien',
      active: true,
    },
    {
      _id: tech3Id,
      firstname: 'Karim',
      lastname: 'Haddad',
      email: 'technicien3@arckium.com',
      password: hash,
      role: 'technicien',
      active: true,
    },
    {
      _id: inactiveId,
      firstname: 'Inactif',
      lastname: 'Compte',
      email: 'inactif@arckium.com',
      password: hash,
      role: 'technicien',
      active: false,
    },
  ];

  await db.collection('users').insertMany(users);
  console.log(`${users.length} utilisateurs insérés`);

  // ─── Équipements ────────────────────────────────────────────
  const eq1 = new ObjectId();
  const eq2 = new ObjectId();
  const eq3 = new ObjectId();
  const eq4 = new ObjectId();
  const eq5 = new ObjectId();
  const eq6 = new ObjectId();

  const equipments = [
    {
      _id: eq1,
      nom: 'CNC Mill #3',
      localisation: 'Atelier A — Étage 1',
      reference: 'EQ-CNC-003',
      active: true,
      date_creation: new Date('2026-01-10'),
    },
    {
      _id: eq2,
      nom: 'Conveyor B-12',
      localisation: 'Ligne production B',
      reference: 'EQ-CONV-012',
      active: true,
      date_creation: new Date('2026-01-12'),
    },
    {
      _id: eq3,
      nom: 'HVAC H-7',
      localisation: 'Bâtiment C — Toit',
      reference: 'EQ-HVAC-007',
      active: true,
      date_creation: new Date('2026-02-01'),
    },
    {
      _id: eq4,
      nom: 'Hydraulic Press P-2',
      localisation: 'Atelier A — Étage 2',
      reference: 'EQ-HYD-002',
      active: true,
      date_creation: new Date('2026-02-15'),
    },
    {
      _id: eq5,
      nom: 'Robot R-5',
      localisation: 'Cellule robotique 5',
      reference: 'EQ-ROB-005',
      active: true,
      date_creation: new Date('2026-03-01'),
    },
    {
      _id: eq6,
      nom: 'Boiler BS-1',
      localisation: 'Chaufferie',
      reference: 'EQ-BOIL-001',
      active: true,
      date_creation: new Date('2026-03-10'),
    },
  ];

  await db.collection('equipments').insertMany(equipments);
  console.log(`${equipments.length} équipements insérés`);

  // ─── Tickets ────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  const tickets = [
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-001',
      titre: 'Vibration anormale sur broche',
      description:
        'La CNC Mill #3 émet des vibrations fortes pendant l’usinage. Bruit métallique intermittent.',
      status: 'ouvert',
      urgence: 'elevee',
      technicien_id: null,
      equipment_id: String(eq1),
      created_by: 'Alice Admin',
      date_creation: daysAgo(1),
      date_assignation: null,
      date_resolution: null,
      comments: [
        {
          id: 'c-seed-001a',
          user_id: String(adminId),
          user_name: 'Alice Admin',
          user_role: 'admin',
          text: 'Ticket créé après inspection matinale. Priorité haute.',
          created_at: daysAgo(1),
        },
      ],
    },
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-002',
      titre: 'Convoyeur bloqué — section 3',
      description:
        'Le convoyeur B-12 s’arrête régulièrement. Capteur de présence suspect.',
      status: 'assigne',
      urgence: 'moyenne',
      technicien_id: String(tech1Id),
      equipment_id: String(eq2),
      created_by: 'Marc Responsable',
      date_creation: daysAgo(3),
      date_assignation: daysAgo(2),
      date_resolution: null,
      comments: [
        {
          id: 'c-seed-002a',
          user_id: String(managerId),
          user_name: 'Marc Responsable',
          user_role: 'responsable',
          text: 'Assigné à Samir. Merci de vérifier le capteur et le moteur.',
          created_at: daysAgo(2),
        },
        {
          id: 'c-seed-002b',
          user_id: String(tech1Id),
          user_name: 'Samir Technicien',
          user_role: 'technicien',
          text: 'J’ai commencé le diagnostic. Capteur semble oxydé.',
          created_at: daysAgo(1),
        },
      ],
    },
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-003',
      titre: 'Climatisation hors service',
      description: 'HVAC H-7 ne refroidit plus. Température atelier en hausse.',
      status: 'en_cours',
      urgence: 'elevee',
      technicien_id: String(tech2Id),
      equipment_id: String(eq3),
      created_by: 'Marc Responsable',
      date_creation: daysAgo(5),
      date_assignation: daysAgo(4),
      date_resolution: null,
      comments: [
        {
          id: 'c-seed-003a',
          user_id: String(tech2Id),
          user_name: 'Leila Benali',
          user_role: 'technicien',
          text: 'Fuite de fluide frigorigène détectée. Remplacement en cours.',
          created_at: daysAgo(3),
        },
        {
          id: 'c-seed-003b',
          user_id: String(managerId),
          user_name: 'Marc Responsable',
          user_role: 'responsable',
          text: 'OK, commande pièce validée. Tenez-nous informés.',
          created_at: daysAgo(2),
        },
        {
          id: 'c-seed-003c',
          user_id: String(tech2Id),
          user_name: 'Leila Benali',
          user_role: 'technicien',
          text: 'Pièce reçue. Intervention prévue demain matin.',
          created_at: daysAgo(1),
        },
      ],
    },
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-004',
      titre: 'Fuite hydraulique presse P-2',
      description: 'Fuite d’huile sous la presse. Sol glissant — risque sécurité.',
      status: 'resolu',
      urgence: 'elevee',
      technicien_id: String(tech1Id),
      equipment_id: String(eq4),
      created_by: 'Alice Admin',
      date_creation: daysAgo(10),
      date_assignation: daysAgo(9),
      date_resolution: daysAgo(7),
      comments: [
        {
          id: 'c-seed-004a',
          user_id: String(tech1Id),
          user_name: 'Samir Technicien',
          user_role: 'technicien',
          text: 'Joint remplacé. Test pression OK. Ticket résolu.',
          created_at: daysAgo(7),
        },
      ],
    },
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-005',
      titre: 'Robot R-5 — erreur axe 3',
      description: 'Code erreur E-AXIS-3 au démarrage. Arrêt automatique.',
      status: 'assigne',
      urgence: 'moyenne',
      technicien_id: String(tech3Id),
      equipment_id: String(eq5),
      created_by: 'Marc Responsable',
      date_creation: daysAgo(2),
      date_assignation: daysAgo(2),
      date_resolution: null,
      comments: [],
    },
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-006',
      titre: 'Entretien chaudière BS-1',
      description: 'Maintenance préventive trimestrielle de la chaudière.',
      status: 'cloture',
      urgence: 'faible',
      technicien_id: String(tech2Id),
      equipment_id: String(eq6),
      created_by: 'Alice Admin',
      date_creation: daysAgo(20),
      date_assignation: daysAgo(19),
      date_resolution: daysAgo(18),
      comments: [
        {
          id: 'c-seed-006a',
          user_id: String(tech2Id),
          user_name: 'Leila Benali',
          user_role: 'technicien',
          text: 'Entretien terminé. Rapport joint au dossier maintenance.',
          created_at: daysAgo(18),
        },
        {
          id: 'c-seed-006b',
          user_id: String(adminId),
          user_name: 'Alice Admin',
          user_role: 'admin',
          text: 'Clôturé. Merci.',
          created_at: daysAgo(17),
        },
      ],
    },
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-007',
      titre: 'Bruit anormal conveyor',
      description: 'Grincement côté gauche du convoyeur B-12.',
      status: 'ouvert',
      urgence: 'faible',
      technicien_id: null,
      equipment_id: String(eq2),
      created_by: 'Samir Technicien',
      date_creation: daysAgo(0),
      date_assignation: null,
      date_resolution: null,
      comments: [],
    },
    {
      _id: new ObjectId(),
      numero_ticket: 'TKT-2026-008',
      titre: 'Calibration CNC Mill #3',
      description: 'Recalibrage axes X/Y après changement d’outil.',
      status: 'en_cours',
      urgence: 'moyenne',
      technicien_id: String(tech1Id),
      equipment_id: String(eq1),
      created_by: 'Marc Responsable',
      date_creation: daysAgo(4),
      date_assignation: daysAgo(4),
      date_resolution: null,
      comments: [
        {
          id: 'c-seed-008a',
          user_id: String(tech1Id),
          user_name: 'Samir Technicien',
          user_role: 'technicien',
          text: 'Calibration X OK. Y en cours.',
          created_at: daysAgo(3),
        },
      ],
    },
  ];

  // TypeORM @Entity() sans nom → collection souvent "ticket"
  const ticketCollName = (await db.listCollections({ name: 'ticket' }).hasNext())
    ? 'ticket'
    : 'tickets';

  await db.collection(ticketCollName).insertMany(tickets);
  // Aussi dans l’autre nom au cas où
  if (ticketCollName === 'ticket') {
    // ok
  } else {
    // if neither existed, we used tickets; TypeORM default for class Ticket is often "ticket"
  }
  console.log(`${tickets.length} tickets insérés dans « ${ticketCollName} »`);

  // Si TypeORM utilise "ticket", s’assurer que les données y sont
  if (ticketCollName !== 'ticket') {
    await db.collection('ticket').deleteMany({});
    await db.collection('ticket').insertMany(tickets);
    console.log(`Copie aussi dans « ticket » (compat TypeORM)`);
  }

  await client.close();

  console.log('\n════════════════════════════════════════');
  console.log('  COMPTES DE TEST (mot de passe: Test@1234)');
  console.log('════════════════════════════════════════');
  console.log('  admin@arckium.com          → admin');
  console.log('  responsable@arckium.com    → responsable');
  console.log('  technicien1@arckium.com    → technicien (Samir)');
  console.log('  technicien2@arckium.com    → technicien (Leila)');
  console.log('  technicien3@arckium.com    → technicien (Karim)');
  console.log('  inactif@arckium.com        → technicien INACTIF');
  console.log('════════════════════════════════════════');
  console.log('Seed terminé.\n');
}

seed().catch((err) => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
