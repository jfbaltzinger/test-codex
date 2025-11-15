import { test, expect, Page } from '@playwright/test';

const apiBase = 'http://localhost:3000/api';

const adminUser = {
  id: '99999999-9999-9999-9999-999999999999',
  email: 'admin@studiofit.test',
  firstName: 'Amandine',
  lastName: 'Dupont',
  role: 'admin' as const,
  credits: 0
};

const performLogin = async (page: Page) => {
  await page.route(`${apiBase}/auth/login`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'admin-access-token',
        user: adminUser
      })
    });
  });

  await page.route(`${apiBase}/auth/profile`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(adminUser)
    });
  });

  await page.route(`${apiBase}/admin/dashboard`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalBookings: 32,
        revenue: 2450,
        creditsSold: 120,
        occupancyRate: 78,
        activeMembers: 86,
        upcomingSessions: 9
      })
    });
  });

  await page.route(`${apiBase}/admin/occupancy`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'snapshot-1',
          courseName: 'Pilates avancé',
          sessionDate: new Date().toISOString(),
          bookedSpots: 9,
          capacity: 10
        }
      ])
    });
  });

  await page.goto('/login');
  await page.getByLabel('Adresse e-mail').fill(adminUser.email);
  await page.getByLabel('Mot de passe').fill('AdminSecret1!');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByText('Tableau de bord administrateur')).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.route(`${apiBase}/auth/refresh`, async route => {
    await route.fulfill({ status: 401, contentType: 'application/json', body: '{}' });
  });
});

test('admin login grants access to the dashboard', async ({ page }) => {
  await performLogin(page);
  await expect(page.getByText('StudioFit Admin')).toBeVisible();
  await expect(page.getByText('Réservations confirmées')).toBeVisible();
});

test('admin can register a new member from the members page', async ({ page }) => {
  await performLogin(page);

  const members: any[] = [];
  await page.route(`${apiBase}/admin/members`, async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(members)
      });
      return;
    }

    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON();
      expect(payload).toMatchObject({
        firstName: 'Marie',
        lastName: 'Curie',
        email: 'marie.curie@example.com'
      });

      const createdMember = {
        id: 'member-1',
        joinedAt: new Date('2024-02-01T09:00:00Z').toISOString(),
        ...payload
      };
      members.push(createdMember);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(createdMember)
      });
    }
  });

  await page.goto('/members');
  await page.getByRole('button', { name: 'Nouvel adhérent' }).click();
  await page.getByLabel('Prénom').fill('Marie');
  await page.getByLabel('Nom').fill('Curie');
  await page.getByLabel('Email').fill('marie.curie@example.com');
  await page.getByLabel('Téléphone').fill('0601020304');
  await page.getByLabel('Crédits').fill('8');
  await page.getByRole('combobox', { name: 'Type d’adhésion' }).selectOption('premium');
  await page.getByRole('button', { name: 'Créer' }).click();

  await expect(page.getByRole('row', { name: /Marie Curie/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /premium/ })).toContainText('8');
});

test('admin can top up credits for an existing member', async ({ page }) => {
  await performLogin(page);

  let member = {
    id: 'member-42',
    firstName: 'Léo',
    lastName: 'Martin',
    email: 'leo.martin@example.com',
    phone: '0600000000',
    status: 'active',
    credits: 4,
    membershipType: 'standard',
    joinedAt: new Date('2024-01-10T08:00:00Z').toISOString()
  };

  await page.route(`${apiBase}/admin/members`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([member])
    });
  });

  await page.route(`${apiBase}/admin/members/${member.id}`, async route => {
    if (route.request().method() === 'PUT') {
      const payload = route.request().postDataJSON();
      expect(payload).toMatchObject({ credits: 14 });
      member = { ...member, ...payload };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(member)
      });
      return;
    }

    await route.fulfill({ status: 204 });
  });

  await page.goto('/members');
  await page.getByRole('row', { name: /Léo Martin/ }).getByRole('button', { name: 'Modifier' }).click();
  await page.getByLabel('Crédits').fill('14');
  await page.getByRole('button', { name: 'Mettre à jour' }).click();

  await expect(page.getByRole('row', { name: /Léo Martin/ })).toContainText('14');
});

test('admin can schedule and cancel a session', async ({ page }) => {
  await performLogin(page);

  const courses = [
    { id: 'course-1', name: 'Yoga Energie', coach: 'Sophie', category: 'Bien-être', capacity: 12 }
  ];
  let sessions: any[] = [];

  await page.route(`${apiBase}/admin/courses`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(courses)
    });
  });

  await page.route(`${apiBase}/admin/sessions`, async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sessions)
      });
      return;
    }

    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON();
      expect(payload).toMatchObject({ courseId: 'course-1', capacity: 18 });
      const createdSession = {
        id: 'session-101',
        enrolled: 0,
        status: 'scheduled',
        ...payload
      };
      sessions = [createdSession];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(createdSession)
      });
    }
  });

  await page.route(`${apiBase}/admin/sessions/session-101/cancel`, async route => {
    expect(route.request().method()).toBe('POST');
    sessions = [];
    await route.fulfill({ status: 204 });
  });

  await page.goto('/courses');
  await page.getByRole('button', { name: 'Programmer une session' }).click();
  await page.getByLabel('Début').fill('2024-06-10T09:00');
  await page.getByLabel('Fin').fill('2024-06-10T10:00');
  const capacityInput = page.getByLabel('Capacité');
  await capacityInput.fill('18');
  await page.getByRole('button', { name: 'Enregistrer' }).click();

  await expect(page.getByRole('row', { name: /Yoga Energie/ })).toBeVisible();
  await page.getByRole('row', { name: /Yoga Energie/ }).getByRole('button', { name: 'Annuler' }).click();
  await page.getByRole('button', { name: 'Annuler la session' }).click();

  await expect(page.getByText('Aucune session programmée n’a été trouvée.')).toBeVisible();
});
