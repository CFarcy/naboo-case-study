import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { BaseAppModule } from '../app.module';
import { TestModule, closeInMongodConnection } from '../test/test.module';

describe('Auth throttling', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, BaseAppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });

  it('rate-limits the login mutation past the per-IP limit', async () => {
    const loginMutation = `
      mutation {
        login(signInInput:{ email: "${randomUUID()}@test.com", password: "wrong" }) {
          access_token
        }
      }
    `;

    const responses = [];
    for (let i = 0; i < 7; i++) {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: loginMutation });
      responses.push(res);
    }

    const throttled = responses.filter((r) =>
      JSON.stringify(r.body).includes('ThrottlerException'),
    );

    expect(throttled.length).toBeGreaterThan(0);
  });
});
