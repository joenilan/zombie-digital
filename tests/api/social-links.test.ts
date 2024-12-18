import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { prisma } from "@/lib/prisma";

describe("Social Links API", () => {
  let testUser: {
    id: string;
    platform: string;
    url: string;
    title: string;
  };

  // Create test twitch user before tests
  beforeAll(async () => {
    // Create twitch user and get its ID
    const twitchUser = await prisma.twitch_users.create({
      data: {
        username: "testuser",
        display_name: "Test User",
      },
    });

    // Set up test user with the created twitch user's ID
    testUser = {
      id: twitchUser.id,
      platform: "twitter",
      url: "https://twitter.com/test",
      title: "Test Link",
    };
  });

  // Clean up after tests
  afterAll(async () => {
    await prisma.social_tree.deleteMany({
      where: { user_id: testUser.id },
    });
    await prisma.twitch_users.delete({
      where: { id: testUser.id },
    });
  });

  test("POST /api/social-links - creates a new social link", async () => {
    const response = await fetch("http://localhost:3000/api/social-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: testUser.id,
        platform: testUser.platform,
        url: testUser.url,
        title: testUser.title,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user_id).toBe(testUser.id);
    expect(data.platform).toBe(testUser.platform);
  });

  test("GET /api/social-links - gets user's social links", async () => {
    const response = await fetch(
      `http://localhost:3000/api/social-links?userId=${testUser.id}`
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("PUT /api/social-links/reorder - reorders links", async () => {
    // First create multiple links
    const links = await prisma.social_tree.createMany({
      data: [
        {
          user_id: testUser.id,
          platform: "twitter",
          url: "url1",
          order_index: 0,
        },
        {
          user_id: testUser.id,
          platform: "youtube",
          url: "url2",
          order_index: 1,
        },
      ],
    });

    // Get the created links
    const existingLinks = await prisma.social_tree.findMany({
      where: { user_id: testUser.id },
    });

    // Reorder them
    const response = await fetch(
      "http://localhost:3000/api/social-links/reorder",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          links: [{ id: existingLinks[1].id }, { id: existingLinks[0].id }],
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data[0].order_index).toBe(0);
    expect(data[1].order_index).toBe(1);
  });

  test("DELETE /api/social-links/:id - deletes a link", async () => {
    // Create a link to delete
    const link = await prisma.social_tree.create({
      data: {
        user_id: testUser.id,
        platform: "test",
        url: "test-url",
        order_index: 0,
      },
    });

    const response = await fetch(
      `http://localhost:3000/api/social-links/${link.id}`,
      {
        method: "DELETE",
      }
    );

    expect(response.status).toBe(200);

    // Verify deletion
    const deletedLink = await prisma.social_tree.findUnique({
      where: { id: link.id },
    });
    expect(deletedLink).toBeNull();
  });
});
