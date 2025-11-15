import request from 'supertest';
import app from '../../src/app';
import { reservationsStore } from '../../src/utils/stores';

describe('API end-to-end scenarios', () => {
  const adminCredentials = { email: 'admin@example.com', password: 'AdminSecret1!' };
  const memberCredentials = { email: 'member@example.com', password: 'MemberSecret1!' };
  const packId = '44444444-4444-4444-4444-444444444444';
  const sessionId = '55555555-5555-5555-5555-555555555555';

  it('covers registration, login, credits purchase, reservation lifecycle and admin access', async () => {
    const adminRegister = await request(app)
      .post('/api/auth/register')
      .send({ ...adminCredentials, role: 'admin' })
      .expect(201);

    expect(adminRegister.body).toMatchObject({ email: adminCredentials.email, role: 'admin' });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send(adminCredentials)
      .expect(200);

    const adminToken = adminLogin.body.accessToken as string;
    expect(adminToken).toBeDefined();

    await request(app)
      .post('/api/admin/packs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        id: packId,
        name: 'Pack Intensif',
        credits: 10,
        price: 99
      })
      .expect(201);

    await request(app)
      .post('/api/admin/sessions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        id: sessionId,
        title: 'HIIT du matin',
        startsAt: new Date().toISOString(),
        durationMinutes: 45,
        instructor: 'Alex'
      })
      .expect(201);

    await request(app)
      .post('/api/auth/register')
      .send(memberCredentials)
      .expect(201);

    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send(memberCredentials)
      .expect(200);

    const memberToken = memberLogin.body.accessToken as string;

    const purchase = await request(app)
      .post('/api/credits/purchase')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ packId })
      .expect(200);

    expect(purchase.body).toMatchObject({ balance: 10 });

    const reservationResponse = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ sessionId })
      .expect(201);

    const reservationId = reservationResponse.body.id as string;
    expect(reservationResponse.body).toMatchObject({ sessionId, status: 'confirmed' });

    await request(app)
      .delete(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(204);

    const updatedReservation = reservationsStore.findById(reservationId);
    expect(updatedReservation?.status).toBe('cancelled');

    await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);

    const adminList = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminList.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: adminCredentials.email, role: 'admin' })
      ])
    );
  });

  it('prevents purchasing credits or booking when resources are missing', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(memberCredentials)
      .expect(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send(memberCredentials)
      .expect(200);

    const token = login.body.accessToken as string;

    await request(app)
      .post('/api/credits/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ packId })
      .expect(404);

    await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionId })
      .expect(404);
  });
});
